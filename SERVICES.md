# PlaneSpotter Cloud Services Engine

Sprint 4 - Modular Services Architecture

## Overview

The Services Engine is a fully modular, type-safe, and extensible architecture for integrating external data sources and business logic into PlaneSpotter Cloud.

**Key Principle:** New services can be added without modifying existing endpoints or components.

## Architecture

### Core Components

#### 1. **BaseService** - Universal Service Contract

All services implement `IService` interface:

```typescript
interface IService {
  id: string                          // Unique identifier
  name: string                        // Human-readable name
  description: string                 // Purpose
  enabled: boolean                    // Active/inactive
  refreshInterval: number             // Seconds (0=manual, -1=on-demand)
  initialize(): Promise<void>         // Setup
  execute(): Promise<ServiceExecutionResult>  // Run
  getStatus(): ServiceExecutionResult // Health
  cleanup(): Promise<void>            // Teardown
  isHealthy(): boolean                // Health check
}
```

**Example Implementation:**
```typescript
export class MyService extends BaseService {
  id = 'my-service'
  name = 'My Service'
  description = 'Does something useful'
  refreshInterval = 3600 // 1 hour

  async execute(): Promise<ServiceExecutionResult> {
    // Implementation
  }
}
```

#### 2. **ServiceManager** - Central Registry

Manages service registration and discovery:

```typescript
const manager = createServiceManager()

// Register services
manager.register(new OpenSkyService())
manager.register(new WeatherService())
manager.register(new NewsService())

// Initialize all
await manager.initializeAll()

// Execute single service
const result = await manager.executeService('opensky')

// Check all health
const allHealthy = manager.areAllHealthy()
```

#### 3. **Scheduler** - Periodic Execution

Coordinates service execution based on intervals (Sprint 5+):

```typescript
const scheduler = createScheduler()

// Schedule all enabled services
for (const service of manager.getEnabledServices()) {
  scheduler.scheduleService(service)
}

scheduler.start()
// Services execute automatically
scheduler.stop()
```

#### 4. **Cache** - Abstract Data Storage

Caches service results without implementation specifics:

```typescript
const cache = createCache({ defaultTtl: 300 })

// Store results
cache.set('aircraft-list', aircraftData, 60)

// Retrieve
const cached = cache.get('aircraft-list')

// Check stats
cache.getStats() // { entries: 1, hits: 5, misses: 2, ... }
```

#### 5. **ServiceContext** - Dependency Injection

Manages service instances and dependencies:

```typescript
const context = ServiceContext.create()

// Register instances
context.register('serviceManager', manager)
context.register('cache', cache)

// Get anywhere in code
const manager = context.get('serviceManager')
```

#### 6. **DashboardBuilder** - Dashboard Assembly

Orchestrates dashboard creation from multiple services:

```typescript
const builder = createDashboardBuilder(manager, { cache })

// Build dashboard from services
const result = await builder.build(userId)
// {
//   dashboard: Dashboard,
//   serviceResults: Map<string, unknown>,
//   errors: Map<string, Error>,
//   buildTime: number
// }
```

## Service Lifecycle

```
Registration
    ↓
Initialization (initialize)
    ↓
Ready for Execution
    ↓
Scheduled/Manual Execution (execute)
    ↓
Status Check (getStatus)
    ↓
Cleanup (cleanup)
```

## Available Services

### OpenSky (lib/services/opensky/)
**Status:** Defined, not implemented
- Real-time aircraft tracking
- Fetch from OpenSky API
- Detect new/lost aircraft
- Refresh interval: 30 seconds

### Weather (lib/services/weather/)
**Status:** Defined, not implemented
- Aviation weather and METAR/TAF
- Multiple airport support
- Flight conditions calculation
- Refresh interval: 10 minutes

### News (lib/services/news/)
**Status:** Defined, not implemented
- Aviation news aggregation
- Multiple sources support
- Article filtering and ranking
- Refresh interval: 1 hour

### Firmware (lib/services/firmware/)
**Status:** Defined, not implemented
- OTA firmware updates for devices
- Deployment strategy management
- Rollback support
- Refresh interval: 1 hour

### Notifications (lib/services/notifications/)
**Status:** Defined, not implemented
- Alert delivery via email/push/SMS
- User preference management
- Notification queue
- Refresh interval: On-demand

## Integration Example

### Current (Sprint 4)

```typescript
// Endpoint returns empty dashboard
export async function GET() {
  const userId = 'user-123'
  const dashboard = buildEmptyDashboard(userId)
  
  return NextResponse.json({
    success: true,
    data: dashboard,
    timestamp: new Date().toISOString()
  })
}
```

