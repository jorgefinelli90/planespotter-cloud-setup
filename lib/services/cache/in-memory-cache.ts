/**
 * In-Memory Cache Implementation
 *
 * Provides a simple, fast in-memory cache with TTL support.
 * Designed for storing frequently accessed data like aircraft states.
 * No external dependencies - pure TypeScript.
 */

import { getLogger } from '@/lib/logger/logger'
import { appConfig } from '@/lib/config/app-config'

export interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

export interface CacheStats {
  size: number
  hits: number
  misses: number
  lastCleanup: number
}

/**
 * Simple in-memory cache with TTL support
 */
export class InMemoryCache {
  private logger = getLogger('InMemoryCache')
  private storage: Map<string, CacheEntry<any>> = new Map()
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    lastCleanup: Date.now(),
  }
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.logger.info('InMemoryCache initialized')
    // Start cleanup interval to remove expired entries
    this.startCleanupInterval()
  }

  /**
   * Store a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const cacheTtl = ttl || appConfig.cache.ttl

    this.storage.set(key, {
      value,
      timestamp: Date.now(),
      ttl: cacheTtl,
    })

    this.stats.size = this.storage.size

    this.logger.debug('Cache set', {
      key,
      ttl: cacheTtl,
      size: this.stats.size,
    })
  }

  /**
   * Retrieve a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.storage.get(key)

    if (!entry) {
      this.stats.misses++
      this.logger.debug('Cache miss', { key })
      return null
    }

    // Check if entry has expired
    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.storage.delete(key)
      this.stats.size = this.storage.size
      this.stats.misses++
      this.logger.debug('Cache expired', { key, age, ttl: entry.ttl })
      return null
    }

    this.stats.hits++
    this.logger.debug('Cache hit', { key, age })
    return entry.value as T
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Get entry with metadata (timestamp, age, etc)
   */
  getWithMetadata<T>(
    key: string
  ): { value: T; timestamp: number; age: number } | null {
    const entry = this.storage.get(key)

    if (!entry) {
      return null
    }

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      this.storage.delete(key)
      return null
    }

    return {
      value: entry.value as T,
      timestamp: entry.timestamp,
      age,
    }
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    const deleted = this.storage.delete(key)
    if (deleted) {
      this.stats.size = this.storage.size
      this.logger.debug('Cache deleted', { key })
    }
    return deleted
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    const size = this.storage.size
    this.storage.clear()
    this.stats.size = 0
    this.logger.info('Cache cleared', { entriesCleared: size })
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.storage.size
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    return Array.from(this.storage.keys())
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now()
    let removedCount = 0

    for (const [key, entry] of this.storage.entries()) {
      const age = now - entry.timestamp
      if (age > entry.ttl) {
        this.storage.delete(key)
        removedCount++
      }
    }

    if (removedCount > 0) {
      this.stats.size = this.storage.size
      this.stats.lastCleanup = now
      this.logger.debug('Cache cleanup performed', { removedCount })
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)

    // Don't prevent process from exiting
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref()
    }

    this.logger.debug('Cache cleanup interval started (60s)')
  }

  /**
   * Stop cleanup interval
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      this.logger.debug('Cache cleanup interval stopped')
    }
  }

  /**
   * Get cache info for debugging
   */
  getInfo(): {
    size: number
    keys: string[]
    stats: CacheStats
    nextCleanup: string
  } {
    return {
      size: this.stats.size,
      keys: this.keys(),
      stats: this.getStats(),
      nextCleanup: new Date(this.stats.lastCleanup + 60000).toISOString(),
    }
  }
}

/**
 * Global cache instance (singleton)
 */
let cacheInstance: InMemoryCache | null = null

/**
 * Get or create the global cache instance
 */
export function getCache(): InMemoryCache {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCache()
  }
  return cacheInstance
}

/**
 * Reset cache instance (for testing)
 */
export function resetCache(): void {
  if (cacheInstance) {
    cacheInstance.stop()
    cacheInstance = null
  }
}
