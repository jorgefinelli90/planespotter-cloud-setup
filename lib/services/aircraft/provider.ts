/**
 * Aircraft Data Provider Interface
 *
 * Abstraction layer for aircraft data sources.
 * Allows multiple implementations (OpenSky, ADS-B Exchange, FlightAware, etc.)
 * without coupling the service to a specific provider.
 */

import type { AircraftData, AircraftQueryOptions, AircraftProviderResponse } from './types'

/**
 * Aircraft Data Provider Interface
 *
 * Any provider must implement this contract to supply aircraft data
 * to the AircraftService.
 *
 * Providers are responsible for:
 * - Connecting to their data source
 * - Fetching and parsing data
 * - Error handling
 * - Rate limiting
 * - Connection management
 */
export interface IAircraftProvider {
  /**
   * Provider name for logging and identification
   */
  readonly name: string

  /**
   * Initialize provider (connect, setup, etc.)
   */
  initialize(): Promise<void>

  /**
   * Fetch aircraft data
   */
  fetchAircraft(options?: AircraftQueryOptions): Promise<AircraftProviderResponse>

  /**
   * Get provider status/health
   */
  getStatus(): {
    isConnected: boolean
    lastFetch: number | null
    error: string | null
  }

  /**
   * Cleanup provider (disconnect, cleanup, etc.)
   */
  cleanup(): Promise<void>
}

/**
 * Stub Provider - Returns empty collections
 *
 * Used for testing and validation without external dependencies.
 * Returns properly typed but empty aircraft data.
 */
export class StubAircraftProvider implements IAircraftProvider {
  readonly name = 'stub'
  private lastFetch: number | null = null
  private error: string | null = null

  async initialize(): Promise<void> {
    // No-op
  }

  async fetchAircraft(options?: AircraftQueryOptions): Promise<AircraftProviderResponse> {
    this.lastFetch = Date.now()
    this.error = null

    // Return empty but properly structured response
    return {
      aircraft: [],
      timestamp: Date.now(),
      count: 0,
      total: 0,
    }
  }

  getStatus() {
    return {
      isConnected: true,
      lastFetch: this.lastFetch,
      error: this.error,
    }
  }

  async cleanup(): Promise<void> {
    // No-op
  }
}

/**
 * Create a stub provider instance
 */
export function createStubProvider(): IAircraftProvider {
  return new StubAircraftProvider()
}
