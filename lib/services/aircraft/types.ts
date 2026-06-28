/**
 * Aircraft Service Types
 *
 * Defines types specific to the Aircraft service layer
 */

/**
 * Aircraft data retrieved from provider
 */
export interface AircraftData {
  id: string
  icao24: string
  callsign: string | null
  latitude: number | null
  longitude: number | null
  altitude: number | null
  groundSpeed: number | null
  trueTrack: number | null
  verticalRate: number | null
  onGround: boolean
  squawk: string | null
  timestamp: number
}

/**
 * Provider query options
 */
export interface AircraftQueryOptions {
  limit?: number
  offset?: number
  bounds?: {
    minLatitude: number
    maxLatitude: number
    minLongitude: number
    maxLongitude: number
  }
}

/**
 * Provider response
 */
export interface AircraftProviderResponse {
  aircraft: AircraftData[]
  timestamp: number
  count: number
  total: number
}

/**
 * Aircraft service state
 */
export interface AircraftServiceState {
  lastUpdate: string | null
  aircraftCount: number
  isHealthy: boolean
  provider: string
  lastError: string | null
}
