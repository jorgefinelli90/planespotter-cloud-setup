# OpenSky Service

OpenSky service for real-time aircraft tracking data.

## Status

**Sprint 4:** Placeholder only - architecture defined, no implementation

## Future Implementation (Sprint 5+)

### Purpose

Fetches real-time aircraft data from OpenSky Network API and integrates it into PlaneSpotter Cloud.

### Responsibilities

- Connect to OpenSky API
- Fetch aircraft tracking data for configured geographic area
- Parse and normalize response data
- Detect new and lost aircraft
- Trigger alerts for configured rules

### Configuration

```typescript
// Future implementation
const openSkyService = new OpenSkyService({
  apiUrl: 'https://opensky-network.org/api',
  username: process.env.OPENSKY_USERNAME,
  password: process.env.OPENSKY_PASSWORD,
  refreshInterval: 30, // seconds
  boundingBox: {
    min_lat: 40.0,
    max_lat: 41.0,
    min_lon: -74.0,
    max_lon: -73.0,
  },
})
```

### Data Flow

1. Service executes on schedule (every 30 seconds)
2. Fetch current aircraft in bounding box
3. Compare with previous state
4. Detect new/lost aircraft
5. Trigger alerts if configured
6. Update dashboard widgets
7. Cache results (TTL: 30 seconds)

### API Response

The service will provide:

```typescript
{
  aircraft: Aircraft[],
  timestamp: string,
  bbox: BoundingBox,
  itemsProcessed: number,
}
```

### Error Handling

- Network timeout → retry with exponential backoff
- API rate limit → respect rate limit headers
- Invalid data → log and skip
- Service down → graceful degradation

## Files

- `index.ts` - Service class (not implemented yet)
- `types.ts` - OpenSky-specific types
- `README.md` - This file

## Integration Points

- ServiceManager - Registered on startup
- Scheduler - Executes every 30 seconds
- Cache - Results cached for 30 seconds
- DashboardBuilder - Provides aircraft data
- AlertService - Triggers aircraft alerts

## Testing

```typescript
// Future testing pattern
const service = new OpenSkyService(testConfig)
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.itemsProcessed).toBeGreaterThan(0)
```

## Dependencies (will be added)

- `opensky-api` - OpenSky API client
- `node-cache` - Result caching
- Error handling utilities

## Notes

- Requires OpenSky account (free or paid)
- Rate limits apply based on account tier
- Bounding box required for performance
- Consider caching strategy for real-time vs. memory usage
