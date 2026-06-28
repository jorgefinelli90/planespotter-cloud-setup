/**
 * Widget types and interfaces
 * Flexible widget system for dashboards with multiple data sources
 */

/**
 * Base widget configuration
 * All widgets must extend or implement this interface
 */
export interface BaseWidget {
  /** Unique widget identifier */
  id: string
  /** Widget type identifier */
  type: string
  /** Display title */
  title: string
  /** Widget description */
  description?: string
  /** Size in grid units: 'small' (1x1), 'medium' (2x1), 'large' (2x2) */
  size: 'small' | 'medium' | 'large'
  /** Position in grid [column, row] */
  position?: [number, number]
  /** Whether widget is visible */
  isVisible: boolean
  /** Whether widget is in edit mode */
  isEditing?: boolean
  /** Refresh interval in seconds (0 for no refresh) */
  refreshInterval: number
  /** Enable caching for this widget */
  enableCache: boolean
  /** Cache TTL in seconds */
  cacheTTL?: number
}

/**
 * Device status widget
 * Shows overview of a specific device or group of devices
 */
export interface DeviceStatusWidget extends BaseWidget {
  type: 'device_status'
  config: {
    /** Single device ID or array for multi-device view */
    deviceIds: string | string[]
    /** Show battery level */
    showBattery: boolean
    /** Show WiFi signal */
    showWiFiSignal: boolean
    /** Show aircraft count */
    showAircraftCount: boolean
    /** Show uptime */
    showUptime: boolean
    /** Show location */
    showLocation: boolean
  }
}

/**
 * Aircraft feed widget
 * Real-time display of detected aircraft
 */
export interface AircraftFeedWidget extends BaseWidget {
  type: 'aircraft_feed'
  config: {
    /** Filter by device ID (optional) */
    deviceId?: string
    /** Maximum aircraft to display */
    maxItems: number
    /** Sort order: 'latest', 'altitude', 'speed', 'signal' */
    sortBy: 'latest' | 'altitude' | 'speed' | 'signal'
    /** Show aircraft icon */
    showIcon: boolean
    /** Show altitude */
    showAltitude: boolean
    /** Show speed */
    showSpeed: boolean
    /** Show signal strength */
    showSignal: boolean
    /** Show callsign */
    showCallsign: boolean
    /** Enable highlight for interesting aircraft */
    highlightInteresting: boolean
  }
}

/**
 * Statistics widget
 * Displays metrics and statistics
 */
export interface StatisticsWidget extends BaseWidget {
  type: 'statistics'
  config: {
    /** Statistic type: 'total_aircraft', 'device_count', 'uptime', 'messages' */
    statistic: 'total_aircraft' | 'device_count' | 'uptime' | 'messages' | 'custom'
    /** Time period: '24h', '7d', '30d', 'all' */
    period: '24h' | '7d' | '30d' | 'all'
    /** Device IDs to include (empty = all) */
    deviceIds?: string[]
    /** Show trend indicator */
    showTrend: boolean
    /** Show sparkline chart */
    showSparkline: boolean
    /** Custom metric path (for 'custom' type) */
    customPath?: string
  }
}

/**
 * Map widget
 * Displays aircraft or device locations on map
 */
export interface MapWidget extends BaseWidget {
  type: 'map'
  config: {
    /** Show aircraft positions */
    showAircraft: boolean
    /** Show device positions */
    showDevices: boolean
    /** Show aircraft tracks */
    showTracks: boolean
    /** Map center coordinates [lat, lon] */
    center?: [number, number]
    /** Initial zoom level */
    zoom?: number
    /** Aircraft trail duration in minutes */
    trailDuration: number
    /** Enable click interactions */
    enableInteraction: boolean
    /** Color scheme: 'dark', 'light', 'satellite' */
    colorScheme: 'dark' | 'light' | 'satellite'
  }
}

/**
 * Chart widget
 * Generic chart for visualizing time-series data
 */
export interface ChartWidget extends BaseWidget {
  type: 'chart'
  config: {
    /** Chart type: 'line', 'area', 'bar', 'scatter' */
    chartType: 'line' | 'area' | 'bar' | 'scatter'
    /** Data metric to chart */
    metric: string
    /** Time period: '1h', '24h', '7d', '30d' */
    period: '1h' | '24h' | '7d' | '30d'
    /** Data source: 'device', 'aircraft', 'system' */
    dataSource: 'device' | 'aircraft' | 'system'
    /** Filter by device ID (optional) */
    deviceId?: string
    /** Group by: 'hour', 'day', 'none' */
    groupBy: 'hour' | 'day' | 'none'
    /** Show legend */
    showLegend: boolean
    /** Show grid lines */
    showGrid: boolean
    /** Show data points */
    showPoints: boolean
  }
}

/**
 * Alert widget
 * Displays recent alerts and notifications
 */
export interface AlertWidget extends BaseWidget {
  type: 'alerts'
  config: {
    /** Filter by severity: 'info', 'warning', 'error' */
    severity?: 'info' | 'warning' | 'error'
    /** Maximum alerts to display */
    maxItems: number
    /** Show alert icons */
    showIcons: boolean
    /** Show timestamps */
    showTimestamps: boolean
    /** Show device names */
    showDeviceNames: boolean
    /** Enable alert filtering */
    enableFilters: boolean
  }
}

/**
 * Summary widget
 * Key metrics at a glance
 */
export interface SummaryWidget extends BaseWidget {
  type: 'summary'
  config: {
    /** Metrics to display */
    metrics: Array<{
      /** Metric key */
      key: string
      /** Display label */
      label: string
      /** Metric icon */
      icon?: string
    }>
    /** Display format: 'compact', 'detailed' */
    format: 'compact' | 'detailed'
    /** Show trend arrows */
    showTrends: boolean
  }
}

/**
 * Custom widget
 * Extensible widget for custom implementations
 */
export interface CustomWidget extends BaseWidget {
  type: 'custom'
  config: {
    /** Custom component identifier */
    componentId: string
    /** Component-specific configuration */
    componentConfig: Record<string, unknown>
    /** Component data source */
    dataSource?: string
    /** Custom CSS classes */
    customClasses?: string
  }
}

/**
 * Union type for all widget types
 */
export type Widget =
  | DeviceStatusWidget
  | AircraftFeedWidget
  | StatisticsWidget
  | MapWidget
  | ChartWidget
  | AlertWidget
  | SummaryWidget
  | CustomWidget

/**
 * Widget layout configuration
 * Defines the grid layout and widget arrangement
 */
export interface WidgetLayout {
  /** Unique layout identifier */
  id: string
  /** Layout name */
  name: string
  /** Associated dashboard/page */
  dashboardId: string
  /** Grid columns */
  columns: number
  /** Array of widgets in this layout */
  widgets: Widget[]
  /** Layout created timestamp (ISO 8601) */
  createdAt: string
  /** Layout updated timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Widget preset/template
 * Pre-configured widget for quick setup
 */
export interface WidgetPreset {
  /** Unique preset identifier */
  id: string
  /** Preset name */
  name: string
  /** Preset description */
  description: string
  /** Widget type this preset is for */
  widgetType: Widget['type']
  /** Preset configuration */
  config: Record<string, unknown>
  /** Category/tag */
  category?: string
  /** Is built-in preset */
  isBuiltIn: boolean
}
