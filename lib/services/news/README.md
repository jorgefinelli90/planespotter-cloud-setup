# News Service

Aviation news feed aggregation service.

## Status

**Sprint 4:** Placeholder only - architecture defined, no implementation

## Future Implementation (Sprint 5+)

### Purpose

Aggregates aviation news from multiple sources (NewsAPI, industry feeds, etc) and provides curated content to dashboard.

### Responsibilities

- Fetch news from configured sources
- Filter by keywords and relevance
- Deduplicate articles
- Score articles by relevance
- Provide paginated feed
- Manage source subscriptions

### Configuration

```typescript
// Future implementation
const newsService = new NewsService({
  sources: [
    {
      name: 'NewsAPI',
      type: 'newsapi',
      apiKey: process.env.NEWSAPI_KEY,
      query: 'aviation OR aircraft OR plane',
    },
  ],
  refreshInterval: 3600, // 1 hour
  pageSize: 20,
  maxAge: 604800, // 7 days
})
```

### Data Flow

1. Service executes on schedule (hourly)
2. Fetch from each configured source
3. Normalize articles to common format
4. Filter by keywords and date
5. Rank by relevance
6. Deduplicate
7. Store in cache
8. Provide paginated access

### API Response

The service will provide:

```typescript
{
  articles: NewsArticle[],
  total: number,
  sources: { name: string, articles: number }[],
  timestamp: string,
  itemsProcessed: number,
}
```

### News Filters

- Keywords: aviation, aircraft, drone, airport, etc
- Time range: 7 days, 30 days, custom
- Sentiment: neutral, positive, negative
- Source priority: featured, all

### Error Handling

- API errors → log and retry
- Rate limits → respect retry-after headers
- Invalid articles → skip with logging
- Source down → continue with remaining sources

## Files

- `index.ts` - Service class (not implemented yet)
- `types.ts` - News-specific types
- `sources.ts` - Source adapters
- `README.md` - This file

## Integration Points

- ServiceManager - Registered on startup
- Scheduler - Executes hourly
- Cache - Articles cached (TTL: 1 hour)
- DashboardBuilder - Provides news feed
- Notifications - Alert on breaking news

## Testing

```typescript
// Future testing pattern
const service = new NewsService(testConfig)
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.data.articles).toBeDefined()
```

## Dependencies (will be added)

- `newsapi` - NewsAPI client
- `axios` - HTTP requests for other sources
- `feed-parser` - Parse RSS/Atom feeds

## Notes

- NewsAPI free tier has 500 requests/day limit
- Consider using multiple sources for redundancy
- Implement smart caching to avoid duplicate fetches
- Cache entire feed to reduce API calls
