/**
 * Device types and interfaces
 * Defines the structure for ESP32 PlaneSpotter devices and their configurations
 */

import type { GeoLocation, ConnectionStatus, HealthStatus, AuditMetadata } from './common'

/**
 * Represents an ESP32 PlaneSpotter device
 * Core entity managing aircraft tracking and data collection
 */
export interface Device {
  /** Unique device identifier (UUID or MAC address) */
  id: string
  /** User-friendly device name */
  name: string
  /** Device description or location */
  description?: string
  /** Current device status */
  status: ConnectionStatus
  /** Overall health status */
  health: HealthStatus
  /** Current GPS location */
  location: GeoLocation
  /** Last known position update timestamp (ISO 8601) */
  lastLocationUpdate: string
  /** Battery level percentage (0-100) */
  batteryLevel: number
  /** Whether device is currently powered (true) or on battery (false) */
  isPowered: boolean
  /** Firmware version currently running */
  firmwareVersion: string
  /** Hardware revision or model identifier */
  hardwareRevision: string
  /** Current WiFi SSID connection */
  wifiSsid?: string
  /** WiFi signal strength (dBm) */
  wifiSignal?: number
  /** Total number of aircraft detected since device startup */
  aircraftDetected: number
  /** Total number of messages received */
  messagesReceived: number
  /** Current uptime in seconds */
  uptime: number
  /** Device metadata and timestamps */
  metadata: AuditMetadata
  /** Custom tags for organization and filtering */
  tags?: string[]
  /** Optional additional configuration data */
  config?: Record<string, unknown>
}

/**
 * Real-time device metrics
 * Lightweight snapshot of current device state
 */
export interface DeviceMetrics {
  /** Device ID */
  deviceId: string
  /** Current battery level percentage */
  batteryLevel: number
  /** Current WiFi signal strength */
  wifiSignal: number
  /** Messages per second rate */
  messagesPerSecond: number
  /** CPU usage percentage */
  cpuUsage: number
  /** RAM usage percentage */
  ramUsage: number
  /** Temperature in Celsius (if sensor available) */
  temperature?: number
  /** Timestamp of metrics collection (ISO 8601) */
  timestamp: string
}

/**
 * Device configuration settings
 * Customization parameters for individual devices
 */
export interface DeviceConfig {
  /** Device ID */
  deviceId: string
  /** Display name */
  displayName: string
  /** Location label */
  location: string
  /** Whether device is actively tracking */
  isActive: boolean
  /** Tracking mode: 'continuous' or 'scheduled' */
  trackingMode: 'continuous' | 'scheduled'
  /** Minimum signal strength filter (dBm) */
  minSignalStrength: number
  /** Update interval in seconds */
  updateInterval: number
  /** Enable altitude tracking */
  altitudeTracking: boolean
  /** Enable weather data collection */
  weatherData: boolean
  /** Enable news feed collection */
  newsCollection: boolean
  /** Custom metadata */
  metadata?: Record<string, unknown>
}

/**
 * Device firmware information
 * Tracks firmware versions and updates
 */
export interface DeviceFirmware {
  /** Device ID */
  deviceId: string
  /** Current firmware version (semantic versioning) */
  currentVersion: string
  /** Latest available firmware version */
  latestVersion: string
  /** Firmware release date (ISO 8601) */
  releaseDate: string
  /** Whether update is available */
  updateAvailable: boolean
  /** Update channel: 'stable' or 'beta' */
  channel: 'stable' | 'beta'
  /** Release notes URL */
  releaseNotesUrl?: string
}

/**
 * Device statistics for dashboard and analytics
 */
export interface DeviceStatistics {
  /** Device ID */
  deviceId: string
  /** Total aircraft detected (lifetime) */
  totalAircraftDetected: number
  /** Aircraft detected in last 24 hours */
  aircraftDetected24h: number
  /** Aircraft detected in last 7 days */
  aircraftDetected7d: number
  /** Average uptime percentage */
  avgUptime: number
  /** Total operational hours */
  totalHours: number
  /** Date range for statistics */
  period: {
    /** Start date (ISO 8601) */
    start: string
    /** End date (ISO 8601) */
    end: string
  }
}

/**
 * Device event log entry
 * Records significant events from device lifecycle
 */
export interface DeviceEvent {
  /** Unique event identifier */
  id: string
  /** Device ID */
  deviceId: string
  /** Event type */
  type:
    | 'connected'
    | 'disconnected'
    | 'firmware_updated'
    | 'config_changed'
    | 'error'
    | 'battery_low'
    | 'restart'
    | 'custom'
  /** Event severity: 'info', 'warning', or 'error' */
  severity: 'info' | 'warning' | 'error'
  /** Human-readable event message */
  message: string
  /** Additional event data */
  data?: Record<string, unknown>
  /** Event timestamp (ISO 8601) */
  timestamp: string
}

/**
 * Device group for organizing multiple devices
 */
export interface DeviceGroup {
  /** Unique group identifier */
  id: string
  /** Group name */
  name: string
  /** Group description */
  description?: string
  /** Array of device IDs in this group */
  deviceIds: string[]
  /** Geographic region or area */
  region?: string
  /** Creation timestamp (ISO 8601) */
  createdAt: string
  /** Last updated timestamp (ISO 8601) */
  updatedAt: string
}