### Future (Sprint 5+)

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  
  // Get service manager from context
  const context = getGlobalServiceContext()
  const manager = context.get<ServiceManager>('serviceManager')
  const builder = context.get<DashboardBuilder>('dashboardBuilder')
  
  // Build dashboard from all services
  const result = await builder.build(userId)
  
  // Return populated dashboard
  return NextResponse.json({
    success: true,
    data: result.dashboard,
    timestamp: new Date().toISOString()
  })
}
```

**Key Difference:** Endpoint doesn't change, just services are filled in.

## Creating a New Service

### 1. Create Service Class

```typescript
// lib/services/my-service/index.ts
import { BaseService } from '../base-service'

export class MyService extends BaseService {
  id = 'my-service'
  name = 'My Service'
  description = 'Description of what it does'
  refreshInterval = 3600 // 1 hour

  async initialize(): Promise<void> {
    // Setup: validate config, connect to API, etc
  }

  async execute(): Promise<ServiceExecutionResult> {
    try {
      // Fetch and process data
      const data = await this.fetchData()
      
      return {
        status: 'success',
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime,
        itemsProcessed: data.length,
      }
    } catch (error) {
      return {
        status: 'error',
        lastRun: new Date().toISOString(),
        duration: Date.now() - startTime,
        itemsProcessed: 0,
        error: error.message,
      }
    }
  }

  async cleanup(): Promise<void> {
    // Teardown: close connections, cleanup resources
  }

  isHealthy(): boolean {
    // Custom health check
    return this.lastResult.status !== 'error'
  }
}
```

### 2. Register Service

```typescript
// In application startup code
const manager = createServiceManager()
manager.register(new MyService())
await manager.initializeService('my-service')
```

### 3. That's It!

- Service automatically included in scheduler
- Data available in DashboardBuilder
- No endpoint changes needed
- Results automatically cached

## Testing Pattern

```typescript
// Test a service in isolation
it('should execute successfully', async () => {
  const service = new MyService()
  await service.initialize()
  
  const result = await service.execute()
  
  expect(result.status).toBe('success')
  expect(result.itemsProcessed).toBeGreaterThan(0)
  expect(result.error).toBeUndefined()
})

// Test manager
it('should manage multiple services', async () => {
  const manager = createServiceManager()
  manager.register(new Service1())
  manager.register(new Service2())
  
  await manager.initializeAll()
  
  expect(manager.getServiceCount()).toBe(2)
  expect(manager.areAllHealthy()).toBe(true)
})

// Test dashboard builder
it('should build dashboard from services', async () => {
  const manager = createServiceManager()
  manager.register(new OpenSkyService())
  
  const builder = createDashboardBuilder(manager)
  const result = await builder.build('user-123')
  
  expect(result.dashboard.id).toBeDefined()
  expect(result.errors.size).toBe(0)
})
```

## Dependency Injection Setup

```typescript
// Startup code
const context = ServiceContext.create()

// Create instances
const manager = createServiceManager()
const cache = createCache({ defaultTtl: 300 })
const builder = createDashboardBuilder(manager, { cache })

// Register for global access
context.register('serviceManager', manager)
context.register('cache', cache)
context.register('dashboardBuilder', builder)

// Make global (optional)
setGlobalServiceContext(context)

// Use anywhere
const ctx = getGlobalServiceContext()
const mgr = ctx.get('serviceManager')
```

## Performance Considerations

### Caching Strategy
- Service results cached with TTL (default: 5 minutes)
- Dashboard cached per user (default: 5 minutes)
- Invalidate on-demand if needed

### Execution Model
- Services run independently
- Failed service doesn't block others
- Results aggregated gracefully
- Errors captured for logging

### Scalability
- Services can be distributed
- Scheduler can run in separate process
- Cache can use Redis backend
- DI enables easy mock/testing

## Error Handling

Each service handles its own errors:

```typescript
async execute(): Promise<ServiceExecutionResult> {
  try {
    // Do work
  } catch (error) {
    console.error(`Service error: ${error}`)
    return {
      status: 'error',
      itemsProcessed: 0,
      error: error.message,
    }
  }
}
```

DashboardBuilder aggregates errors:

```typescript
const result = await builder.build(userId)
// result.errors is Map of serviceId -> Error
// Dashboard still returned with successful services
```

## Roadmap

### Sprint 4 (Current)
✅ Architecture defined
✅ Interfaces created
✅ No implementation

### Sprint 5
- [ ] Implement in-memory cache
- [ ] Implement scheduler (node-schedule)
- [ ] Implement OpenSky service
- [ ] Integrate cache + scheduler

### Sprint 6+
- [ ] Add Weather service
- [ ] Add News service
- [ ] Upgrade to Redis cache
- [ ] Add Firmware service
- [ ] Add Notifications service

## References

- [BaseService](./lib/services/base-service.ts) - Interface definition
- [ServiceManager](./lib/services/service-manager.ts) - Registry implementation
- [Scheduler](./lib/services/scheduler.ts) - Execution interface
- [Cache](./lib/services/cache.ts) - Storage abstraction
- [DashboardBuilder](./lib/services/dashboard-builder.ts) - Assembly orchestrator
