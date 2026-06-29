/**
 * Radar Configuration
 *
 * Centralized configuration for the radar location and detection radius.
 * All values sourced from environment variables with sensible defaults.
 * Never hardcode radar values elsewhere — import from here.
 */

export const radarConfig = {
  /** Default detection radius in kilometers */
  defaultRadiusKm: parseInt(process.env.RADAR_DEFAULT_RADIUS_KM || '200', 10),
  /** Minimum allowed radius in kilometers */
  minRadiusKm: parseInt(process.env.RADAR_MIN_RADIUS_KM || '1', 10),
  /** Maximum allowed radius in kilometers */
  maxRadiusKm: parseInt(process.env.RADAR_MAX_RADIUS_KM || '1000', 10),

  /** Fallback coordinates used only if IP geolocation fails on first run */
  fallbackLatitude: parseFloat(process.env.RADAR_FALLBACK_LAT || '40.7128'),
  fallbackLongitude: parseFloat(process.env.RADAR_FALLBACK_LON || '-74.006'),

  /** Public IP geolocation endpoint (no API key required) */
  ipGeolocationUrl:
    process.env.RADAR_IP_GEOLOCATION_URL || 'https://ipapi.co/json/',
} as const

/**
 * Clamp a radius value into the allowed [min, max] range.
 */
export function clampRadiusKm(radiusKm: number): number {
  if (Number.isNaN(radiusKm)) {
    return radarConfig.defaultRadiusKm
  }
  return Math.min(
    radarConfig.maxRadiusKm,
    Math.max(radarConfig.minRadiusKm, radiusKm)
  )
}

/**
 * Validate latitude is within geographic bounds.
 */
export function isValidLatitude(latitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    !Number.isNaN(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  )
}

/**
 * Validate longitude is within geographic bounds.
 */
export function isValidLongitude(longitude: number): boolean {
  return (
    typeof longitude === 'number' &&
    !Number.isNaN(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}
