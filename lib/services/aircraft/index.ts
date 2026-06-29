/**
 * Aircraft Service
 *
 * Implements the BaseService contract for aircraft data management.
 * Consumes an IAircraftProvider for decoupled data access.
 * Does not know about OpenSky — only depends on IAircraftProvider.
 */

import { BaseService } from '../base-service'
import type { ServiceExecutionResult } from '../base-service'
import { getLogger } from '@/lib/logger/logger'
import type { IAircraftProvider } from './provider'
import { createAircraftProvider } from './create-provider'
import type { AircraftData, AircraftServiceState, AircraftQueryOptions } from './types'

export class AircraftService extends BaseService {
  readonly id = 'aircraft'
  readonly name = 'Aircraft Service'
  readonly description = 'Fetches and manages aircraft data from configured provider'
  enabled = true
  refreshInterval = 30

  private provider: IAircraftProvider
  private logger = getLogger('AircraftService')
  private aircraftData: AircraftData[] = []
  private lastUpdate: string | null = null
  private lastError: string | null = null
  private executionCount = 0

  /**
   * @param provider Optional provider injection for unit tests only
   */
  constructor(provider?: IAircraftProvider) {
    super()
    this.provider = provider ?? createAircraftProvider()
    this.logger.info('Aircraft service created', {
      provider: this.provider.name,
    })
  }

  async initialize(): Promise<void> {
    try {
      this.logger.debug('Initializing aircraft service', {
        provider: this.provider.name,
      })
      await this.provider.initialize()
      this.logger.info('Aircraft service initialized successfully', {
        provider: this.provider.name,
      })
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : String(error)
      this.logger.error('Failed to initialize aircraft service', error as Error)
      throw error
    }
  }

  async execute(): Promise<ServiceExecutionResult> {
    const startTime = Date.now()

    try {
      this.logger.debug('Executing aircraft service')
      this.executionCount++

      const response = await this.provider.fetchAircraft()
      const providerStatus = this.provider.getStatus()

      if (providerStatus.error) {
        this.lastError = providerStatus.error
        const duration = Date.now() - startTime

        this.logger.error('Failed to fetch aircraft data', {
          error: providerStatus.error,
          duration,
        })

        return {
          status: 'error',
          lastRun: new Date().toISOString(),
          duration,
          itemsProcessed: 0,
          error: providerStatus.error,
        }
      }

      this.aircraftData = response.aircraft
      this.lastUpdate = new Date().toISOString()
      this.lastError = null

      const duration = Date.now() - startTime

      this.logger.info('Aircraft data fetched successfully', {
        provider: this.provider.name,
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

  getStatus(): ServiceExecutionResult {
    return {
      status: this.isHealthy() ? 'success' : 'error',
      lastRun: this.lastUpdate || new Date(0).toISOString(),
      duration: 0,
      itemsProcessed: this.aircraftData.length,
      error: this.lastError || undefined,
    }
  }

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

  isHealthy(): boolean {
    const providerStatus = this.provider.getStatus()
    return providerStatus.isConnected && this.lastError === null
  }

  getAircraft(): AircraftData[] {
    return [...this.aircraftData]
  }

  getState(): AircraftServiceState {
    return {
      lastUpdate: this.lastUpdate,
      aircraftCount: this.aircraftData.length,
      isHealthy: this.isHealthy(),
      provider: this.provider.name,
      lastError: this.lastError,
    }
  }

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

export function createAircraftService(provider?: IAircraftProvider): AircraftService {
  return new AircraftService(provider)
}

export type { IAircraftProvider, AircraftData, AircraftServiceState, AircraftQueryOptions }
export { OpenSkyProvider, createOpenSkyProvider } from './opensky'
