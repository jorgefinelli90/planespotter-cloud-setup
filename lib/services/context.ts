/**
 * ServiceContext - Dependency injection container
 *
 * Manages singleton instances of services, managers, and utilities.
 * Enables loose coupling and easier testing.
 *
 * Usage:
 *   const context = ServiceContext.create()
 *   context.register('cache', cacheInstance)
 *   const cache = context.get('cache')
 */

/**
 * Service context for dependency injection
 */
export class ServiceContext {
  private singletons: Map<string, unknown> = new Map()
  private factories: Map<string, () => unknown> = new Map()

  /**
   * Register a singleton instance
   *
   * @param key - Service key
   * @param instance - Service instance
   */
  register<T>(key: string, instance: T): void {
    this.singletons.set(key, instance)
  }

  /**
   * Register a factory function
   *
   * @param key - Service key
   * @param factory - Factory function that creates the service
   */
  registerFactory<T>(key: string, factory: () => T): void {
    this.factories.set(key, factory)
  }

  /**
   * Get a service instance
   * If factory is registered, creates and caches the instance
   *
   * @param key - Service key
   * @returns Service instance or undefined
   */
  get<T = unknown>(key: string): T | undefined {
    // Check singletons first
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T
    }

    // Check factories
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!
      const instance = factory() as T
      // Cache the instance
      this.singletons.set(key, instance)
      return instance
    }

    return undefined
  }

  /**
   * Check if service exists
   */
  has(key: string): boolean {
    return this.singletons.has(key) || this.factories.has(key)
  }

  /**
   * Remove a service
   */
  remove(key: string): void {
    this.singletons.delete(key)
    this.factories.delete(key)
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.singletons.clear()
    this.factories.clear()
  }

  /**
   * Get all registered keys
   */
  keys(): string[] {
    const keys = new Set([
      ...this.singletons.keys(),
      ...this.factories.keys(),
    ])
    return Array.from(keys)
  }

  /**
   * Create a new context
   */
  static create(): ServiceContext {
    return new ServiceContext()
  }
}

/**
 * Global service context (optional pattern)
 * Can be used as a fallback for accessing services
 * Note: Avoid global state when possible, prefer passing context as parameter
 */
let globalContext: ServiceContext | undefined

/**
 * Set global service context
 */
export function setGlobalServiceContext(context: ServiceContext): void {
  globalContext = context
}

/**
 * Get global service context
 */
export function getGlobalServiceContext(): ServiceContext {
  if (!globalContext) {
    throw new Error('Global service context not initialized')
  }
  return globalContext
}

/**
 * Initialize global service context
 * Called once at application startup
 */
export function initializeGlobalContext(): ServiceContext {
  if (!globalContext) {
    globalContext = ServiceContext.create()
  }
  return globalContext
}

/**
 * ServiceContextBuilder - Fluent interface for building context
 * Makes it easier to set up multiple services
 */
export class ServiceContextBuilder {
  private context: ServiceContext = new ServiceContext()

  /**
   * Register a singleton
   */
  registerSingleton<T>(key: string, instance: T): this {
    this.context.register(key, instance)
    return this
  }

  /**
   * Register a factory
   */
  registerFactory<T>(key: string, factory: () => T): this {
    this.context.registerFactory(key, factory)
    return this
  }

  /**
   * Build and return context
   */
  build(): ServiceContext {
    return this.context
  }
}

/**
 * Create a service context builder
 */
export function createContextBuilder(): ServiceContextBuilder {
  return new ServiceContextBuilder()
}
