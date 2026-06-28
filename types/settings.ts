/**
 * Settings types and interfaces
 * User, system, and device configuration settings
 */

/**
 * User account settings
 */
export interface UserSettings {
  /** User ID */
  userId: string
  /** Display settings */
  display: {
    /** Theme: 'light', 'dark', 'auto' */
    theme: 'light' | 'dark' | 'auto'
    /** Language/locale */
    locale: string
    /** Timezone identifier */
    timezone: string
    /** Temperature unit: 'celsius', 'fahrenheit' */
    temperatureUnit: 'celsius' | 'fahrenheit'
    /** Distance unit: 'metric', 'imperial' */
    distanceUnit: 'metric' | 'imperial'
    /** Speed unit: 'ms', 'knots', 'kmh', 'mph' */
    speedUnit: 'ms' | 'knots' | 'kmh' | 'mph'
    /** Altitude unit: 'meters', 'feet' */
    altitudeUnit: 'meters' | 'feet'
    /** Date format */
    dateFormat: string
    /** Time format: '12h', '24h' */
    timeFormat: '12h' | '24h'
  }
  /** Privacy settings */
  privacy: {
    /** Profile visibility: 'public', 'friends', 'private' */
    profileVisibility: 'public' | 'friends' | 'private'
    /** Allow data collection for analytics */
    allowAnalytics: boolean
    /** Allow marketing emails */
    allowMarketing: boolean
    /** Share device data with community */
    shareDeviceData: boolean
    /** Show location on public profiles */
    showLocation: boolean
  }
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Device network settings
 */
export interface DeviceNetworkSettings {
  /** Device ID */
  deviceId: string
  /** WiFi configuration */
  wifi: {
    /** SSID to connect to */
    ssid: string
    /** WiFi password (never transmitted in plain text) */
    passwordHash: string
    /** WiFi security: 'open', 'wep', 'wpa', 'wpa2', 'wpa3' */
    security: 'open' | 'wep' | 'wpa' | 'wpa2' | 'wpa3'
    /** Static IP (optional) */
    staticIp?: string
    /** Gateway (if static IP) */
    gateway?: string
    /** Subnet mask (if static IP) */
    subnetMask?: string
    /** DNS servers */
    dnsServers?: string[]
    /** Power saving mode */
    powerSave: boolean
  }
  /** Bluetooth settings */
  bluetooth?: {
    /** Enable Bluetooth */
    enabled: boolean
    /** Device name for pairing */
    deviceName: string
    /** Pairing pin (if required) */
    pairingPin?: string
  }
  /** Cellular settings (if applicable) */
  cellular?: {
    /** Enable cellular */
    enabled: boolean
    /** APN */
    apn?: string
    /** Username */
    username?: string
  }
  /** Proxy settings */
  proxy?: {
    /** Use proxy */
    enabled: boolean
    /** Proxy URL */
    url: string
    /** Proxy port */
    port: number
    /** Proxy username */
    username?: string
  }
  /** NTP settings */
  ntp: {
    /** NTP server */
    server: string
    /** Update interval in minutes */
    updateInterval: number
    /** Timezone for time calculations */
    timezone: string
  }
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Device feature settings
 */
export interface DeviceFeatureSettings {
  /** Device ID */
  deviceId: string
  /** Tracking settings */
  tracking: {
    /** Enable aircraft tracking */
    enabled: boolean
    /** Tracking mode: 'continuous', 'interval', 'event_based' */
    mode: 'continuous' | 'interval' | 'event_based'
    /** Update interval in seconds (for interval mode) */
    updateInterval: number
    /** Enable track logging */
    logTracks: boolean
    /** Maximum stored tracks */
    maxTracks: number
  }
  /** Weather data collection */
  weather: {
    /** Enable weather collection */
    enabled: boolean
    /** Update interval in minutes */
    updateInterval: number
    /** Include temperature */
    includeTemperature: boolean
    /** Include pressure */
    includePressure: boolean
    /** Include humidity */
    includeHumidity: boolean
    /** Include wind data */
    includeWind: boolean
  }
  /** News feed collection */
  news: {
    /** Enable news collection */
    enabled: boolean
    /** Categories to collect */
    categories?: string[]
    /** Sources to use */
    sources?: string[]
    /** Update frequency in minutes */
    updateFrequency: number
  }
  /** Data export */
  dataExport: {
    /** Enable export */
    enabled: boolean
    /** Export format: 'json', 'csv', 'both' */
    format: 'json' | 'csv' | 'both'
    /** Schedule export (cron format) */
    schedule?: string
    /** Export destination (URL, email) */
    destination?: string
  }
  /** Performance settings */
  performance: {
    /** Sample rate (0.0-1.0) */
    sampleRate: number
    /** Buffer size for messages */
    bufferSize: number
    /** Compression enabled */
    compressionEnabled: boolean
  }
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * System-wide settings
 */
export interface SystemSettings {
  /** Setting key */
  key: string
  /** Setting value (any type) */
  value: unknown
  /** Setting data type */
  type: 'string' | 'number' | 'boolean' | 'json'
  /** Setting description */
  description?: string
  /** Is system-wide or user-specific */
  scope: 'system' | 'user'
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Application settings
 */
export interface AppSettings {
  /** App version */
  version: string
  /** API endpoint */
  apiEndpoint: string
  /** WebSocket endpoint */
  wsEndpoint: string
  /** Environment: 'development', 'staging', 'production' */
  environment: 'development' | 'staging' | 'production'
  /** Enable debug mode */
  debugMode: boolean
  /** Log level: 'debug', 'info', 'warn', 'error' */
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  /** Enable crash reporting */
  enableCrashReporting: boolean
  /** Feature flags */
  features: Record<string, boolean>
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Security settings
 */
export interface SecuritySettings {
  /** User ID */
  userId: string
  /** Two-factor authentication */
  twoFactorAuth: {
    /** Enable 2FA */
    enabled: boolean
    /** 2FA method: 'email', 'sms', 'totp', 'webauthn' */
    method?: 'email' | 'sms' | 'totp' | 'webauthn'
    /** Backup codes generated */
    backupCodesGenerated: boolean
    /** Verified at (ISO 8601) */
    verifiedAt?: string
  }
  /** API keys */
  apiKeys: Array<{
    /** Key identifier */
    id: string
    /** Key name */
    name: string
    /** Partial key (for display) */
    keyPrefix: string
    /** Key permissions */
    permissions: string[]
    /** Last used (ISO 8601) */
    lastUsed?: string
    /** Created at (ISO 8601) */
    createdAt: string
    /** Expires at (ISO 8601), null = no expiration */
    expiresAt?: string
  }>
  /** Active sessions */
  sessions: Array<{
    /** Session identifier */
    id: string
    /** User agent */
    userAgent: string
    /** IP address */
    ipAddress: string
    /** Created at (ISO 8601) */
    createdAt: string
    /** Last activity (ISO 8601) */
    lastActivity: string
  }>
  /** Recent login attempts */
  loginAttempts: {
    /** Failed attempts */
    failed: number
    /** Last attempt (ISO 8601) */
    lastAttempt: string
    /** Account locked until (ISO 8601) */
    lockedUntil?: string
  }
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** User ID */
  userId: string
  /** Email notifications */
  email: {
    /** Enable email notifications */
    enabled: boolean
    /** Email address */
    address: string
    /** Verified */
    verified: boolean
    /** Categories to notify about */
    categories?: string[]
    /** Digest frequency: 'instant', 'daily', 'weekly' */
    digestFrequency: 'instant' | 'daily' | 'weekly'
  }
  /** In-app notifications */
  inApp: {
    /** Enable in-app notifications */
    enabled: boolean
    /** Sound alerts */
    soundEnabled: boolean
    /** Desktop notifications */
    desktopEnabled: boolean
  }
  /** SMS notifications */
  sms?: {
    /** Enable SMS */
    enabled: boolean
    /** Phone number */
    phoneNumber: string
    /** Verified */
    verified: boolean
  }
  /** Webhook notifications */
  webhook?: {
    /** Enable webhooks */
    enabled: boolean
    /** Webhook URL */
    url: string
    /** Events to send */
    events: string[]
    /** Retries on failure */
    maxRetries: number
  }
  /** Updated at (ISO 8601) */
  updatedAt: string
}

/**
 * Backup and restore settings
 */
export interface BackupSettings {
  /** User ID */
  userId: string
  /** Auto backup enabled */
  autoBackup: {
    /** Enable auto backup */
    enabled: boolean
    /** Backup frequency: 'daily', 'weekly', 'monthly' */
    frequency: 'daily' | 'weekly' | 'monthly'
    /** Time to backup (HH:MM format) */
    time: string
    /** Retention period in days */
    retentionDays: number
  }
  /** Cloud backup */
  cloudBackup?: {
    /** Enable cloud backup */
    enabled: boolean
    /** Provider: 'aws', 'gcs', 'azure' */
    provider: string
    /** Last backup (ISO 8601) */
    lastBackup?: string
    /** Storage location */
    location: string
  }
  /** Local backups */
  localBackups: Array<{
    /** Backup identifier */
    id: string
    /** Backup size in bytes */
    size: number
    /** Created at (ISO 8601) */
    createdAt: string
  }>
  /** Updated at (ISO 8601) */
  updatedAt: string
}
