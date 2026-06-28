/**
 * Aircraft Service
 *
 * Implements the BaseService contract for aircraft data management.
 * Consumes an IAircraftProvider for decoupled data access.
 */

import { BaseService } from '../base-service'
import type { ServiceExecutionResult } from '../base-service'
import { getLogger } from '@/lib/logger/logger'
import type { IAircraftProvider } from './provider'
import { createStubProvider } from './provider'
import { createOpenSkyProvider } from './opensky'
import type { AircraftData, AircraftServiceState, AircraftQueryOptions } from './types'

/**
 * Aircraft Service
 *
 * Manages aircraft data acquisition and caching.
 * Completely decoupled from data source via IAircraftProvider interface.
 */
export class AircraftService extends BaseService {
  readonly id = 'aircraft'
  readonly name = 'Aircraft Service'
  readonly description = 'Fetches and manages aircraft data from configured provider'
  enabled = true
  refreshInterval = 30 // 30 seconds

  private provider: IAircraftProvider
  private logger = getLogger('AircraftService')
  private aircraftData: AircraftData[] = []
  private lastUpdate: string | null = null
  private lastError: string | null = null
  private executionCount = 0

  constructor(provider?: IAircraftProvider) {
    super()
    // Use OpenSky by default, fall back to stub if not configured
    if (provider) {
      this.provider = provider
    } else if (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) {
      this.provider = createOpenSkyProvider()
    } else {
      this.provider = createStubProvider()
    }
    this.logger.info('Aircraft service created', { provider: this.provider.name })
  }

  /**
   * Initialize the service and provider
   */
  async initialize(): Promise<void> {
    try {
      this.logger.debug('Initializing aircraft service')
      await this.provider.initialize()
      this.logger.info('Aircraft service initialized successfully')
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to initialize aircraft service', error as Error)
      throw error
    }
  }

  /**
   * Execute service - fetch aircraft data
   */
  async execute(): Promise<ServiceExecutionResult> {
    const startTime = Date.now()

    try {
      this.logger.debug('Executing aircraft service')
      this.executionCount++

      // Fetch data from provider
      const response = await this.provider.fetchAircraft()

      this.aircraftData = response.aircraft
      this.lastUpdate = new Date().toISOString()
      this.lastError = null

      const duration = Date.now() - startTime

      this.logger.info('Aircraft data fetched successfully', {
        count: response.count,
        duration,
      })

      return {
        status: 'success',
        lastRun: new Date().toISOString(),
        duration,
        itemsProcessed: response.count,
      }
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      const duration = Date.now() - startTime

      this.logger.error('Failed to fetch aircraft data', error as Error)

      return {
        status: 'error',
        lastRun: new Date().toISOString(),
        duration,
        itemsProcessed: 0,
        error: this.lastError,
      }
    }
  }

  /**
   * Get current service status
   */
  getStatus(): ServiceExecutionResult {
    return {
      status: this.isHealthy() ? 'success' : 'error',
      lastRun: this.lastUpdate || new Date(0).toISOString(),
      duration: 0,
      itemsProcessed: this.aircraftData.length,
      error: this.lastError || undefined,
    }
  }

  /**
   * Cleanup service resources
   */
  async cleanup(): Promise<void> {
    try {
      this.logger.debug('Cleaning up aircraft service')
      await this.provider.cleanup()
      this.aircraftData = []
      this.logger.info('Aircraft service cleaned up')
    } catch (error) {
      this.logger.error('Error during aircraft service cleanup', error as Error)
    }
  }

  /**
   * Check if service is healthy
   */
  isHealthy(): boolean {
    const providerStatus = this.provider.getStatus()
    return providerStatus.isConnected && this.lastError === null
  }

  /**
   * Get aircraft data
   */
  getAircraft(): AircraftData[] {
    return [...this.aircraftData]
  }

  /**
   * Get service state
   */
  getState(): AircraftServiceState {
    const providerStatus = this.provider.getStatus()

    return {
      lastUpdate: this.lastUpdate,
      aircraftCount: this.aircraftData.length,
      isHealthy: this.isHealthy(),
      provider: this.provider.name,
      lastError: this.lastError,
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      executionCount: this.executionCount,
      aircraftCount: this.aircraftData.length,
      lastUpdate: this.lastUpdate,
      provider: this.provider.name,
      isHealthy: this.isHealthy(),
    }
  }
}

/**
 * Create an AircraftService instance
 */
export function createAircraftService(provider?: IAircraftProvider): AircraftService {
  return new AircraftService(provider)
}

// Re-export types and interfaces
export type { IAircraftProvider, AircraftData, AircraftServiceState, AircraftQueryOptions }
export { StubAircraftProvider, createStubProvider } from './provider'
export { OpenSkyProvider, createOpenSkyProvider } from './opensky'
