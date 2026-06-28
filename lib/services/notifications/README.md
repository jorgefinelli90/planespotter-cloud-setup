# Notifications Service

User notifications and alert delivery service.

## Status

**Sprint 4:** Placeholder only - architecture defined, no implementation

## Future Implementation (Sprint 5+)

### Purpose

Manages user notifications, alert delivery, and communication preferences.

### Responsibilities

- Format notifications from various services
- Deliver via multiple channels (email, push, SMS)
- Respect user preferences
- Track delivery and read status
- Manage notification queues
- Handle retries and failures
- Throttle duplicate notifications

### Configuration

```typescript
// Future implementation
const notificationsService = new NotificationsService({
  channels: {
    email: {
      enabled: true,
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY,
    },
    push: {
      enabled: true,
      provider: 'firebase',
      serviceAccount: process.env.FIREBASE_SA,
    },
    sms: {
      enabled: false,
      provider: 'twilio',
      apiKey: process.env.TWILIO_API_KEY,
    },
  },
  queue: {
    type: 'redis',
    url: process.env.REDIS_URL,
  },
  maxRetries: 3,
})
```

### Notification Types

- Aircraft detected
- Weather alert
- Device offline/online
- Firmware update available
- Maintenance reminder
- Custom alerts

### Data Flow

1. Other services trigger notification events
2. Notification service formats message
3. Check user preferences and delivery channels
4. Queue for delivery
5. Attempt delivery with retries
6. Track status
7. Provide delivery report

### API Response

The service will provide:

```typescript
{
  queued: number,
  sent: number,
  failed: number,
  timestamp: string,
  itemsProcessed: number,
}
```

### User Preferences

```typescript
{
  email: {
    all: true,
    alerts: true,
    digest: 'daily',
  },
  push: {
    all: true,
    alerts: true,
  },
  sms: {
    alerts: true,
    critical: true,
  },
  quiet_hours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
  },
}
```

### Error Handling

- API unavailable → queue for retry
- Invalid contact info → skip with warning
- Opt-out → respect preferences immediately
- Rate limits → implement backoff
- Delivery failure → retry with exponential backoff

## Files

- `index.ts` - Service class (not implemented yet)
- `types.ts` - Notification-specific types
- `channels.ts` - Delivery channel implementations
- `queue.ts` - Notification queue
- `README.md` - This file

## Integration Points

- ServiceManager - Registered on startup
- Other services - Emit notification events
- UserService - Delivery preferences
- Cache - User preferences cached
- Queue system - Async notification delivery

## Testing

```typescript
// Future testing pattern
const service = new NotificationsService(testConfig)
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.data.queued).toBeGreaterThanOrEqual(0)
```

## Dependencies (will be added)

- `sendgrid` or `nodemailer` - Email
- `firebase-admin` - Push notifications
- `twilio` - SMS (optional)
- `bull` or `bullmq` - Job queue (Redis)

## Notes

- Email templates for each notification type
- Push notifications require Firebase project
- SMS has per-message cost
- Implement rate limiting to prevent spam
- Consider digest notifications (daily/weekly)
- Privacy: PII in notifications should be minimal
