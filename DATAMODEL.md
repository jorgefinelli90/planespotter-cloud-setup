# PlaneSpotter Cloud - Data Model Architecture

## Overview

The PlaneSpotter Cloud data model defines the complete contract between:
- **Web Dashboard** - Browser-based monitoring and configuration
- **Mobile App** - iOS/Android companion app
- **ESP32 Devices** - Hardware tracking and data collection
- **Backend Services** - API and processing services

All types are defined in TypeScript interfaces with comprehensive JSDoc documentation for IDE support and type safety.

## Directory Structure

```
types/
├── index.ts              # Central export point with type guards
├── common.ts             # Base types (GeoLocation, Pagination, Error responses)
├── device.ts             # Device models (Device, DeviceMetrics, DeviceConfig)
├── firmware.ts           # Firmware management (Releases, OTA, Rollback, Deployment)
├── aircraft.ts           # Aircraft tracking (Aircraft, Track, Statistics, Alerts)
├── widget.ts             # Dashboard widgets (Base, Status, Feed, Chart, etc.)
├── dashboard.ts          # Dashboard configurations (Web, ESP32, Sharing)
├── news.ts               # News feeds and articles
├── weather.ts            # Weather data (METAR, TAF, Forecasts, Alerts)
├── alert.ts              # System alerts and notifications
└── settings.ts           # User and device configuration
```

## Core Entities

### 1. Device (`types/device.ts`)

**Purpose**: Represents a PlaneSpotter ESP32 device in the cloud.

**Key Interfaces**:
- `Device` - Complete device state with location, battery, WiFi, firmware version
- `DeviceMetrics` - Real-time metrics (battery, WiFi, CPU, RAM, temperature)
- `DeviceConfig` - User configuration (tracking mode, filters, intervals)
- `DeviceStatistics` - Historical stats (aircraft detected, uptime, performance)
- `DeviceEvent` - Event log entries (connection, firmware, errors, restarts)
- `DeviceGroup` - Organization of multiple devices

**Common Patterns**:
```typescript
// Create a device reference
const device: Device = {
  id: 'device-001',
  name: 'London-1',
  status: 'connected',
  health: 'healthy',
  location: { latitude: 51.5074, longitude: -0.1278, altitude: 10 },
  // ... rest of properties
}

// Check device status
if (device.status === 'connected' && device.batteryLevel > 20) {
  // Device is operational
}
```

### 2. Aircraft (`types/aircraft.ts`)

**Purpose**: Tracks detected aircraft and maintains flight history.

**Key Interfaces**:
- `Aircraft` - Individual aircraft detection with position, speed, altitude
- `AircraftTrack` - Complete flight path with multiple track points
- `AircraftTrackPoint` - Single position in track history
- `AircraftStatistics` - Aggregate data (detections, devices, signals)
- `AircraftAlert` - Flags for interesting/important aircraft
- `AircraftRegistry` - Cached aircraft database info (registration, manufacturer)

**Common Patterns**:
```typescript
// Process detected aircraft
const aircraft: Aircraft = {
  id: 'aircraft-icao',
  icao24: 'a1b2c3',
  callsign: 'BA123',
  position: { latitude: 51.45, longitude: -0.05, altitude: 8000 },
  groundSpeed: 450,
  onGround: false,
  signalStrength: -35,
  // ... rest of properties
}

// Check if aircraft is emergency
if (aircraft.isEmergency) {
  // Alert user
}
```

### 3. Widget & Dashboard (`types/widget.ts`, `types/dashboard.ts`)

**Purpose**: Flexible UI components for web and ESP32 displays.

**Key Interfaces**:
- `BaseWidget` - Common widget properties (type, size, title, refresh)
- `DeviceStatusWidget` - Device overview widget
- `AircraftFeedWidget` - Real-time aircraft list
- `StatisticsWidget` - Metrics and charts
- `MapWidget` - Geographic display
- `ChartWidget` - Time-series visualization
- `AlertWidget` - System alerts display
- `Dashboard` - Web dashboard configuration
- `ESP32Dashboard` - Minimal e-ink display config

