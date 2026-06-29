/**
 * PlaneSpotter Cloud Logger
 *
 * Simple internal logging system without external dependencies.
 * Supports multiple log levels and contexts.
 */

import { appConfig } from '@/lib/config/app-config'

export type LogLevel = 'debug' | 'info' | 'warning' | 'error'

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void
  info(message: string, context?: Record<string, unknown>): void
  warning(message: string, context?: Record<string, unknown>): void
  error(message: string, error?: Error | Record<string, unknown>): void
  setLevel(level: LogLevel): void
  getLevel(): LogLevel
}

/**
 * Log entry for tracking
 */
export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: string
}

/**
 * Default Logger Implementation
 *
 * Simple console-based logging with level support
 */
export class Logger implements ILogger {
  private level: LogLevel = 'info'
  private context: string
  private entries: LogEntry[] = []
  private maxEntries: number = 1000
  private consoleEnabled: boolean = true

  constructor(context: string = 'App') {
    this.context = context
  }

  setMaxEntries(maxEntries: number): void {
    this.maxEntries = maxEntries
  }

  setConsoleEnabled(enabled: boolean): void {
    this.consoleEnabled = enabled
  }

  /**
   * Log debug message (verbose)
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context)
    }
  }

  /**
   * Log info message (informational)
   */
  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      this.log('info', message, context)
    }
  }

  /**
   * Log warning message
   */
  warning(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog('warning')) {
      this.log('warning', message, context)
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const errorStr = error instanceof Error ? error.message : JSON.stringify(error)
      this.log('error', message, { error: errorStr })
    }
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.level = level
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level
  }

  /**
   * Get recent log entries
   */
  getEntries(limit: number = 50): LogEntry[] {
    return this.entries.slice(-limit)
  }

  /**
   * Clear log history
   */
  clear(): void {
    this.entries = []
  }

  /**
   * Private: Check if should log based on level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warning: 2,
      error: 3,
    }
    return levels[level] >= levels[this.level]
  }

  /**
   * Private: Internal logging implementation
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`

    // Store entry
    const entry: LogEntry = {
      timestamp,
      level,
      message,
      context,
    }
    this.entries.push(entry)

    // Maintain max entries
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }

    // Console output based on level
    if (!this.consoleEnabled) {
      return
    }

    if (level === 'error') {
      console.error(prefix, message, context || '')
    } else if (level === 'warning') {
      console.warn(prefix, message, context || '')
    } else if (level === 'info') {
      console.info(prefix, message, context || '')
    } else {
      console.log(prefix, message, context || '')
    }
  }
}

/**
 * Global logger instance
 */
let globalLogger: Logger | null = null
let loggerConfigured = false

/**
 * Apply application configuration to the global logger
 */
export function configureLogger(): void {
  if (loggerConfigured) {
    return
  }

  const logger = getLogger('App')
  const level = appConfig.logging.level

  if (['debug', 'info', 'warning', 'error'].includes(level)) {
    logger.setLevel(level as LogLevel)
  }

  logger.setMaxEntries(appConfig.logging.maxLogs)
  logger.setConsoleEnabled(appConfig.logging.console)
  loggerConfigured = true
}

/**
 * Get or create global logger
 */
export function getLogger(context: string = 'App'): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(context)
  }
  return globalLogger
}

/**
 * Set global logger instance
 */
export function setGlobalLogger(logger: ILogger): void {
  globalLogger = logger as Logger
}

/**
 * Create a new logger instance
 */
export function createLogger(context: string = 'App'): ILogger {
  return new Logger(context)
}
