/**
 * OpenSky Network Provider Implementation
 *
 * Implements IAircraftProvider for OpenSky Network API
 * Handles authentication, API calls, and response transformation
 */

import type { IAircraftProvider } from './provider'
import type { AircraftData, AircraftQueryOptions, AircraftProviderResponse } from './types'
import { getLogger } from '@/lib/logger/logger'

/**
 * OpenSky API State response (array format)
 * @see https://opensky-network.org/api/
 */
type OpenSkyStateArray = [
  string, // icao24
  string | null, // callsign
  string, // origin_country
  number | null, // time_position
  number, // last_contact
  number | null, // longitude
  number | null, // latitude
  number | null, // baro_altitude
  boolean, // on_ground
  number | null, // velocity
  number | null, // true_track
  number | null, // vertical_rate
  number[] | null, // sensors
  number | null, // geo_altitude
  string | null, // squawk
  boolean, // spi
  number, // position_source
]

/**
 * OpenSky API Response structure
 */
interface OpenSkyResponse {
  time: number
  states: OpenSkyStateArray[]
}

/**
 * OpenSky Network Provider
 *
 * Connects to OpenSky Network API to fetch real-time aircraft data
 * Requires authentication with OpenSky credentials
 */
export class OpenSkyProvider implements IAircraftProvider {
  readonly name = 'opensky'
  private logger = getLogger('OpenSkyProvider')
  private baseUrl: string
  private username: string
  private password: string
  private lastFetch: number | null = null
  private error: string | null = null
  private isInitialized: boolean = false

  constructor(
    username?: string,
    password?: string,
    baseUrl?: string
  ) {
    this.username = username || process.env.OPENSKY_USERNAME || ''
    this.password = password || process.env.OPENSKY_PASSWORD || ''
    this.baseUrl = baseUrl || process.env.OPENSKY_API_URL || 'https://opensky-network.org/api'

    if (!this.username || !this.password) {
      this.logger.warning('OpenSky credentials not configured', {
        hasUsername: !!this.username,
        hasPassword: !!this.password,
      })
    }
  }

  /**
   * Initialize the provider (validate configuration)
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing OpenSky provider', {
      baseUrl: this.baseUrl,
      hasUsername: !!this.username,
      hasPassword: !!this.password,
    })

    if (!this.username || !this.password) {
      const err = 'OpenSky credentials not configured. Set OPENSKY_USERNAME and OPENSKY_PASSWORD'
      this.error = err
      throw new Error(err)
    }

    this.isInitialized = true
    this.logger.info('OpenSky provider initialized successfully')
  }

  /**
   * Fetch aircraft data from OpenSky API
   */
  async fetchAircraft(options?: AircraftQueryOptions): Promise<AircraftProviderResponse> {
    if (!this.isInitialized) {
      const err = 'OpenSky provider not initialized. Call initialize() first.'
      this.error = err
      throw new Error(err)
    }

    const startTime = Date.now()
    this.logger.info('Fetching aircraft data from OpenSky')

    try {
      // Create Basic Auth header
      const credentials = btoa(`${this.username}:${this.password}`)

      // Build query parameters if bounds are provided
      const params = new URLSearchParams()
      if (options?.bounds) {
        params.append('lamin', String(options.bounds.minLatitude))
        params.append('lamax', String(options.bounds.maxLatitude))
        params.append('lomin', String(options.bounds.minLongitude))
        params.append('lomax', String(options.bounds.maxLongitude))
      }

      const url = `${this.baseUrl}/states/all${params.size > 0 ? `?${params}` : ''}`

      // Fetch from OpenSky API
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          const err = 'OpenSky authentication failed. Check credentials.'
          this.error = err
          this.logger.error('OpenSky authentication failed', {
            status: response.status,
          })
          throw new Error(err)
        }

        if (response.status === 429) {
          const err = 'OpenSky rate limit exceeded. Try again later.'
          this.error = err
          this.logger.warning('OpenSky rate limit exceeded', {
            status: response.status,
          })
          throw new Error(err)
        }

        const err = `OpenSky API error: ${response.status}`
        this.error = err
        this.logger.error('OpenSky API error', {
          status: response.status,
          statusText: response.statusText,
        })
        throw new Error(err)
      }

      const data: OpenSkyResponse = await response.json()
      const aircraft = this.transformAircraft(data.states || [])

      const duration = Date.now() - startTime
      this.lastFetch = Date.now()
      this.error = null

      this.logger.info('Aircraft data fetched successfully', {
        count: aircraft.length,
        duration,
      })

      return {
        aircraft,
        timestamp: data.time * 1000, // Convert to milliseconds
        count: aircraft.length,
        total: aircraft.length,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (!this.error) {
        this.error = errorMessage
      }

      this.logger.error('Failed to fetch aircraft data', {
        error: errorMessage,
        duration,
      })

      // Return error result - allows graceful degradation
      return {
        aircraft: [],
        timestamp: Date.now(),
        count: 0,
        total: 0,
      }
    }
  }

  /**
   * Transform OpenSky API response to internal AircraftData format
   */
  private transformAircraft(states: OpenSkyStateArray[]): AircraftData[] {
    return states
      .map(state => this.mapOpenSkyState(state))
      .filter((aircraft): aircraft is AircraftData => aircraft !== null)
  }

  /**
   * Map a single OpenSky state to internal AircraftData format
   */
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

      // Skip if no position data
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
        timestamp: lastContact * 1000, // Convert to milliseconds
      }
    } catch (error) {
      this.logger.debug('Failed to map OpenSky state', {
        error: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  }

  /**
   * Get provider status
   */
  getStatus() {
    return {
      isConnected: this.isInitialized,
      lastFetch: this.lastFetch,
      error: this.error,
    }
  }

  /**
   * Cleanup provider resources
   */
  async cleanup(): Promise<void> {
    this.logger.info('Cleaning up OpenSky provider')
    this.isInitialized = false
  }
}

/**
 * Factory function to create OpenSkyProvider
 */
export function createOpenSkyProvider(
  username?: string,
  password?: string,
  baseUrl?: string
): OpenSkyProvider {
  return new OpenSkyProvider(username, password, baseUrl)
}
