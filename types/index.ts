/**
 * PlaneSpotter Cloud - Type Definitions Index
 * Central export point for all TypeScript types and interfaces
 *
 * This file serves as the main entry point for accessing all data models
 * across PlaneSpotter Cloud, web dashboard, mobile app, and ESP32 devices.
 */

// Common types and utilities
export type {
  GeoLocation,
  PaginationParams,
  PaginationMeta,
  ErrorResponse,
  ApiResponse,
  AuditMetadata,
  ConnectionStatus,
  HealthStatus,
} from './common'

// Device types
export type {
  Device,
  DeviceMetrics,
  DeviceConfig,
  DeviceFirmware,
  DeviceStatistics,
  DeviceEvent,
  DeviceGroup,
} from './device'

// Device location types
export type { DeviceLocation, LocationSource } from './device-location'

// Firmware types
export type {
  FirmwareRelease,
  OTAUpdateJob,
  FirmwareRollback,
  DeploymentStrategy,
  FirmwareBuild,
} from './firmware'

// Aircraft types
export type {
  Aircraft,
  AircraftTrack,
  AircraftTrackPoint,
  AircraftStatistics,
  AircraftAlert,
  AircraftFleetStatistics,
  AircraftRegistry,
} from './aircraft'

// Widget types
export type {
  BaseWidget,
  DeviceStatusWidget,
  AircraftFeedWidget,
  StatisticsWidget,
  MapWidget,
  ChartWidget,
  AlertWidget,
  SummaryWidget,
  CustomWidget,
  Widget,
  WidgetLayout,
  WidgetPreset,
} from './widget'

// Dashboard types
export type {
  Dashboard,
  ESP32Dashboard,
  ESP32DashboardElement,
  DashboardShare,
  DashboardTemplate,
  DashboardActivity,
  WidgetState,
  DashboardExport,
} from './dashboard'

// News types
export type {
  NewsArticle,
  NewsSource,
  NewsFeed,
  SavedArticle,
  NewsNotificationPreference,
  NewsAnalytics,
} from './news'

// Weather types
export type {
  Weather,
  WeatherCondition,
  WeatherForecast,
  WeatherForecastPeriod,
  METAR,
  TAF,
  TAFPeriod,
  WeatherAlert,
  WeatherHistory,
  WeatherSubscription,
} from './weather'

// Alert types
export type {
  Alert,
  AlertRule,
  AlertSuppression,
  AlertNotificationPreference,
  AlertHistory,
  AlertStatistics,
  AlertBatchOperation,
  EscalationPolicy,
} from './alert'

// Settings types
export type {
  UserSettings,
  DeviceNetworkSettings,
  DeviceFeatureSettings,
  SystemSettings,
  AppSettings,
  SecuritySettings,
  NotificationSettings,
  BackupSettings,
} from './settings'

/**
 * Common type guards and utility functions
 */

/**
 * Type-safe record for type guard function implementations
 */
type TypeGuards = {
  isGeoLocation(value: unknown): boolean
  isDevice(value: unknown): boolean
  isAircraft(value: unknown): boolean
}

/**
 * Runtime type guard implementations
 * Use these to safely validate data at runtime
 */
const typeGuards: TypeGuards = {
  isGeoLocation(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false
    const loc = value as Record<string, unknown>
    return (
      typeof loc.latitude === 'number' &&
      typeof loc.longitude === 'number' &&
      typeof loc.altitude === 'number'
    )
  },

  isDevice(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false
    const device = value as Record<string, unknown>
    return (
      typeof device.id === 'string' &&
      typeof device.name === 'string' &&
      typeof device.status === 'string' &&
      this.isGeoLocation(device.location)
    )
  },

  isAircraft(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false
    const aircraft = value as Record<string, unknown>
    return (
      typeof aircraft.id === 'string' &&
      typeof aircraft.icao24 === 'string' &&
      typeof aircraft.groundSpeed === 'number' &&
      this.isGeoLocation(aircraft.position)
    )
  },
}

/**
 * Export type guard functions
 */
export const isGeoLocation = (value: unknown) => typeGuards.isGeoLocation(value)
export const isDevice = (value: unknown) => typeGuards.isDevice(value)
export const isAircraft = (value: unknown) => typeGuards.isAircraft(value)

/**
 * Type version information
 * Increment MINOR when adding new types, increment MAJOR for breaking changes
 */
export const TYPE_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  timestamp: '2024-06-28T00:00:00Z',
} as const

/**
 * Exported version string (semver)
 */
export const VERSION = `${TYPE_VERSION.major}.${TYPE_VERSION.minor}.${TYPE_VERSION.patch}`
