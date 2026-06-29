/**
 * PlaneSpotter Cloud - Application Configuration
 *
 * Centralized configuration for scheduler, cache, logging, and external APIs.
 * All values sourced from environment variables with sensible defaults.
 * Never hardcode configuration values.
 */

export const appConfig = {
  // Scheduler Configuration
  scheduler: {
    // Aircraft update interval in milliseconds
    aircraftUpdateInterval: parseInt(
      process.env.SCHEDULER_AIRCRAFT_INTERVAL || '15000',
      10
    ),
    // Enable/disable scheduler
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
  },

  // Cache Configuration
  cache: {
    // Time-to-live for cached data in milliseconds (5 minutes default)
    ttl: parseInt(process.env.CACHE_TTL || '300000', 10),
    // Maximum number of cache entries to keep
    maxEntries: parseInt(process.env.CACHE_MAX_ENTRIES || '10000', 10),
    // Enable/disable cache
    enabled: process.env.CACHE_ENABLED !== 'false',
  },

  // HTTP Configuration
  http: {
    // Request timeout in milliseconds
    timeout: parseInt(process.env.HTTP_TIMEOUT || '10000', 10),
    // Retry attempts for failed requests
    maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '2', 10),
  },

  // Logging Configuration
  logging: {
    // Log level: 'debug', 'info', 'warning', 'error'
    level: process.env.LOG_LEVEL || 'info',
    // Maximum number of log entries to keep in memory
    maxLogs: parseInt(process.env.LOG_MAX_ENTRIES || '1000', 10),
    // Enable/disable console output
    console: process.env.LOG_CONSOLE !== 'false',
  },

  // OpenSky Configuration
  opensky: {
    // OpenSky API URL
    apiUrl: process.env.OPENSKY_API_URL || 'https://opensky-network.org/api',
    // OpenSky username (from environment)
    username: process.env.OPENSKY_USERNAME || '',
    // OpenSky password (from environment)
    password: process.env.OPENSKY_PASSWORD || '',
  },

  // Dashboard Configuration
  dashboard: {
    // Maximum number of aircraft to return in response
    maxAircraft: parseInt(process.env.DASHBOARD_MAX_AIRCRAFT || '100', 10),
  },

  // Feature Flags
  features: {
    // Enable scheduler for background updates
    schedulerEnabled: process.env.FEATURE_SCHEDULER !== 'false',
    // Enable cache layer
    cacheEnabled: process.env.FEATURE_CACHE !== 'false',
  },
} as const

/**
 * Validate configuration at startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate scheduler interval
  if (appConfig.scheduler.aircraftUpdateInterval < 5000) {
    errors.push(
      'Scheduler aircraft update interval must be at least 5 seconds'
    )
  }

  // Validate cache TTL
  if (appConfig.cache.ttl < 1000) {
    errors.push('Cache TTL must be at least 1 second')
  }

  // Validate HTTP timeout
  if (appConfig.http.timeout < 1000) {
    errors.push('HTTP timeout must be at least 1 second')
  }

  // Validate OpenSky credentials if scheduler enabled
  if (
    appConfig.features.schedulerEnabled &&
    (!appConfig.opensky.username || !appConfig.opensky.password)
  ) {
    errors.push(
      'OpenSky credentials required when scheduler is enabled. Set OPENSKY_USERNAME and OPENSKY_PASSWORD'
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get human-readable configuration summary
 */
export function getConfigSummary(): string {
  return `
    === PlaneSpotter Cloud Configuration ===
    Scheduler:
      - Aircraft Update Interval: ${appConfig.scheduler.aircraftUpdateInterval}ms
      - Enabled: ${appConfig.scheduler.enabled}
    
    Cache:
      - TTL: ${appConfig.cache.ttl}ms
      - Max Entries: ${appConfig.cache.maxEntries}
      - Enabled: ${appConfig.cache.enabled}
    
    HTTP:
      - Timeout: ${appConfig.http.timeout}ms
      - Max Retries: ${appConfig.http.maxRetries}
    
    Logging:
      - Level: ${appConfig.logging.level}
      - Max Logs: ${appConfig.logging.maxLogs}
      - Console: ${appConfig.logging.console}
    
    Dashboard:
      - Max Aircraft: ${appConfig.dashboard.maxAircraft}
    ===================================
  `.trim()
}
