/**
 * Aircraft Data Provider Interface
 *
 * Abstraction layer for aircraft data sources.
 * Allows multiple implementations (OpenSky, ADS-B Exchange, etc.)
 * without coupling the service to a specific provider.
 */

import type {
  AircraftData,
  AircraftQueryOptions,
  AircraftProviderResponse,
} from './types'

export interface IAircraftProvider {
  readonly name: string

  initialize(): Promise<void>

  fetchAircraft(options?: AircraftQueryOptions): Promise<AircraftProviderResponse>

  getStatus(): {
    isConnected: boolean
    lastFetch: number | null
    lastSyncDuration: number | null
    error: string | null
  }

  cleanup(): Promise<void>
}

export type { AircraftData, AircraftQueryOptions, AircraftProviderResponse }
