/**
 * Device Location types
 *
 * Represents the configured radar location used to filter aircraft.
 * Introduced in Sprint 10 — the server only returns aircraft relevant
 * to this location within the configured radius.
 */

/**
 * How the device location was determined
 * - manual: set by the user from Settings
 * - ip: detected automatically via IP geolocation
 * - gps: provided by a GPS source (future use)
 */
export type LocationSource = 'manual' | 'ip' | 'gps'

/**
 * Configured radar location for aircraft filtering
 */
export interface DeviceLocation {
  /** Latitude in decimal degrees (-90 to 90) */
  latitude: number
  /** Longitude in decimal degrees (-180 to 180) */
  longitude: number
  /** Altitude in meters above sea level (optional) */
  altitude?: number
  /** Detection radius in kilometers */
  radiusKm: number
  /** Source of the location data */
  source: LocationSource
}
