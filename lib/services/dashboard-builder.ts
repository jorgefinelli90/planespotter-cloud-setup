/**
 * DashboardBuilder - Orchestrates dashboard assembly from services
 *
 * Responsible for:
 * - Collecting data from multiple services
 * - Aggregating into dashboard structure
 * - Handling partial failures gracefully
 * - Caching results
 *
 * Sprint 4: Returns empty structure from Sprint 2
 * Sprint 5+: Integrates with actual services (OpenSky, Weather, News, etc)
 */

import type { Dashboard } from '@/types'
import type { ServiceManager } from './service-manager'
import type { ICache } from './cache'

/**
 * Dashboard builder configuration
 */
export interface DashboardBuilderConfig {
  /**
   * Cache instance (optional)
   */
  cache?: ICache

  /**
   * Cache TTL in seconds
   */
  cacheTtl?: number

  /**
   * Service timeout in milliseconds
   */
  serviceTimeout?: number

  /**
   * Include service metadata in response
   */
  includeMetadata?: boolean
}

/**
 * Dashboard builder result
 */
export interface DashboardBuildResult {
  dashboard: Dashboard
  serviceResults: Map<string, unknown>
  errors: Map<string, Error>
  buildTime: number
}

/**
 * DashboardBuilder implementation
 */
export class DashboardBuilder {
  private serviceManager: ServiceManager
  private cache?: ICache
  private cacheTtl: number = 300 // 5 minutes default
  private serviceTimeout: number = 5000 // 5 seconds default
  private includeMetadata: boolean = false

  constructor(
    serviceManager: ServiceManager,
    config?: DashboardBuilderConfig
  ) {
    this.serviceManager = serviceManager
    if (config?.cache) {
      this.cache = config.cache
    }
    if (config?.cacheTtl !== undefined) {
      this.cacheTtl = config.cacheTtl
    }
    if (config?.serviceTimeout !== undefined) {
      this.serviceTimeout = config.serviceTimeout
    }
    if (config?.includeMetadata !== undefined) {
      this.includeMetadata = config.includeMetadata
    }
  }

  /**
   * Build complete dashboard for a user
   *
   * @param userId - User ID
   * @returns Dashboard build result
   */
  async build(userId: string): Promise<DashboardBuildResult> {
    const startTime = Date.now()
    const cacheKey = `dashboard:${userId}`

    // Check cache first
    if (this.cache?.has(cacheKey)) {
      const cached = this.cache.get<DashboardBuildResult>(cacheKey)
      if (cached) {
        return cached
      }
    }

    const serviceResults = new Map<string, unknown>()
    const errors = new Map<string, Error>()

    // Sprint 4: Return empty dashboard structure
    // Sprint 5+: Call services like this:
    // for (const service of this.serviceManager.getEnabledServices()) {
    //   try {
    //     const result = await this.executeServiceWithTimeout(service)
    //     serviceResults.set(service.id, result)
    //   } catch (error) {
    //     errors.set(service.id, error instanceof Error ? error : new Error(String(error)))
    //   }
    // }

    // Build empty dashboard structure
    const dashboard = this.buildEmptyDashboard(userId)

    const buildTime = Date.now() - startTime
    const result: DashboardBuildResult = {
      dashboard,
      serviceResults,
      errors,
      buildTime,
    }

    // Cache the result
    if (this.cache) {
      this.cache.set(cacheKey, result, this.cacheTtl)
    }

    return result
  }

  /**
   * Build empty dashboard structure (Sprint 4)
   * Matches the structure defined in Sprint 2
   */
  private buildEmptyDashboard(userId: string): Dashboard {
    return {
      id: '',
      userId,
      name: 'Default Dashboard',
      description: '',
      visibility: 'private',
      type: 'overview',
      isDefault: true,
      layout: {
        id: '',
        name: 'Default Layout',
        dashboardId: '',
        columns: 4,
        widgets: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      settings: {
        realtimeUpdates: true,
        updateFrequency: 30,
        enableNotifications: true,
        darkMode: true,
        density: 'comfortable',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Execute service with timeout
   * Used in Sprint 5+ when integrating actual services
   */
  private async executeServiceWithTimeout(service: any): Promise<unknown> {
    return Promise.race([
      service.execute(),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Service "${service.id}" timeout`)),
          this.serviceTimeout
        )
      ),
    ])
  }

  /**
   * Invalidate dashboard cache for a user
   */
  invalidateCache(userId: string): void {
    if (this.cache) {
      this.cache.delete(`dashboard:${userId}`)
    }
  }

  /**
   * Invalidate all dashboard cache
   */
  invalidateAllCache(): void {
    if (this.cache) {
      // Note: In real implementation, might need pattern-based deletion
      this.cache.clear()
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return this.cache?.getStats()
  }
}

/**
 * Factory function to create a dashboard builder
 */
export function createDashboardBuilder(
  serviceManager: ServiceManager,
  config?: DashboardBuilderConfig
): DashboardBuilder {
  return new DashboardBuilder(serviceManager, config)
}
