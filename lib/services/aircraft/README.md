# Aircraft Service

Sprint 5 - First Service Implementation

## Overview

The Aircraft Service is the first fully functional service demonstrating the modular services architecture from Sprint 4. It provides a complete example of how to implement services with decoupled data providers.

## Architecture

### Separation of Concerns

```
AircraftService (implements BaseService)
    ↓
IAircraftProvider (abstract interface)
    ↓
StubAircraftProvider (stub implementation for testing)
```

**Key Design:** The service never depends on a specific provider implementation, only on the `IAircraftProvider` interface.

### Components

#### 1. AircraftService (index.ts)
- Extends `BaseService`
- Implements universal service contract
- Consumes `IAircraftProvider` for data access
- Provides simple methods: `getAircraft()`, `getState()`, `getStats()`
- Includes comprehensive logging
- Handles errors gracefully

#### 2. IAircraftProvider (provider.ts)
Abstract interface for aircraft data sources:

```typescript
interface IAircraftProvider {
  readonly name: string
  initialize(): Promise<void>
  fetchAircraft(options?): Promise<AircraftProviderResponse>
  getStatus(): { isConnected, lastFetch, error }
  cleanup(): Promise<void>
}
```

Allows multiple implementations:
- **StubAircraftProvider** - Returns empty collections (Sprint 5)
- **OpenSkyProvider** - Real OpenSky API (Sprint 6)
- **ADSBExchangeProvider** - Future
- **FlightAwareProvider** - Future

#### 3. Types (types.ts)
- `AircraftData` - Single aircraft record
- `AircraftQueryOptions` - Query parameters
- `AircraftProviderResponse` - Provider response structure
- `AircraftServiceState` - Service state

## Usage

### Creating the Service

```typescript
import { createAircraftService, createStubProvider } from '@/lib/services/aircraft'

// With stub provider (testing)
const service = createAircraftService()

// With custom provider
const customProvider = createCustomProvider()
const service = createAircraftService(customProvider)
```

### Lifecycle

```typescript
// Initialize
await service.initialize()

// Execute (fetch aircraft data)
const result = await service.execute()

// Get data
const aircraft = service.getAircraft()
const state = service.getState()
const stats = service.getStats()

// Check health
if (service.isHealthy()) {
  console.log('Service is operating normally')
}

// Status
const status = service.getStatus()

// Cleanup
await service.cleanup()
```

### Integration with ServiceManager

```typescript
import { createServiceManager } from '@/lib/services'
import { createAircraftService } from '@/lib/services/aircraft'

// Register service
const manager = createServiceManager()
manager.register(createAircraftService())

// Service automatically:
// - Gets initialized
// - Can be executed via scheduler
// - Participates in health checks
// - Integrates with dashboard
```

### Integration with DashboardBuilder

```typescript
const builder = createDashboardBuilder(manager)
const result = await builder.build('user-123')

// result includes:
// - dashboard: Complete dashboard structure
// - serviceResults: Map of service data
// - errors: Map of service failures
// - buildTime: Assembly duration
```

## Data Flow

### Current (Sprint 5)

```
AircraftService.execute()
    ↓
(Calls StubAircraftProvider)
    ↓
Returns empty AircraftProviderResponse
    ↓
Service.getState() shows:
  - aircraftCount: 0
  - isHealthy: true
  - provider: "stub"
```

### Future (Sprint 6+)

```
AircraftService.execute()
    ↓
(Calls OpenSkyProvider)
    ↓
Fetches from OpenSky API
    ↓
Returns aircraft data
    ↓
Service.getState() shows:
  - aircraftCount: 5000+
  - isHealthy: true
  - provider: "opensky"
  - lastUpdate: ISO timestamp
```

**Key Point:** Only the provider changes. Service logic stays identical.

## Logging

The service includes comprehensive logging via the Logger system:

```typescript
logger.debug('Executing aircraft service')
logger.info('Aircraft data fetched successfully', { count: 50 })
logger.warning('Provider response delayed', { duration: 2000 })
logger.error('Failed to fetch aircraft data', error)
```

## Error Handling

Service handles errors gracefully:

```typescript
async execute(): Promise<ServiceExecutionResult> {
  try {
    const response = await this.provider.fetchAircraft()
    // Success path
  } catch (error) {
    // Error captured and returned
    return {
      status: 'error',
      error: error.message,
      itemsProcessed: 0,
    }
  }
}
```

Dashboard continues building even if service fails.

## State Management

Service tracks state for health monitoring:

```typescript
getState(): AircraftServiceState {
  return {
    lastUpdate: ISO timestamp,
    aircraftCount: number,
    isHealthy: boolean,
    provider: string,
    lastError: string | null,
  }
}
```

## Testing

Service is testable in isolation:

```typescript
// Test with stub provider
const service = createAircraftService()
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.itemsProcessed).toBe(0) // Stub returns empty

const aircraft = service.getAircraft()
expect(aircraft).toEqual([])
```

## Provider Contract

To implement a new provider:

```typescript
class MyProvider implements IAircraftProvider {
  readonly name = 'my-provider'

  async initialize(): Promise<void> {
    // Setup: connect, validate config, etc
  }

  async fetchAircraft(options?: AircraftQueryOptions): Promise<AircraftProviderResponse> {
    // Fetch from your data source
    // Return properly typed response
  }

  getStatus() {
    return {
      isConnected: boolean,
      lastFetch: number | null,
      error: string | null,
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup: disconnect, close files, etc
  }
}
```

Then use it:

```typescript
const provider = new MyProvider()
const service = createAircraftService(provider)
```

## Configuration

Service parameters (configurable in future):

- `refreshInterval`: 30 seconds (how often to fetch)
- `enabled`: true (whether service runs)
- Service timeout: 5 seconds (dashboard builder)
- Cache TTL: 300 seconds (5 minutes)

## Roadmap

### Sprint 5 (Current)
- ✅ Service architecture implemented
- ✅ Stub provider for validation
- ✅ Logging integration
- ✅ Health endpoint shows service state
- ✅ Dashboard builder calls service

### Sprint 6
- [ ] OpenSky provider implementation
- [ ] Real aircraft data fetching
- [ ] Cache integration with service
- [ ] Scheduler integration

### Future
- [ ] ADS-B Exchange provider
- [ ] FlightAware provider
- [ ] Multi-provider aggregation
- [ ] Aircraft filtering and search

## Best Practices

1. **Always use provider interface** - Never depend on concrete implementation
2. **Log important events** - Helps with debugging and monitoring
3. **Handle errors gracefully** - Let service continue even if provider fails
4. **Respect timeouts** - Dashboard calls with 5-second timeout
5. **Keep data fresh** - Configure appropriate refresh intervals
6. **Test in isolation** - Test service independently from dashboard

## File Structure

```
lib/services/aircraft/
├── index.ts           - AircraftService implementation
├── provider.ts        - IAircraftProvider interface + StubProvider
├── types.ts           - TypeScript definitions
└── README.md          - This documentation
```

## Summary

The Aircraft Service demonstrates that the Sprint 4 architecture works. It's:
- ✅ Fully decoupled from data source
- ✅ Properly typed
- ✅ Includes error handling
- ✅ Has comprehensive logging
- ✅ Integrates with dashboard
- ✅ Ready for real provider implementation

In Sprint 6, simply add `OpenSkyProvider`, register it, and the system works without any other changes.
