/**
 * Cache abstraction layer
 *
 * Defines interface for caching implementations.
 * Abstraction allows swapping between different backends (memory, Redis, etc)
 * without changing application code.
 *
 * Sprint 4: Interface only
 * Sprint 5+: Implement with Redis or in-memory cache
 */

import { InMemoryCacheImpl } from './cache/in-memory-cache'

/**
 * Cache entry metadata
 */
export interface CacheEntryMetadata {
  createdAt: string
  expiresAt: string
  hits: number
  lastAccessed: string
}

/**
 * Cache entry
 */
export interface CacheEntry<T = unknown> {
  value: T
  metadata: CacheEntryMetadata
}

/**
 * Cache interface
 * Defines contract for cache implementations
 */
export interface ICache {
  /**
   * Get a value from cache
   *
   * @param key - Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T = unknown>(key: string): T | undefined

  /**
   * Set a value in cache
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlSeconds - Time to live in seconds (0 = no expiration)
   */
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): void

  /**
   * Delete a key from cache
   *
   * @param key - Cache key
   */
  delete(key: string): void

  /**
   * Check if key exists in cache
   *
   * @param key - Cache key
   */
  has(key: string): boolean

  /**
   * Clear all cache entries
   */
  clear(): void

  /**
   * Get cache size (number of entries)
   */
  size(): number

  /**
   * Get cache stats
   */
  getStats(): CacheStats

  /**
   * Cleanup expired entries
   */
  cleanup(): void

  /**
   * Get cache entry with metadata
   *
   * @param key - Cache key
   */
  getEntry<T = unknown>(key: string): CacheEntry<T> | undefined
}

/**
 * Cache statistics
 */
export interface CacheStats {
  entries: number
  hits: number
  misses: number
  evictions: number
  avgHitRate: number
  totalMemory?: number // Optional, implementation-specific
}

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /**
   * Default TTL in seconds (0 = no expiration)
   */
  defaultTtl?: number

  /**
   * Maximum number of entries
   */
  maxEntries?: number

  /**
   * Enable automatic cleanup
   */
  autoCleanup?: boolean

  /**
   * Cleanup interval in seconds
   */
  cleanupInterval?: number

  /**
   * Cache backend URL (for Redis, etc)
   */
  url?: string
}

/**
 * Abstract base cache implementation
 * Provides common functionality for cache implementations
 */
export abstract class BaseCache implements ICache {
  protected defaultTtl: number = 3600 // 1 hour
  protected maxEntries: number = 10000
  protected stats: CacheStats = {
    entries: 0,
    hits: 0,
    misses: 0,
    evictions: 0,
    avgHitRate: 0,
  }

  constructor(options?: CacheOptions) {
    if (options?.defaultTtl !== undefined) {
      this.defaultTtl = options.defaultTtl
    }
    if (options?.maxEntries !== undefined) {
      this.maxEntries = options.maxEntries
    }

    // Setup automatic cleanup if enabled
    if (options?.autoCleanup) {
      const interval = (options?.cleanupInterval || 300) * 1000 // 5 minutes default
      setInterval(() => this.cleanup(), interval)
    }
  }

  /**
   * Get a value from cache
   */
  abstract get<T = unknown>(key: string): T | undefined

  /**
   * Set a value in cache
   */
  abstract set<T = unknown>(
    key: string,
    value: T,
    ttlSeconds?: number
  ): void

  /**
   * Delete a key from cache
   */
  abstract delete(key: string): void

  /**
   * Check if key exists in cache
   */
  abstract has(key: string): boolean

  /**
   * Clear all cache entries
   */
  abstract clear(): void

  /**
   * Get cache size
   */
  abstract size(): number

  /**
   * Cleanup expired entries
   */
  abstract cleanup(): void

  /**
   * Get cache entry with metadata
   */
  abstract getEntry<T = unknown>(key: string): CacheEntry<T> | undefined

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Update hit rate statistics
   */
  protected recordHit(): void {
    this.stats.hits++
    this.updateHitRate()
  }

  /**
   * Update miss statistics
   */
  protected recordMiss(): void {
    this.stats.misses++
    this.updateHitRate()
  }

  /**
   * Update eviction statistics
   */
  protected recordEviction(): void {
    this.stats.evictions++
  }

  /**
   * Recalculate average hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.avgHitRate = total > 0 ? this.stats.hits / total : 0
  }
}

export { InMemoryCacheImpl as InMemoryCache } from './cache/in-memory-cache'

/**
 * Factory function to create a cache instance
 */
export function createCache(options?: CacheOptions): ICache {
  return new InMemoryCacheImpl(options)
}
