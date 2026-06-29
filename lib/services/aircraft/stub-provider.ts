/**
 * Stub Aircraft Provider
 *
 * Testing/development utility only — NOT used in production runtime.
 * Inject explicitly in unit tests via AircraftService constructor.
 */

import type { IAircraftProvider } from './provider'
import type { AircraftQueryOptions, AircraftProviderResponse } from './types'

export class StubAircraftProvider implements IAircraftProvider {
  readonly name = 'Stub'

  private lastFetch: number | null = null
  private error: string | null = null

  async initialize(): Promise<void> {
    // No-op
  }

  async fetchAircraft(
    _options?: AircraftQueryOptions
  ): Promise<AircraftProviderResponse> {
    this.lastFetch = Date.now()
    this.error = null

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
      lastSyncDuration: null,
      error: this.error,
    }
  }

  async cleanup(): Promise<void> {
    // No-op
  }
}

export function createStubProvider(): IAircraftProvider {
  return new StubAircraftProvider()
}
