/**
 * Services Engine - Usage Examples
 *
 * Sprint 4: Architectural examples showing how to use the services engine
 * These examples show the intended usage patterns for Sprint 5+ implementation
 */

/* ============================================================================
 * EXAMPLE 1: Basic Service Usage
 * ============================================================================ */

import { BaseService } from './base-service'
import type { ServiceExecutionResult } from './base-service'

// Create a custom service
class ExampleDataService extends BaseService {
  id = 'example-data'
  name = 'Example Data Service'
  description = 'Demonstrates service implementation'
  refreshInterval = 300 // 5 minutes

  async initialize(): Promise<void> {
    console.log('[ExampleDataService] Initializing...')
    // Setup: validate config, connect to API, etc
  }

  async execute(): Promise<ServiceExecutionResult> {
    const startTime = Date.now()

    try {
      // Simulate fetching data
      const data = await this.fetchExampleData()

      const duration = Date.now() - startTime
      return {
        status: 'success',
        lastRun: new Date().toISOString(),
        duration,
        itemsProcessed: data.length,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      return {
        status: 'error',
        lastRun: new Date().toISOString(),
        duration,
        itemsProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  private async fetchExampleData(): Promise<unknown[]> {
    // Simulate API call
    return [{ id: 1, name: 'Item 1' }]
  }

  async cleanup(): Promise<void> {
    console.log('[ExampleDataService] Cleaning up...')
  }
}

/* ============================================================================
 * EXAMPLE 2: ServiceManager Usage
 * ============================================================================ */

import { ServiceManager, createServiceManager } from './service-manager'

function exampleServiceManager() {
  // Create manager
  const manager = createServiceManager()

  // Register services
  const service = new ExampleDataService()
  manager.register(service)

  // Check registration
  const retrieved = manager.getService('example-data')
  console.log(`Service registered: ${retrieved?.name}`)

  // Initialize
  manager.initializeService('example-data')

  // Execute
  manager.executeService('example-data')

  // Check health
  const isHealthy = manager.areAllHealthy()
  console.log(`All services healthy: ${isHealthy}`)

  // Get all services
  const allServices = manager.getAllServices()
  console.log(`Total services: ${allServices.length}`)
}

/* ============================================================================
 * EXAMPLE 3: Dependency Injection with ServiceContext
 * ============================================================================ */

import {
  ServiceContext,
  ServiceContextBuilder,
  initializeGlobalContext,
} from './context'

function exampleDependencyInjection() {
  // Create context
  const context = ServiceContext.create()

  // Register instances
  const manager = createServiceManager()
  context.register('serviceManager', manager)
  context.register('config', { timeout: 5000 })

  // Register factory
  context.registerFactory('timestamp', () => new Date().toISOString())

  // Access instances
  const mgr = context.get('serviceManager')
  const config = context.get('config')
  const timestamp = context.get('timestamp')

  console.log(`Manager type: ${typeof mgr}`)
  console.log(`Config: ${JSON.stringify(config)}`)
  console.log(`Timestamp: ${timestamp}`)

  // Using builder pattern
  const builtContext = new ServiceContextBuilder()
    .registerSingleton('app', { version: '0.1.0' })
    .registerFactory('date', () => new Date())
    .build()

  console.log(`Built context has app: ${builtContext.has('app')}`)
}

/* ============================================================================
 * EXAMPLE 4: Cache Abstraction
 * ============================================================================ */

import type { ICache } from './cache'

function exampleCacheUsage(cache: ICache) {
  // Set values
  cache.set('user:123:profile', { id: 123, name: 'John' }, 300)
  cache.set('aircraft:list', [{ id: 'N12345' }], 60)

  // Get values
  const profile = cache.get('user:123:profile')
  const aircraft = cache.get('aircraft:list')

  console.log(`Cached profile: ${JSON.stringify(profile)}`)
  console.log(`Cached aircraft: ${JSON.stringify(aircraft)}`)

  // Check existence
  if (cache.has('user:123:profile')) {
    console.log('Profile is cached')
  }

  // Get stats
  const stats = cache.getStats()
  console.log(`Cache stats: ${JSON.stringify(stats)}`)

  // Cleanup expired
  cache.cleanup()

  // Clear all
  cache.clear()
}

/* ============================================================================
 * EXAMPLE 5: Dashboard Builder (Sprint 4 - Returns Empty)
 * ============================================================================ */

import { createDashboardBuilder } from './dashboard-builder'

async function exampleDashboardBuilder() {
  const manager = createServiceManager()

  // Register services (in Sprint 5+)
  // manager.register(new OpenSkyService())
  // manager.register(new WeatherService())
  // manager.register(new NewsService())

  // Create builder
  const builder = createDashboardBuilder(manager)

  // Build dashboard
  const result = await builder.build('user:123')

  console.log(`Dashboard ID: ${result.dashboard.id}`)
  console.log(`Services run: ${result.serviceResults.size}`)
  console.log(`Errors: ${result.errors.size}`)
  console.log(`Build time: ${result.buildTime}ms`)

  // Access dashboard structure
  const dashboard = result.dashboard
  console.log(`Dashboard name: ${dashboard.name}`)
  console.log(`Dashboard widgets: ${dashboard.layout.widgets.length}`)
}

/* ============================================================================
 * EXAMPLE 6: Scheduler Usage (Sprint 5+)
 * ============================================================================ */

import { createScheduler } from './scheduler'

async function exampleSchedulerUsage() {
  // This is planned for Sprint 5 - not implemented yet

  // const scheduler = createScheduler({ debug: true })
  //
  // const manager = createServiceManager()
  // manager.register(new OpenSkyService())
  // manager.register(new WeatherService())
  //
  // // Schedule all services
  // for (const service of manager.getEnabledServices()) {
  //   scheduler.scheduleService(service)
  // }
  //
  // // Start execution
  // scheduler.start()
  //
  // // Services automatically execute based on their refreshInterval
  //
  // // Manual execution
  // const result = await scheduler.executeNow('opensky')
  //
  // // Stop scheduler
  // await scheduler.stop()
}

/* ============================================================================
 * EXAMPLE 7: Complete Application Setup
 * ============================================================================ */

async function completeApplicationSetup() {
  // 1. Initialize global context
  const context = initializeGlobalContext()

  // 2. Create manager
  const manager = createServiceManager()

  // 3. Register services (Sprint 5+)
  // manager.register(new OpenSkyService())
  // manager.register(new WeatherService())
  // manager.register(new NewsService())
  // manager.register(new FirmwareService())
  // manager.register(new NotificationsService())

  // 4. Store manager in context
  context.register('serviceManager', manager)

  // 5. Initialize all services
  const initResults = await manager.initializeAll()
  console.log(`Initialized services: ${Object.values(initResults).filter(Boolean).length}`)

  // 6. Create dashboard builder
  const builder = createDashboardBuilder(manager)
  context.register('dashboardBuilder', builder)

  // 7. Create scheduler (Sprint 5+)
  // const scheduler = createScheduler()
  // for (const service of manager.getEnabledServices()) {
  //   scheduler.scheduleService(service)
  // }
  // scheduler.start()
  // context.register('scheduler', scheduler)

  console.log('Application services initialized and ready')

  // Use in API endpoints (Sprint 5+)
  // export async function GET() {
  //   const context = getGlobalServiceContext()
  //   const builder = context.get('dashboardBuilder')
  //   const result = await builder.build('user:123')
  //
  //   return NextResponse.json({
  //     success: true,
  //     data: result.dashboard,
  //   })
  // }
}

/* ============================================================================
 * EXAMPLE 8: Error Handling
 * ============================================================================ */

async function exampleErrorHandling() {
  const manager = createServiceManager()

  // Register two services
  manager.register(new ExampleDataService())
  // manager.register(new BrokenService()) // Would fail

  // Initialize - errors don't crash, just logged
  const results = await manager.initializeAll()
  console.log(`Successful initializations: ${Object.values(results).filter(Boolean).length}`)

  // Execute services - failures are captured
  for (const service of manager.getAllServices()) {
    try {
      const result = await manager.executeService(service.id)
      if (result.status === 'error') {
        console.log(`Service ${service.id} failed: ${result.error}`)
      }
    } catch (error) {
      console.error(`Unexpected error executing ${service.id}:`, error)
    }
  }

  // Dashboard builder handles partial failures gracefully
  // If OpenSky fails but Weather succeeds, dashboard includes Weather data
}

export {
  exampleServiceManager,
  exampleDependencyInjection,
  exampleCacheUsage,
  exampleDashboardBuilder,
  exampleSchedulerUsage,
  completeApplicationSetup,
  exampleErrorHandling,
}
