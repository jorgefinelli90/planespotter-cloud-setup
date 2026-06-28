# PlaneSpotter Cloud Architecture - Sprint 4

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API ENDPOINTS                           │
│  /api/health  /api/version  /api/dashboard  /api/device/:id│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DASHBOARD BUILDER                              │
│  Orchestrates data from multiple services                   │
│  Handles caching, error aggregation, partial failures       │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ SERVICE │  │ SERVICE │  │ SERVICE │
    │ MANAGER │  │ MANAGER │  │ MANAGER │
    │ (Spring)│  │ (Future)│  │ (Future)│
    └────┬────┘  └────┬────┘  └────┬────┘
         │             │             │
         ▼             ▼             ▼
    ┌─────────┐  ┌─────────┐  ┌─────────┐
    │ OPENSKY │  │ WEATHER │  │  NEWS   │
    │ SERVICE │  │ SERVICE │  │ SERVICE │
    │(Defined)│  │(Defined)│  │(Defined)│
    └────┬────┘  └────┬────┘  └────┬────┘
         │             │             │
         └─────────────┼─────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
    ┌─────────┐              ┌─────────────┐
    │  CACHE  │              │ SCHEDULER   │
    │(Abstract)│              │ (Interface) │
    └─────────┘              └─────────────┘
```

## Component Relationships

### 1. BaseService (Foundation)
```
┌──────────────────────────────────────┐
│ IService Interface                   │
├──────────────────────────────────────┤
│ + id: string                         │
│ + name: string                       │
│ + enabled: boolean                   │
│ + refreshInterval: number            │
│ + initialize(): Promise<void>        │
│ + execute(): Promise<Result>         │
│ + getStatus(): Result                │
│ + cleanup(): Promise<void>           │
│ + isHealthy(): boolean               │
└──────────────────────────────────────┘
         ▲
         │ implements
         │
┌────────┴──────────────────────────────┐
│                                       │
│         BaseService                   │
│     (Abstract Class)                  │
│                                       │
└────────┬──────────────────────────────┘
         ▲
         │ extends
         ├─────────────┬─────────────┬──────────────┬────────────┐
         │             │             │              │            │
    OpenSkyService  WeatherService  NewsService  FirmwareService  NotificationsService
    (Future)        (Future)        (Future)     (Future)        (Future)
```

### 2. ServiceManager (Registry)
```
┌──────────────────────────────────────┐
│      ServiceManager                  │
├──────────────────────────────────────┤
│ - services: Map<id, Service>         │
│                                      │
│ + register(service)                  │
│ + getService(id)                     │
│ + getAllServices()                   │
│ + getEnabledServices()               │
│ + initializeAll()                    │
│ + executeService(id)                 │
│ + getServiceStatus(id)               │
│ + areAllHealthy()                    │
│ + cleanupAll()                       │
└──────────────────────────────────────┘
         │
         │ manages
         │
      ┌──┴──┬───────┬──────────┐
      │     │       │          │
   OpenSky Weather News    Firmware Notifications
```

### 3. DashboardBuilder (Orchestrator)
```
┌──────────────────────────────────────┐
│     DashboardBuilder                 │
├──────────────────────────────────────┤
│ - serviceManager: ServiceManager     │
│ - cache: ICache                      │
│                                      │
│ + build(userId): Promise<Result>     │
│ + invalidateCache(userId)            │
│ + getCacheStats()                    │
└────────────┬─────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
ServiceManager      Cache
  Execute         Get/Set
  Services        Results
    │                 │
    └────────┬────────┘
             │
             ▼
         Dashboard
         (Built from
         aggregated
         service data)
```

### 4. Dependency Injection (ServiceContext)
```
┌──────────────────────────────────────┐
│      ServiceContext                  │
├──────────────────────────────────────┤
│ - singletons: Map<key, instance>     │
│ - factories: Map<key, () => T>       │
│                                      │
│ + register<T>(key, instance)         │
│ + registerFactory<T>(key, factory)   │
│ + get<T>(key)                        │
│ + has(key)                           │
│ + clear()                            │
└──────────────────────────────────────┘
         │
    ┌────┴──────────────────────────┐
    │                               │
    ▼                               ▼
Singletons                    Factories
├─ serviceManager            ├─ cache
├─ dashboardBuilder          ├─ scheduler
├─ cache                     └─ ...
└─ ...
```

## Data Flow

### Current (Sprint 4)
```
Request to /api/dashboard
    │
    ▼
DashboardBuilder.build()
    │
    ├─ Check cache
    │
    ├─ No services executed (empty)
    │
    └─ Return empty dashboard structure
        (from Sprint 2)
    │
    ▼
Response with empty Dashboard
```

### Future (Sprint 5+)
```
Request to /api/dashboard
    │
    ▼
