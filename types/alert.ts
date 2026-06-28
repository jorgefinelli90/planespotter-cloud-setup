/**
 * Alert types and interfaces
 * System alerts, notifications, and incident management
 */

/**
 * System alert/notification
 */
export interface Alert {
  /** Unique alert identifier */
  id: string
  /** Alert type */
  type:
    | 'device_offline'
    | 'device_low_battery'
    | 'device_error'
    | 'aircraft_alert'
    | 'system_error'
    | 'maintenance'
    | 'security'
    | 'performance'
    | 'custom'
  /** Alert severity */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  /** Related device ID (if applicable) */
  deviceId?: string
  /** Related aircraft ID (if applicable) */
  aircraftId?: string
  /** Alert title/subject */
  title: string
  /** Detailed alert message */
  message: string
  /** Alert status */
  status: 'open' | 'acknowledged' | 'resolved' | 'dismissed'
  /** Whether alert requires action */
  requiresAction: boolean
  /** Suggested action or resolution */
  suggestedAction?: string
  /** Alert URL (for more details) */
  url?: string
  /** Alert tags/categories */
  tags?: string[]
  /** Created timestamp (ISO 8601) */
  createdAt: string
  /** Acknowledged timestamp (ISO 8601) */
  acknowledgedAt?: string
  /** Resolved timestamp (ISO 8601) */
  resolvedAt?: string
  /** Additional context data */
  metadata?: Record<string, unknown>
}

/**
 * Alert rule/trigger configuration
 */
export interface AlertRule {
  /** Rule identifier */
  id: string
  /** Rule name */
  name: string
  /** Rule description */
  description?: string
  /** Rule type */
  type:
    | 'threshold'
    | 'anomaly'
    | 'time_based'
    | 'event_based'
    | 'pattern'
  /** Whether rule is enabled */
  isEnabled: boolean
  /** Target metric/field to monitor */
  target: string
  /** Condition operator */
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'matches'
  /** Threshold value */
  value: unknown
  /** Action to take when rule triggers */
  action: {
    /** Action type */
    type: 'alert' | 'email' | 'webhook' | 'sms' | 'slack'
    /** Alert severity */
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    /** Destination (email, webhook URL, etc.) */
    destination?: string
  }
  /** Grace period in seconds (prevents duplicate alerts) */
  gracePeriod?: number
  /** Apply rule to: 'all', specific device IDs, or tags */
  scope: {
    /** Scope type */
    type: 'all' | 'devices' | 'tags' | 'groups'
    /** Device IDs, tags, or group IDs */
    values?: string[]
  }
  /** Cooldown period before next alert in seconds */
  cooldownPeriod?: number
  /** Created at (ISO 8601) */
  createdAt: string
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Alert suppression rule
 * Temporarily suppress alerts matching certain criteria
 */
export interface AlertSuppression {
  /** Suppression identifier */
  id: string
  /** Alert type to suppress */
  alertType?: string
  /** Device ID to suppress (optional) */
  deviceId?: string
  /** Suppress matching tags */
  tags?: string[]
  /** Suppression reason */
  reason: string
  /** Active from (ISO 8601) */
  activeFrom: string
  /** Active until (ISO 8601) */
  activeUntil: string
  /** Is currently active */
  isActive: boolean
  /** Created by user/system */
  createdBy: string
  /** Created at (ISO 8601) */
  createdAt: string
}

/**
 * Alert notification preference
 */
export interface AlertNotificationPreference {
  /** User ID */
  userId: string
  /** Enable notifications */
  enabled: boolean
  /** Notification method: 'email', 'in_app', 'sms', 'slack', 'webhook' */
  methods: Array<{
    /** Method type */
    type: 'email' | 'in_app' | 'sms' | 'slack' | 'webhook'
    /** Destination (email, phone, Slack channel, webhook URL) */
    destination: string
    /** Minimum severity to notify about */
    minSeverity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    /** Is enabled */
    enabled: boolean
  }>
  /** Quiet hours (no notifications outside this window) */
  quietHours?: {
    /** Start time (HH:MM format) */
    start: string
    /** End time (HH:MM format) */
    end: string
    /** Days when quiet hours apply (0=Sunday) */
    days?: number[]
  }
  /** Notification frequency: 'instant', 'digest' */
  frequency: 'instant' | 'digest'
  /** For digest mode, period in minutes */
  digestPeriod?: number
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Alert history/audit
 */
export interface AlertHistory {
  /** History entry identifier */
  id: string
  /** Alert ID */
  alertId: string
  /** Change type */
  changeType: 'created' | 'status_changed' | 'acknowledged' | 'resolved' | 'dismissed' | 'reopened'
  /** Previous status */
  previousStatus?: string
  /** New status */
  newStatus?: string
  /** Changed by user/system */
  changedBy: string
  /** Change comment/note */
  comment?: string
  /** Timestamp (ISO 8601) */
  timestamp: string
}

/**
 * Alert statistics/analytics
 */
export interface AlertStatistics {
  /** Date range */
  period: {
    /** Start date (ISO 8601) */
    start: string
    /** End date (ISO 8601) */
    end: string
  }
  /** Total alerts */
  total: number
  /** Alerts by severity */
  bySeverity: Record<string, number>
  /** Alerts by type */
  byType: Record<string, number>
  /** Alerts by status */
  byStatus: Record<string, number>
  /** Average resolution time in minutes */
  avgResolutionTime: number
  /** Most common alert types */
  topAlertTypes: Array<{
    /** Type */
    type: string
    /** Count */
    count: number
  }>
  /** Alert resolution rate (%) */
  resolutionRate: number
}

/**
 * Alert batch operation
 */
export interface AlertBatchOperation {
  /** Operation identifier */
  id: string
  /** Operation type */
  type: 'acknowledge' | 'resolve' | 'dismiss' | 'reopen' | 'delete'
  /** Alert IDs to operate on */
  alertIds: string[]
  /** Operation status */
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  /** Number of alerts processed */
  processed: number
  /** Operation timestamp (ISO 8601) */
  timestamp: string
  /** Performed by */
  performedBy: string
}

/**
 * Escalation policy
 * Defines alert escalation procedures
 */
export interface EscalationPolicy {
  /** Policy identifier */
  id: string
  /** Policy name */
  name: string
  /** Applied to alert severities */
  severities: Array<'critical' | 'high' | 'medium' | 'low'>
  /** Escalation levels */
  levels: Array<{
    /** Level number */
    level: number
    /** Wait time in minutes before escalation */
    waitTime: number
    /** Escalate to user/team/channel */
    escalateTo: string
    /** Notification method */
    method: 'email' | 'sms' | 'call' | 'slack' | 'pagerduty'
  }>
  /** Is active */
  isActive: boolean
  /** Created at (ISO 8601) */
  createdAt: string
  /** Updated at (ISO 8601) */
  updatedAt: string
}
