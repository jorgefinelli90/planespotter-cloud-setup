/**
 * ServiceManager - Central registry and orchestrator for all services
 *
 * Manages service registration, discovery, and lifecycle.
 * Enables dependency injection and loose coupling throughout the application.
 */

import type { IService, ServiceExecutionResult } from './base-service'

/**
 * Service registry entry
 */
interface ServiceEntry {
  service: IService
  initialized: boolean
}

/**
 * Service manager implementation
 * Singleton pattern (no global state, passed via DI)
 */
export class ServiceManager {
  private services: Map<string, ServiceEntry> = new Map()

  /**
   * Register a service
   *
   * @param service - Service instance to register
   * @throws Error if service ID is invalid or already registered
   */
  register(service: IService): void {
    // Validate service ID format
    if (!service.id || !/^[a-z0-9-]+$/.test(service.id)) {
      throw new Error(
        `Invalid service ID: "${service.id}". Must be lowercase alphanumeric with hyphens.`
      )
    }

    // Check for duplicates
    if (this.services.has(service.id)) {
      throw new Error(`Service "${service.id}" is already registered`)
    }

    // Register service
    this.services.set(service.id, {
      service,
      initialized: false,
    })
  }

  /**
   * Get a service by ID
   *
   * @param id - Service ID
   * @returns Service instance or undefined
   */
  getService(id: string): IService | undefined {
    const entry = this.services.get(id)
    return entry?.service
  }

  /**
   * Get all registered services
   *
   * @returns Array of all services
   */
  getAllServices(): IService[] {
    return Array.from(this.services.values()).map((entry) => entry.service)
  }

  /**
   * Get enabled services only
   *
   * @returns Array of enabled services
   */
  getEnabledServices(): IService[] {
    return this.getAllServices().filter((service) => service.enabled)
  }

  /**
   * Initialize a service
   *
   * @param id - Service ID
   * @throws Error if service not found or initialization fails
   */
  async initializeService(id: string): Promise<void> {
    const entry = this.services.get(id)
    if (!entry) {
      throw new Error(`Service "${id}" not found`)
    }

    if (entry.initialized) {
      console.log(`Service "${id}" already initialized`)
      return
    }

    try {
      await entry.service.initialize()
      entry.initialized = true
    } catch (error) {
      throw new Error(
        `Failed to initialize service "${id}": ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Initialize all services
   *
   * @returns Map of service IDs to initialization results
   */
  async initializeAll(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()

    for (const [id, entry] of this.services) {
      try {
        if (!entry.initialized) {
          await entry.service.initialize()
          entry.initialized = true
        }
        results.set(id, true)
      } catch (error) {
        console.error(`Failed to initialize service "${id}":`, error)
        results.set(id, false)
      }
    }

    return results
  }

  /**
   * Execute a service
   *
   * @param id - Service ID
   * @returns Service execution result
   * @throws Error if service not found
   */
  async executeService(id: string): Promise<ServiceExecutionResult> {
    const service = this.getService(id)
    if (!service) {
      throw new Error(`Service "${id}" not found`)
    }

    if (!service.enabled) {
      return {
        status: 'disabled',
        lastRun: new Date().toISOString(),
        duration: 0,
        itemsProcessed: 0,
        error: 'Service is disabled',
      }
    }

    return await service.execute()
  }

  /**
   * Get service status
   *
   * @param id - Service ID
   * @returns Service execution result
   */
  getServiceStatus(id: string): ServiceExecutionResult | undefined {
    const service = this.getService(id)
    return service?.getStatus()
  }

  /**
   * Get status of all services
   *
   * @returns Map of service IDs to execution results
   */
  getAllServicesStatus(): Map<string, ServiceExecutionResult> {
    const status = new Map<string, ServiceExecutionResult>()

    for (const service of this.getAllServices()) {
      status.set(service.id, service.getStatus())
    }

    return status
  }

  /**
   * Check if all services are healthy
   *
   * @returns True if all services are healthy
   */
  areAllHealthy(): boolean {
    return this.getAllServices().every((service) => service.isHealthy())
  }

  /**
   * Cleanup a service
   *
   * @param id - Service ID
   */
  async cleanupService(id: string): Promise<void> {
    const service = this.getService(id)
    if (service) {
      await service.cleanup()
    }
  }

  /**
   * Cleanup all services
   * Called at application shutdown
   */
  async cleanupAll(): Promise<void> {
    const cleanupPromises = this.getAllServices().map((service) =>
      service.cleanup().catch((error) => {
        console.error(`Error cleaning up service "${service.id}":`, error)
      })
    )

    await Promise.all(cleanupPromises)
  }

  /**
   * Get service count
   */
  getServiceCount(): number {
    return this.services.size
  }

  /**
   * Clear all services
   * Useful for testing
   */
  clear(): void {
    this.services.clear()
  }
}

/**
 * Create a new ServiceManager instance
 * Factory function for dependency injection
 */
export function createServiceManager(): ServiceManager {
  return new ServiceManager()
}
