/**
 * Services Engine - Central export for all service-related modules
 *
 * This index file exports all service infrastructure components.
 * Services are designed to be modular, type-safe, and easy to extend.
 */

// Base service interface and abstract class
export type { IService, ServiceStatus, ServiceExecutionResult } from './base-service'
export { BaseService } from './base-service'

// Service manager
export { ServiceManager, createServiceManager } from './service-manager'

// Scheduler
export type { IScheduler, ScheduledTask, SchedulerOptions } from './scheduler'
export { BaseScheduler, createScheduler } from './scheduler'

// Cache
export type { ICache, CacheEntry, CacheEntryMetadata, CacheStats, CacheOptions } from './cache'
export { BaseCache, InMemoryCache, createCache } from './cache'

// Dependency injection
export {
  ServiceContext,
  ServiceContextBuilder,
  createContextBuilder,
  initializeGlobalContext,
  getGlobalServiceContext,
  setGlobalServiceContext,
} from './context'

// Dashboard builder
export { DashboardBuilder, createDashboardBuilder } from './dashboard-builder'
export type { DashboardBuilderConfig, DashboardBuildResult } from './dashboard-builder'
