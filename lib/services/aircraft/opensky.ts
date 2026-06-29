/**
 * OpenSky Network Provider Implementation
 *
 * Official aircraft data provider for PlaneSpotter Cloud.
 * Handles OAuth2 authentication, token renewal, retries, and data transformation.
 * All OpenSky-specific logic lives in this module.
 */

import type { IAircraftProvider } from './provider'
import type {
  AircraftData,
  AircraftQueryOptions,
  AircraftProviderResponse,
} from './types'
import { getLogger } from '@/lib/logger/logger'
import { appConfig } from '@/lib/config/app-config'

type OpenSkyStateArray = [
  string,
  string | null,
  string,
  number | null,
  number,
  number | null,
  number | null,
  number | null,
  boolean,
  number | null,
  number | null,
  number | null,
  number[] | null,
  number | null,
  string | null,
  boolean,
  number,
]

interface OpenSkyResponse {
  time: number
  states: OpenSkyStateArray[] | null
}

interface OpenSkyTokenResponse {
  access_token: string
  expires_in: number
  token_type: string
}

interface AuthToken {
  accessToken: string
  expiresAt: number
}

const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504])

export class OpenSkyProvider implements IAircraftProvider {
  readonly name = 'OpenSky'

  private logger = getLogger('OpenSkyProvider')
  private baseUrl: string
  private tokenUrl: string
  private username: string
  private password: string
  private lastFetch: number | null = null
  private lastSyncDuration: number | null = null
  private error: string | null = null
  private isInitialized = false
  private authToken: AuthToken | null = null

