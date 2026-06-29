/**
 * PlaneSpotter Cloud - Application Configuration
 *
 * Centralized configuration for scheduler, cache, logging, and external APIs.
 * All values sourced from environment variables with sensible defaults.
 * Never hardcode configuration values.
 */

export const appConfig = {
  scheduler: {
    aircraftUpdateInterval: parseInt(
      process.env.SCHEDULER_AIRCRAFT_INTERVAL || '15000',
      10
    ),
    enabled: process.env.SCHEDULER_ENABLED !== 'false',
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300000', 10),
    maxEntries: parseInt(process.env.CACHE_MAX_ENTRIES || '10000', 10),
    enabled: process.env.CACHE_ENABLED !== 'false',
  },

  http: {
    timeout: parseInt(process.env.HTTP_TIMEOUT || '10000', 10),
    maxRetries: parseInt(process.env.HTTP_MAX_RETRIES || '2', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxLogs: parseInt(process.env.LOG_MAX_ENTRIES || '1000', 10),
    console: process.env.LOG_CONSOLE !== 'false',
  },

  opensky: {
    apiUrl: process.env.OPENSKY_API_URL || 'https://opensky-network.org/api',
    tokenUrl:
      process.env.OPENSKY_TOKEN_URL ||
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
    username: process.env.OPENSKY_USERNAME || '',
    password: process.env.OPENSKY_PASSWORD || '',
    /** Renew token this many seconds before expiry */
    tokenRenewalBufferSeconds: parseInt(
      process.env.OPENSKY_TOKEN_RENEWAL_BUFFER || '60',
      10
    ),
  },

  dashboard: {
    maxAircraft: parseInt(process.env.DASHBOARD_MAX_AIRCRAFT || '100', 10),
  },

  features: {
    schedulerEnabled: process.env.FEATURE_SCHEDULER !== 'false',
    cacheEnabled: process.env.FEATURE_CACHE !== 'false',
  },
} as const

export interface ConfigValidationResult {
  valid: boolean
  errors: string[]
  missingEnvVars: string[]
}

/**
 * Validate OpenSky credentials required for production runtime
 */
export function validateOpenSkyConfig(
  strict = true
): ConfigValidationResult {
  const errors: string[] = []
  const missingEnvVars: string[] = []

  if (!appConfig.opensky.username) {
    missingEnvVars.push("OPENSKY_USERNAME")

    if (strict) {
      errors.push(
        "Missing OPENSKY_USERNAME — set your OpenSky API client ID in environment variables"
      )
    }
  }

  if (!appConfig.opensky.password) {
    missingEnvVars.push("OPENSKY_PASSWORD")

    if (strict) {
      errors.push(
        "Missing OPENSKY_PASSWORD — set your OpenSky API client secret in environment variables"
      )
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingEnvVars,
  }
}

/**
 * Validate general application configuration at startup
 */
export function validateConfig(): ConfigValidationResult {
  const errors: string[] = []
  const missingEnvVars: string[] = []

  if (appConfig.scheduler.aircraftUpdateInterval < 5000) {
    errors.push(
      'Scheduler aircraft update interval must be at least 5 seconds (SCHEDULER_AIRCRAFT_INTERVAL)'
    )
  }

  if (appConfig.cache.ttl < 1000) {
    errors.push('Cache TTL must be at least 1 second (CACHE_TTL)')
  }

  if (appConfig.http.timeout < 1000) {
    errors.push('HTTP timeout must be at least 1 second (HTTP_TIMEOUT)')
  }

  const openskyValidation = validateOpenSkyConfig()
  errors.push(...openskyValidation.errors)
  missingEnvVars.push(...openskyValidation.missingEnvVars)

  return {
    valid: errors.length === 0,
    errors,
    missingEnvVars,
  }
}

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

    OpenSky:
      - API URL: ${appConfig.opensky.apiUrl}
      - Username configured: ${!!appConfig.opensky.username}
      - Password configured: ${!!appConfig.opensky.password}

    Logging:
      - Level: ${appConfig.logging.level}
      - Max Logs: ${appConfig.logging.maxLogs}
      - Console: ${appConfig.logging.console}

    Dashboard:
      - Max Aircraft: ${appConfig.dashboard.maxAircraft}
    ===================================
  `.trim()
}
