/**
 * LocationService
 *
 * Owns the radar DeviceLocation used to filter aircraft.
 *
 * Responsibilities:
 * - On first ever startup, detect an approximate location via IP geolocation
 *   and persist it to disk.
 * - On subsequent startups, load the persisted location and NEVER query the
 *   IP service automatically again.
 * - Expose the current location and allow manual updates from Settings.
 *
 * The location persists between restarts via the location store.
 */

import type { DeviceLocation } from '@/types'
import { getLogger } from '@/lib/logger/logger'
import {
  radarConfig,
  clampRadiusKm,
  isValidLatitude,
  isValidLongitude,
} from '@/lib/config/radar'
import { appConfig } from '@/lib/config/app-config'
import {
  readPersistedLocation,
  writePersistedLocation,
} from './location-store'

export interface ManualLocationUpdate {
  latitude?: number
  longitude?: number
  altitude?: number
  radiusKm?: number
}

interface IpGeolocationResponse {
  latitude?: number
  longitude?: number
  error?: boolean
  reason?: string
}

export class LocationService {
  private logger = getLogger('LocationService')
  private location: DeviceLocation | null = null
  private initialized = false

  /**
   * Initialize the location.
   * Loads from disk if available; otherwise performs a one-time IP lookup.
   */
  async initialize(): Promise<DeviceLocation> {
    if (this.initialized && this.location) {
      return this.location
    }

    const persisted = await readPersistedLocation()

    if (persisted) {
      this.location = persisted
      this.initialized = true
      this.logger.info('Loaded persisted radar location', {
        latitude: persisted.latitude,
        longitude: persisted.longitude,
        radiusKm: persisted.radiusKm,
        source: persisted.source,
      })
      return this.location
    }

    this.logger.info(
      'No persisted radar location found — detecting via IP geolocation'
    )
    this.location = await this.detectViaIp()
    await writePersistedLocation(this.location)
    this.initialized = true

    this.logger.info('Initial radar location detected and persisted', {
      latitude: this.location.latitude,
      longitude: this.location.longitude,
      radiusKm: this.location.radiusKm,
      source: this.location.source,
    })

    return this.location
  }

  /**
   * Get the current radar location. Falls back to config defaults if the
   * service has not been initialized yet.
   */
  getLocation(): DeviceLocation {
    if (this.location) {
      return this.location
    }

    return {
      latitude: radarConfig.fallbackLatitude,
      longitude: radarConfig.fallbackLongitude,
      radiusKm: radarConfig.defaultRadiusKm,
      source: 'ip',
    }
  }

  /**
   * Apply a manual update from Settings. Validates and clamps values, marks
   * the source as 'manual', and persists immediately so AircraftService
   * filtering reflects the change right away.
   */
  async updateLocation(update: ManualLocationUpdate): Promise<DeviceLocation> {
    const current = this.getLocation()

    const next: DeviceLocation = {
      latitude:
        update.latitude !== undefined && isValidLatitude(update.latitude)
          ? update.latitude
          : current.latitude,
      longitude:
        update.longitude !== undefined && isValidLongitude(update.longitude)
          ? update.longitude
          : current.longitude,
      altitude:
        update.altitude !== undefined ? update.altitude : current.altitude,
      radiusKm:
        update.radiusKm !== undefined
          ? clampRadiusKm(update.radiusKm)
          : current.radiusKm,
      source: 'manual',
    }

    this.location = next
    this.initialized = true
    await writePersistedLocation(next)

    this.logger.info('Radar location updated manually', {
      latitude: next.latitude,
      longitude: next.longitude,
      radiusKm: next.radiusKm,
    })

    return next
  }

  /**
   * Detect approximate location via a public IP geolocation API.
   * Falls back to configured coordinates if the lookup fails.
   */
  private async detectViaIp(): Promise<DeviceLocation> {
    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      appConfig.http.timeout
    )

    try {
      const response = await fetch(radarConfig.ipGeolocationUrl, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`IP geolocation responded with ${response.status}`)
      }

      const data = (await response.json()) as IpGeolocationResponse

      if (
        data.error ||
        !isValidLatitude(data.latitude ?? NaN) ||
        !isValidLongitude(data.longitude ?? NaN)
      ) {
        throw new Error(data.reason || 'Invalid IP geolocation response')
      }

      return {
        latitude: data.latitude as number,
        longitude: data.longitude as number,
        radiusKm: radarConfig.defaultRadiusKm,
        source: 'ip',
      }
    } catch (error) {
      this.logger.warning(
        'IP geolocation failed — using fallback coordinates',
        { error: error instanceof Error ? error.message : String(error) }
      )

      return {
        latitude: radarConfig.fallbackLatitude,
        longitude: radarConfig.fallbackLongitude,
        radiusKm: radarConfig.defaultRadiusKm,
        source: 'ip',
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

export function createLocationService(): LocationService {
  return new LocationService()
}

/**
 * Shared LocationService singleton.
 *
 * Intentionally decoupled from the OpenSky-gated app runtime so radar
 * location can always be read and configured — even before (or without)
 * a valid OpenSky configuration. The app runtime and the settings API both
 * use this same instance, so manual updates take effect immediately.
 */
declare global {
  // eslint-disable-next-line no-var
  var __planespotterLocationService: LocationService | undefined
  // eslint-disable-next-line no-var
  var __planespotterLocationInitPromise:
    | Promise<DeviceLocation>
    | undefined
}

export function getLocationService(): LocationService {
  if (!globalThis.__planespotterLocationService) {
    globalThis.__planespotterLocationService = new LocationService()
  }
  return globalThis.__planespotterLocationService
}

export async function ensureLocationInitialized(): Promise<LocationService> {
  const service = getLocationService()

  if (!globalThis.__planespotterLocationInitPromise) {
    globalThis.__planespotterLocationInitPromise = service
      .initialize()
      .catch((error) => {
        globalThis.__planespotterLocationInitPromise = undefined
        throw error
      })
  }

  await globalThis.__planespotterLocationInitPromise
  return service
}
