# Weather Service

Weather and METAR data provider service.

## Status

**Sprint 4:** Placeholder only - architecture defined, no implementation

## Future Implementation (Sprint 5+)

### Purpose

Provides real-time weather, METAR/TAF, and airport conditions for aviation operations.

### Responsibilities

- Fetch METAR from aviation weather APIs
- Fetch TAF forecasts
- Parse weather data
- Calculate flight conditions
- Detect weather alerts
- Provide historical data

### Configuration

```typescript
// Future implementation
const weatherService = new WeatherService({
  provider: 'avwx',
  apiKey: process.env.WEATHER_API_KEY,
  airports: ['KJFK', 'KLGA', 'KEWR'], // Primary coverage area
  refreshInterval: 600, // 10 minutes
  units: 'imperial', // or 'metric'
})
```

### Data Flow

1. Service executes on schedule (every 10 minutes)
2. Fetch METAR for configured airports
3. Fetch TAF forecast
4. Calculate flight category (VFR/MVFR/IFR/LIFR)
5. Store current conditions
6. Detect alerts (thunderstorms, low visibility, etc)
7. Cache results (TTL: 10 minutes)
8. Provide to dashboard

### API Response

The service will provide:

```typescript
{
  metar: METAR[],
  taf: TAF[],
  conditions: Weather[],
  alerts: WeatherAlert[],
  timestamp: string,
  itemsProcessed: number,
}
```

### Flight Categories

- VFR: Visual Flight Rules (ceiling >= 3000ft, visibility >= 5SM)
- MVFR: Marginal VFR
- IFR: Instrument Flight Rules
- LIFR: Low Instrument Flight Rules

### Error Handling

- API unavailable → use cached data + warning
- Parse errors → skip entry with logging
- Invalid airport codes → validation on startup
- Rate limits → respect API limits

## Files

- `index.ts` - Service class (not implemented yet)
- `types.ts` - Weather-specific types
- `parsers.ts` - METAR/TAF parsing
- `README.md` - This file

## Integration Points

- ServiceManager - Registered on startup
- Scheduler - Executes every 10 minutes
- Cache - Weather cached (TTL: 10 minutes)
- DashboardBuilder - Provides weather data
- Alerts - Weather alerts triggered

## Testing

```typescript
// Future testing pattern
const service = new WeatherService(testConfig)
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.data.metar).toBeDefined()
```

## Dependencies (will be added)

- `avwx` - Aviation weather API
- `taf-parser` - TAF parsing
- `metar-parser` - METAR parsing

## Notes

- Some weather APIs require authentication
- METAR updates every 30-60 minutes
- TAF updated 4-6 times per day
- Cache aggressively to reduce API calls
- Consider historical trend analysis