**Common Patterns**:
```typescript
// Create dashboard widget
const widget: AircraftFeedWidget = {
  id: 'feed-1',
  type: 'aircraft_feed',
  title: 'Live Aircraft',
  size: 'large',
  isVisible: true,
  refreshInterval: 5,
  enableCache: true,
  config: {
    maxItems: 20,
    sortBy: 'latest',
    showAltitude: true,
    highlightInteresting: true,
  }
}

// Dashboard layout
const dashboard: Dashboard = {
  id: 'main-dash',
  name: 'Operations',
  type: 'overview',
  isDefault: true,
  layout: {
    id: 'layout-1',
    columns: 3,
    widgets: [widget],
    // ... more widgets
  },
  // ... rest of properties
}
```

### 4. Firmware Management (`types/firmware.ts`)

**Purpose**: Manages device firmware versions, updates, and deployments.

**Key Interfaces**:
- `FirmwareRelease` - Version info with downloads and checksums
- `OTAUpdateJob` - Update deployment task with progress tracking
- `FirmwareRollback` - Rollback request workflow
- `DeploymentStrategy` - Staged rollout configuration
- `FirmwareBuild` - Build artifacts and test results

**Common Patterns**:
```typescript
// OTA update workflow
const updateJob: OTAUpdateJob = {
  id: 'job-1',
  deviceId: 'device-001',
  firmwareVersion: '1.2.3',
  status: 'in_progress',
  progress: 45,
  retryCount: 0,
  maxRetries: 3,
  // ... timestamps
}

// Monitor update progress
if (updateJob.status === 'completed') {
  console.log('Device updated successfully')
}
```

### 5. Alerts & Notifications (`types/alert.ts`)

**Purpose**: System-wide alerting and incident management.

**Key Interfaces**:
- `Alert` - Individual alert with status and severity
- `AlertRule` - Trigger configuration for automatic alerts
- `AlertSuppression` - Suppress alerts temporarily
- `AlertNotificationPreference` - User notification settings
- `EscalationPolicy` - Alert escalation procedures

**Common Patterns**:
```typescript
// Create alert rule
const rule: AlertRule = {
  id: 'rule-1',
  name: 'Device Low Battery',
  type: 'threshold',
  isEnabled: true,
  target: 'device.batteryLevel',
  operator: 'less_than',
  value: 20,
  action: {
    type: 'alert',
    severity: 'high',
  },
  scope: { type: 'all' },
}

// Trigger alert
const alert: Alert = {
  id: 'alert-1',
  type: 'device_low_battery',
  severity: 'high',
  deviceId: 'device-001',
  title: 'Low Battery',
  message: 'Device-001 battery at 15%',
  status: 'open',
  requiresAction: true,
  // ... timestamps
}
```

### 6. Settings (`types/settings.ts`)

**Purpose**: Configuration for users, devices, and system.

**Key Interfaces**:
- `UserSettings` - Display, privacy, unit preferences
- `DeviceNetworkSettings` - WiFi, Bluetooth, proxy configuration
- `DeviceFeatureSettings` - Tracking, weather, news collection
- `SecuritySettings` - 2FA, API keys, sessions
- `NotificationSettings` - Email, SMS, webhook preferences
- `BackupSettings` - Auto-backup and restore configuration

**Common Patterns**:
```typescript
// User preferences
const settings: UserSettings = {
  userId: 'user-001',
  display: {
    theme: 'dark',
    locale: 'en-US',
    timezone: 'Europe/London',
    temperatureUnit: 'celsius',
    distanceUnit: 'metric',
    speedUnit: 'knots',
  },
  privacy: {
    profileVisibility: 'private',
    allowAnalytics: true,
    allowMarketing: false,
  },
  updatedAt: '2024-06-28T10:00:00Z',
}
```

### 7. News & Weather (`types/news.ts`, `types/weather.ts`)

**Purpose**: External data integration with news feeds and weather.

**News Types**:
- `NewsArticle` - Individual article with metadata
- `NewsSource` - Feed source configuration
- `NewsFeed` - User feed subscription
- `NewsNotificationPreference` - Alert settings

**Weather Types**:
- `Weather` - Current conditions
- `WeatherForecast` - Multi-period forecast
- `METAR` - Aviation weather report
- `TAF` - Aviation forecast
- `WeatherAlert` - Severe weather alerts

## Design Patterns

