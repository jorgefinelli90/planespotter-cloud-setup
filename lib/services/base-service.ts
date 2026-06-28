/**
 * BaseService - Abstract interface for all services
 *
 * All services in PlaneSpotter Cloud must implement this contract.
 * This ensures consistency, testability, and modularity across the application.
 */

/**
 * Service execution status
 */
export type ServiceStatus = 'idle' | 'running' | 'success' | 'error' | 'disabled'

/**
 * Service execution result
 */
export interface ServiceExecutionResult {
  status: ServiceStatus
  lastRun: string
  nextRun?: string
  duration: number
  itemsProcessed: number
  error?: string
}

/**
 * Base service interface
 * All services must implement this contract
 */
export interface IService {
  /**
   * Unique service identifier
   * Must be lowercase with hyphens (e.g., 'opensky', 'news-feed')
   */
  id: string

  /**
   * Human-readable service name
   */
  name: string

  /**
   * Service description
   */
  description: string

  /**
   * Whether the service is currently enabled
   */
  enabled: boolean

  /**
   * Refresh interval in seconds
   * 0 = manual only, -1 = on-demand
   */
  refreshInterval: number

  /**
   * Initialize the service
   * Called once at application startup
   * Setup connections, load config, validate environment
   *
   * @throws Error if initialization fails
   */
  initialize(): Promise<void>

  /**
   * Execute the service logic
   * Called by scheduler or manually
   *
   * @returns Service execution result
   */
  execute(): Promise<ServiceExecutionResult>

  /**
   * Get current service status
   * Returns the last execution result
   */
  getStatus(): ServiceExecutionResult

  /**
   * Cleanup resources
   * Called at application shutdown
   */
  cleanup(): Promise<void>

  /**
   * Check if service is healthy
   * Called by health check endpoint
   */
  isHealthy(): boolean
}

/**
 * Abstract base service class
 * Provides default implementations and common utilities
 */
export abstract class BaseService implements IService {
  abstract id: string
  abstract name: string
  abstract description: string

  enabled: boolean = true
  refreshInterval: number = 3600 // 1 hour default

  protected lastResult: ServiceExecutionResult = {
    status: 'idle',
    lastRun: new Date().toISOString(),
    duration: 0,
    itemsProcessed: 0,
  }

  /**
   * Initialize the service
   * Override in subclasses
   */
  async initialize(): Promise<void> {
    // Default implementation: do nothing
  }

  /**
   * Execute the service logic
   * Must be implemented by subclasses
   */
  abstract execute(): Promise<ServiceExecutionResult>

  /**
   * Get current service status
   */
  getStatus(): ServiceExecutionResult {
    return this.lastResult
  }

  /**
   * Cleanup resources
   * Override in subclasses if needed
   */
  async cleanup(): Promise<void> {
    // Default implementation: do nothing
  }

  /**
   * Check if service is healthy
   * Override in subclasses for custom health checks
   */
  isHealthy(): boolean {
    // Default: healthy if not in error state
    return this.lastResult.status !== 'error'
  }

  /**
   * Update last execution result
   * Helper method for subclasses
   */
  protected updateResult(
    status: ServiceStatus,
    itemsProcessed: number = 0,
    error?: string
  ): void {
    this.lastResult = {
      status,
      lastRun: new Date().toISOString(),
      duration: Date.now() - new Date(this.lastResult.lastRun).getTime(),
      itemsProcessed,
      error,
    }
  }
}