  constructor(
    username?: string,
    password?: string,
    baseUrl?: string,
    tokenUrl?: string
  ) {
    this.username = username ?? appConfig.opensky.username
    this.password = password ?? appConfig.opensky.password
    this.baseUrl = baseUrl ?? appConfig.opensky.apiUrl
    this.tokenUrl = tokenUrl ?? appConfig.opensky.tokenUrl
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing OpenSky provider', {
      apiUrl: this.baseUrl,
    })

    if (!this.username || !this.password) {
      const err =
        'OpenSky credentials not configured. Set OPENSKY_USERNAME and OPENSKY_PASSWORD'
      this.error = err
      this.logger.error('OpenSky authentication failed', { reason: err })
      throw new Error(err)
    }

    await this.authenticate()
    this.isInitialized = true
    this.error = null
    this.logger.info('OpenSky authentication successful')
  }

  async fetchAircraft(
    options?: AircraftQueryOptions
  ): Promise<AircraftProviderResponse> {
    if (!this.isInitialized) {
      const err = 'OpenSky provider not initialized. Call initialize() first.'
      this.error = err
      throw new Error(err)
    }

    const startTime = Date.now()
    this.logger.info('Requesting aircraft data from OpenSky')

    try {
      const raw = await this.fetchWithRetries(options)
      const aircraft = this.transformAircraft(raw.states ?? [])
      const duration = Date.now() - startTime

      this.lastFetch = Date.now()
      this.lastSyncDuration = duration
      this.error = null

      this.logger.info('Aircraft downloaded', {
        count: aircraft.length,
        duration,
      })

      return {
        aircraft,
        timestamp: raw.time * 1000,
        count: aircraft.length,
        total: aircraft.length,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      this.lastSyncDuration = duration
      const errorMessage = this.resolveErrorMessage(error)

      if (!this.error) {
        this.error = errorMessage
      }

      this.logger.error('Failed to download aircraft from OpenSky', {
        error: errorMessage,
        duration,
      })

      throw new Error(errorMessage)
    }
  }

  getStatus() {
    return {
      isConnected: this.isInitialized && this.authToken !== null,
      lastFetch: this.lastFetch,
      lastSyncDuration: this.lastSyncDuration,
      error: this.error,
    }
  }

  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up OpenSky provider')
    this.isInitialized = false
    this.authToken = null
  }

  private async authenticate(): Promise<void> {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.username,
      client_secret: this.password,
    })

    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      appConfig.http.timeout
    )

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const err = 'OpenSky authentication failed. Check credentials.'
          this.error = err
          this.logger.error('OpenSky authentication failed', {
            status: response.status,
          })
          throw new Error(err)
        }

        throw new Error(`OpenSky token request failed: HTTP ${response.status}`)
      }

      const data = (await response.json()) as OpenSkyTokenResponse
      this.storeToken(data)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        const err = 'HTTP timeout'
        this.error = err
        this.logger.error('HTTP timeout', { phase: 'authentication' })
        throw new Error(err)
      }

      throw error
    }
  }

  private storeToken(data: OpenSkyTokenResponse): void {
    const bufferMs = appConfig.opensky.tokenRenewalBufferSeconds * 1000
    this.authToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000 - bufferMs,
    }
  }

  private async ensureValidToken(forceRenew = false): Promise<void> {
    const now = Date.now()

    if (
      !forceRenew &&
      this.authToken &&
      this.authToken.expiresAt > now
    ) {
      return
    }

    if (this.authToken && this.authToken.expiresAt <= now) {
      this.logger.warning('Token expired')
    }

    await this.authenticate()
  }

  private async fetchWithRetries(
    options?: AircraftQueryOptions
  ): Promise<OpenSkyResponse> {
    const maxAttempts = appConfig.http.maxRetries + 1
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.fetchStates(options, attempt > 1)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (!this.isRetryableError(lastError) || attempt >= maxAttempts) {
          throw lastError
        }

        this.logger.warning('Retrying OpenSky request after transient error', {
          attempt,
          maxAttempts,
          error: lastError.message,
        })

        await this.delay(500 * attempt)
      }
    }

    throw lastError ?? new Error('OpenSky request failed')
  }

  private async fetchStates(
    options: AircraftQueryOptions | undefined,
    isRetry: boolean
  ): Promise<OpenSkyResponse> {
    await this.ensureValidToken(isRetry)

    const params = new URLSearchParams()
    if (options?.bounds) {
      params.append('lamin', String(options.bounds.minLatitude))
      params.append('lamax', String(options.bounds.maxLatitude))
      params.append('lomin', String(options.bounds.minLongitude))
      params.append('lomax', String(options.bounds.maxLongitude))
    }

    const url = `${this.baseUrl}/states/all${params.size > 0 ? `?${params}` : ''}`
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      appConfig.http.timeout
    )

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.authToken!.accessToken}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.status === 401 || response.status === 403) {
        if (!isRetry) {
          this.logger.warning('Token expired')
          await this.ensureValidToken(true)
          return this.fetchStates(options, true)
        }

        const err = 'OpenSky authentication failed. Check credentials.'
        this.error = err
        this.logger.error('OpenSky authentication failed', {
          status: response.status,
        })
        throw new Error(err)
      }

      if (response.status === 429) {
        throw new Error('OpenSky rate limit exceeded. Try again later.')
      }

      if (!response.ok) {
        throw new Error(`OpenSky API error: HTTP ${response.status}`)
      }

      return (await response.json()) as OpenSkyResponse
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        const err = 'HTTP timeout'
        this.error = err
        this.logger.error('HTTP timeout', { phase: 'aircraft_download' })
        throw new Error(err)
      }

      throw error
    }
  }

  private transformAircraft(states: OpenSkyStateArray[]): AircraftData[] {
    return states
      .map((state) => this.mapOpenSkyState(state))
      .filter((aircraft): aircraft is AircraftData => aircraft !== null)
  }

  private mapOpenSkyState(state: OpenSkyStateArray): AircraftData | null {
    try {
      const icao24 = state[0]
      const callsign = state[1]?.trim() || null
      const lastContact = state[4]
      const longitude = state[5]
      const latitude = state[6]
      const altitude = state[7]
      const onGround = state[8]
      const velocity = state[9]
      const track = state[10]
      const verticalRate = state[11]
      const squawk = state[14]

      if (latitude === null || longitude === null) {
        return null
      }

      return {
        id: icao24,
        icao24,
        callsign,
        latitude,
        longitude,
        altitude,
        groundSpeed: velocity,
        trueTrack: track,
        verticalRate,
        onGround,
        squawk,
        timestamp: lastContact * 1000,
      }
    } catch (error) {
      this.logger.debug('Failed to map OpenSky state', {
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  private isRetryableError(error: Error): boolean {
    if (error.message === 'HTTP timeout') {
      return true
    }

    for (const code of RETRYABLE_STATUS_CODES) {
      if (error.message.includes(String(code))) {
        return true
      }
    }

    return (
      error.message.includes('fetch failed') ||
      error.message.includes('network')
    )
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export function createOpenSkyProvider(
  username?: string,
  password?: string,
  baseUrl?: string,
  tokenUrl?: string
): OpenSkyProvider {
  return new OpenSkyProvider(username, password, baseUrl, tokenUrl)
}