### 1. Optional Fields with ?

Fields that may not always be present use optional markers:

```typescript
interface Device {
  id: string              // Always required
  name: string            // Always required
  wifiSsid?: string       // Optional
  config?: Record<string, unknown>  // Optional metadata
}
```

### 2. Discriminated Unions for Type Safety

Use type discriminators to ensure correct variants:

```typescript
// AlertRule uses 'type' field to distinguish action types
type AlertAction = 
  | { type: 'alert'; severity: 'critical' | 'high' | 'medium' | 'low' }
  | { type: 'email'; destination: string }
  | { type: 'webhook'; destination: string }

// Narrows down properties based on discriminator
const action: AlertAction = {
  type: 'email',
  destination: 'admin@example.com'
}
```

### 3. Timestamps (ISO 8601)

All timestamps use ISO 8601 format for consistency:

```typescript
const alert: Alert = {
  id: 'alert-1',
  createdAt: '2024-06-28T10:15:30Z',    // ISO 8601
  acknowledgedAt: '2024-06-28T10:20:00Z',
  resolvedAt: '2024-06-28T11:00:00Z',
}
```

### 4. Metadata for Extensibility

Use `Record<string, unknown>` for flexible metadata:

```typescript
interface Device {
  config?: Record<string, unknown>  // Extensible without schema changes
}

// Can add any custom data
const device: Device = {
  // ... required fields
  config: {
    customRadioFrequency: 121.5,
    sensorCalibration: { offset: 1.2 },
  }
}
```

### 5. Status Enums

Use string unions for type-safe status values:

```typescript
type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'idle'

// TypeScript ensures only valid values
const status: ConnectionStatus = 'connected' ✓
const invalid: ConnectionStatus = 'unknown' ✗  // Error!
```

## API Response Wrapper

All API responses follow a standard structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ErrorResponse
  pagination?: PaginationMeta
  timestamp: string
}

// Example: Successful device list response
const response: ApiResponse<Device[]> = {
  success: true,
  data: [device1, device2],
  pagination: {
    page: 1,
    limit: 20,
    total: 150,
    totalPages: 8,
    hasMore: true,
  },
  timestamp: '2024-06-28T10:15:30Z',
}

// Example: Error response
const errorResponse: ApiResponse<null> = {
  success: false,
  error: {
    code: 'DEVICE_NOT_FOUND',
    message: 'Device with ID not found',
    requestId: 'req-12345',
  },
  timestamp: '2024-06-28T10:15:30Z',
}
```

## Type Guards

Utility functions for runtime type checking:

```typescript
import { isDevice, isAircraft, isGeoLocation } from '@/types'

// Safely check types at runtime
if (isDevice(data)) {
  // TypeScript knows data is Device type
  console.log(data.batteryLevel)
}

if (isAircraft(data)) {
  // TypeScript knows data is Aircraft type
  console.log(data.groundSpeed)
}
```

## Importing Types

Always import from the main index for consistency:

```typescript
// ✓ Correct
import type { Device, Aircraft, Dashboard } from '@/types'

// ✗ Avoid
import type { Device } from '@/types/device'
import type { Aircraft } from '@/types/aircraft'
```

## Extending Types

For custom implementations, extend existing types:

```typescript
import type { Widget } from '@/types'

interface CustomWidget extends Widget {
  type: 'custom'
  config: {
    componentId: string
    // Your custom properties
  }
}
```

## Versioning

Type definitions are versioned in `types/index.ts`:

```typescript
export const TYPE_VERSION = {
  major: 1,    // Breaking changes
  minor: 0,    // New types added
  patch: 0,    // Documentation fixes
}

export const VERSION = '1.0.0'
```

Increment versions when:
- **MAJOR**: Breaking changes (field removals, type changes)
- **MINOR**: New types or optional fields added
- **PATCH**: Documentation, comments, or non-breaking improvements

## Next Steps

Sprint 3 will focus on:
- Database schema and ORM integration (Drizzle + Neon)
- API route handlers using these types
- Real-time WebSocket schema
- Client-side state management integration
- Validation schemas (Zod/Valibot)

---

**Last Updated**: 2024-06-28
**Type Version**: 1.0.0
**Total Interfaces**: 50+
**Total Types**: 100+