DashboardBuilder.build()
    │
    ├─ Check cache
    │
    ├─ For each enabled service:
    │
    │   ├─ Check service cache
    │   │
    │   ├─ Execute service
    │   │
    │   ├─ Store result
    │   │
    │   └─ Catch errors
    │
    ├─ Aggregate results
    │
    ├─ Cache dashboard
    │
    └─ Return complete dashboard
        (from multiple services)
    │
    ▼
Response with populated Dashboard
```

## Service Lifecycle

```
┌─────────────┐
│  Startup    │
│  Register   │
│  Services   │
└─────┬───────┘
      │
      ▼
┌──────────────────────┐
│  Initialize Services │
│  (setup, connect)    │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│  Ready for Use       │
│  - Manual execution  │
│  - Scheduled exec    │
│  - Health checks     │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│  Execute Services    │
│  (fetch data)        │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│  Cache Results       │
│  (with TTL)          │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│  Provide Data        │
│  (to dashboard)      │
└─────┬────────────────┘
      │
      ▼
┌──────────────────────┐
│  Shutdown            │
│  Cleanup Resources   │
└──────────────────────┘
```

## Error Handling Strategy

```
Service Execution
        │
        ├─── Success ──────────────┐
        │                          │
        ├─── Error (isolated)      │ Cache Result
        │    ├─ Log error          │
        │    └─ Return error status│
        │                          │
        └─── Timeout ──────────────┤
             ├─ Log timeout        │
             └─ Return error status│
                                   │
                                   ▼
                          Aggregate in Dashboard
                          ├─ Include successful services
                          ├─ Flag failed services
                          └─ Still return dashboard
                          
Dashboard Assembly        │
        │                 │
        ├─ Some fail ──────┼─ Continue with successful
        │                 │
        ├─ All fail ──────┼─ Return empty dashboard
        │                 │
        └─ All succeed ───┴─ Return complete dashboard
```

## Scalability Path

### Sprint 4 (Current)
- Architecture defined
- Interfaces created
- No implementations
- Zero external calls

### Sprint 5
- [ ] Cache implementation (in-memory)
- [ ] Scheduler implementation (node-schedule)
- [ ] OpenSky service implementation
- [ ] First integration test

### Sprint 6+
- [ ] Weather service
- [ ] News service
- [ ] Redis cache upgrade
- [ ] Firmware service
- [ ] Notifications service
- [ ] Database integration (services can query)
- [ ] WebSocket support (real-time)

## Extensibility

### Adding a New Service

```typescript
// 1. Create service file
class MyService extends BaseService {
  id = 'my-service'
  
  async execute() {
    // Implementation
  }
}

// 2. Register service (one time)
manager.register(new MyService())

// 3. Benefits automatically:
// - Lifecycle management
// - Scheduling
// - Caching
// - Error handling
// - Health tracking
// - Dashboard integration
// - No endpoint changes needed
```

### Changing Cache Backend

```typescript
// Sprint 4: Placeholder
// const cache = createCache()

// Sprint 5: In-memory
// const cache = new InMemoryCache()

// Sprint 6: Redis
// const cache = new RedisCache(redisUrl)

// Dashboard builder works the same
const builder = createDashboardBuilder(manager, { cache })
```

## Type Safety

All components are fully typed:

```typescript
// Service contracts
interface IService { ... }
class BaseService implements IService { ... }

// Manager
class ServiceManager { ... }

// Builder
class DashboardBuilder { ... }

// Cache
interface ICache { ... }

// Context
class ServiceContext { ... }

// Result types
interface ServiceExecutionResult { ... }
interface DashboardBuildResult { ... }
```

## Performance Considerations

### Caching Strategy
- Service results cached (default: 5 minutes)
- Dashboard cached per user (default: 5 minutes)
- Cache hits avoid service execution
- Graceful cache misses

### Execution Model
- Services execute independently
- Failures don't block other services
- Timeout protection (configurable)
- Parallel execution ready

### Memory Management
- Abstract cache allows Redis/in-memory
- No circular dependencies
- Clean resource cleanup on shutdown
- Configurable cache sizes

## Testing

All components are testable:

```typescript
// Unit test a service
const service = new MyService()
const result = await service.execute()

// Unit test manager
const manager = createServiceManager()
manager.register(service)

// Unit test builder
const builder = createDashboardBuilder(manager)
const result = await builder.build('user-id')

// Integration test
const context = ServiceContext.create()
// Setup and test complete flow
```

## Summary

Sprint 4 creates a foundation that:
- ✅ Is modular and extensible
- ✅ Requires no endpoint changes for new services
- ✅ Handles errors gracefully
- ✅ Is fully type-safe
- ✅ Is testable in isolation
- ✅ Supports dependency injection
- ✅ Is production-ready as a foundation
- ✅ Scales from simple to complex

**The best part:** Implementation in Sprint 5+ is straightforward - just fill in the interfaces with actual logic.
