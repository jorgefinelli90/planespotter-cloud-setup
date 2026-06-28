/**
 * Dashboard types and interfaces
 * Defines dashboards for web and ESP32 display
 */

import type { Widget, WidgetLayout } from './widget'

/**
 * Web dashboard configuration
 * Customizable dashboard for PlaneSpotter Cloud web interface
 */
export interface Dashboard {
  /** Unique dashboard identifier */
  id: string
  /** Dashboard name/title */
  name: string
  /** Dashboard description */
  description?: string
  /** User ID that owns this dashboard */
  userId: string
  /** Dashboard visibility: 'private', 'team', 'public' */
  visibility: 'private' | 'team' | 'public'
  /** Dashboard type/category */
  type: 'overview' | 'device' | 'aircraft' | 'analytics' | 'custom'
  /** Is default/home dashboard */
  isDefault: boolean
  /** Current layout configuration */
  layout: WidgetLayout
  /** Dashboard-specific settings */
  settings: {
    /** Enable real-time updates */
    realtimeUpdates: boolean
    /** Update frequency in seconds */
    updateFrequency: number
    /** Enable notifications */
    enableNotifications: boolean
    /** Dark mode enabled */
    darkMode: boolean
    /** Display density: 'compact', 'comfortable', 'spacious' */
    density: 'compact' | 'comfortable' | 'spacious'
  }
  /** Dashboard tags/labels */
  tags?: string[]
  /** Time-based refresh schedule */
  refreshSchedule?: {
    /** Enable scheduled refresh */
    enabled: boolean
    /** Refresh interval in minutes */
    interval: number
    /** Start time (HH:MM format) */
    startTime?: string
    /** End time (HH:MM format) */
    endTime?: string
  }
  /** Created timestamp (ISO 8601) */
  createdAt: string
  /** Updated timestamp (ISO 8601) */
  updatedAt: string
  /** Last viewed timestamp (ISO 8601) */
  lastViewedAt?: string
}

/**
 * ESP32 dashboard configuration
 * Simplified dashboard for ESP32 display (e.g., e-ink screen)
 */
export interface ESP32Dashboard {
  /** Unique dashboard identifier */
  id: string
  /** Device ID this dashboard is assigned to */
  deviceId: string
  /** Dashboard name */
  name: string
  /** Display type: 'eink', 'lcd', 'oled', 'none' */
  displayType: 'eink' | 'lcd' | 'oled' | 'none'
  /** Display resolution */
  resolution: {
    /** Screen width in pixels */
    width: number
    /** Screen height in pixels */
    height: number
  }
  /** Dashboard layout/content */
  layout: {
    /** Screen rows (typically 2-4 for ESP32) */
    rows: number
    /** Screen columns (typically 1-2 for ESP32) */
    columns: number
    /** Array of display elements */
    elements: ESP32DashboardElement[]
  }
  /** Refresh interval in seconds */
  refreshInterval: number
  /** Display brightness (0-100) */
  brightness: number
  /** Rotation angle: 0, 90, 180, 270 */
  rotation: 0 | 90 | 180 | 270
  /** Enable/disable dashboard */
  isEnabled: boolean
  /** Dashboard visibility */
  visibility: 'always' | 'scheduled' | 'on_demand'
  /** Display schedule (if scheduled visibility) */
  schedule?: {
    /** Start time (HH:MM format) */
    startTime: string
    /** End time (HH:MM format) */
    endTime: string
    /** Days of week (0=Sunday) */
    daysOfWeek: number[]
  }
  /** Created timestamp (ISO 8601) */
  createdAt: string
  /** Updated timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Display element for ESP32 dashboard
 */
export interface ESP32DashboardElement {
  /** Element unique identifier */
  id: string
  /** Element type */
  type:
    | 'text'
    | 'metric'
    | 'icon'
    | 'bar'
    | 'gauge'
    | 'status'
    | 'weather'
    | 'aircraft_count'
  /** Element position [row, column] */
  position: [number, number]
  /** Element size [width, height] in grid units */
  size: [number, number]
  /** Display label */
  label?: string
  /** Element-specific configuration */
  config: Record<string, unknown>
  /** Display format/template */
  format?: string
  /** Data binding */
  dataBinding?: {
    /** Data source type */
    source: 'device_metric' | 'aircraft_count' | 'weather' | 'static' | 'custom'
    /** Data field path */
    field: string
    /** Transform function (JS expression) */
    transform?: string
  }
}

/**
 * Dashboard shared access
 * Controls who can view/edit a dashboard
 */
export interface DashboardShare {
  /** Unique share identifier */
  id: string
  /** Dashboard ID */
  dashboardId: string
  /** Shared with user ID (null = public link) */
  userId?: string
  /** Share token for public/anonymous access */
  shareToken?: string
  /** Permission level: 'view', 'comment', 'edit' */
  permission: 'view' | 'comment' | 'edit'
  /** Share expiration (ISO 8601), null = never expires */
  expiresAt?: string
  /** Whether share is active */
  isActive: boolean
  /** Created timestamp (ISO 8601) */
  createdAt: string
}

/**
 * Dashboard template/preset
 * Pre-configured dashboards for quick setup
 */
export interface DashboardTemplate {
  /** Template identifier */
  id: string
  /** Template name */
  name: string
  /** Template description */
  description: string
  /** Template category: 'overview', 'device', 'aircraft', etc. */
  category: string
  /** Thumbnail image URL */
  thumbnailUrl?: string
  /** Dashboard configuration template */
  dashboard: Omit<Dashboard, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastViewedAt'>
  /** Is official template */
  isOfficial: boolean
  /** Template tags */
  tags?: string[]
  /** Download/use count */
  usageCount?: number
}

/**
 * Dashboard activity log
 */
export interface DashboardActivity {
  /** Activity identifier */
  id: string
  /** Dashboard ID */
  dashboardId: string
  /** User ID (if applicable) */
  userId?: string
  /** Activity type */
  type: 'created' | 'updated' | 'viewed' | 'shared' | 'deleted' | 'restored'
  /** Activity description */
  description: string
  /** Changed fields (for updates) */
  changes?: Record<string, { old: unknown; new: unknown }>
  /** Activity timestamp (ISO 8601) */
  timestamp: string
}

/**
 * Dashboard widget state
 * Persists widget state between sessions
 */
export interface WidgetState {
  /** Widget ID */
  widgetId: string
  /** Widget-specific state */
  state: Record<string, unknown>
  /** State last updated (ISO 8601) */
  updatedAt: string
}

/**
 * Dashboard export configuration
 */
export interface DashboardExport {
  /** Export format: 'json', 'csv', 'pdf' */
  format: 'json' | 'csv' | 'pdf'
  /** Date range for export */
  dateRange?: {
    /** Start date (ISO 8601) */
    start: string
    /** End date (ISO 8601) */
    end: string
  }
  /** Include widget data */
  includeData: boolean
  /** Include charts/visualizations */
  includeVisualizations: boolean
}
