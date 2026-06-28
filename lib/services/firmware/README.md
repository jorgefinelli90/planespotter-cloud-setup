# Firmware Service

ESP32 firmware management and OTA updates service.

## Status

**Sprint 4:** Placeholder only - architecture defined, no implementation

## Future Implementation (Sprint 5+)

### Purpose

Manages firmware versions, OTA updates, and device health for PlaneSpotter ESP32 devices.

### Responsibilities

- Track firmware versions
- Manage OTA update campaigns
- Stage updates for devices
- Coordinate rollout
- Handle rollback
- Monitor device health
- Report update status

### Configuration

```typescript
// Future implementation
const firmwareService = new FirmwareService({
  storageUrl: process.env.STORAGE_URL,
  maxConcurrentUpdates: 10,
  updateTimeout: 600000, // 10 minutes
  rollbackOnError: true,
  stagingStrategy: 'gradual', // or 'immediate'
})
```

### Data Flow

1. Service checks for new firmware versions
2. Validate against device hardware versions
3. Stage updates for configured devices
4. Monitor OTA process
5. Handle failures and rollbacks
6. Report metrics
7. Clean up old firmware files

### API Response

The service will provide:

```typescript
{
  versions: FirmwareRelease[],
  deployments: DeploymentStrategy[],
  devices: { updating: number, failed: number, success: number },
  timestamp: string,
  itemsProcessed: number,
}
```

### Update Strategies

- Immediate: Update all devices at once (testing only)
- Gradual: Update in batches (10% at a time)
- Rolling: Update one by one, monitor health
- Scheduled: Update at specific times

### Rollback Strategy

- Automatic rollback if:
  - Update process timeout
  - Device health degrades
  - Multiple devices report errors
- Manual rollback available

### Error Handling

- Connection loss → queue for retry
- Update failure → automatic rollback
- Hardware mismatch → skip device
- Storage unavailable → defer update

## Files

- `index.ts` - Service class (not implemented yet)
- `types.ts` - Firmware-specific types
- `deployment.ts` - Deployment strategies
- `README.md` - This file

## Integration Points

- ServiceManager - Registered on startup
- Scheduler - Runs periodically (hourly)
- Cache - Firmware metadata cached
- Notifications - Alerts on update/rollback
- Device API - Coordinates with devices

## Testing

```typescript
// Future testing pattern
const service = new FirmwareService(testConfig)
await service.initialize()

const result = await service.execute()
expect(result.status).toBe('success')
expect(result.data.versions).toBeDefined()
```

## Dependencies (will be added)

- `aws-sdk` or blob storage SDK
- Binary/firmware distribution tools

## Notes

- Firmware files can be large (10+ MB)
- OTA requires stable connection
- Battery consideration for ESP32
- Version compatibility matrix critical
- Consider delta/patch updates for efficiency
