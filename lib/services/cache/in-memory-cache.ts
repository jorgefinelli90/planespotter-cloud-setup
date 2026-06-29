/**
 * In-Memory Cache Implementation
 *
 * Simple in-memory cache with TTL support implementing ICache.
 * No external dependencies - pure TypeScript.
 */

import { getLogger } from '@/lib/logger/logger'
import { appConfig } from '@/lib/config/app-config'
import {
  BaseCache,
  type CacheEntry,
  type CacheOptions,
  type ICache,
} from '../cache'

interface StoredEntry {
  value: unknown
  createdAt: number
  expiresAt: number
  hits: number
  lastAccessed: number
}

/**
 * In-memory cache with TTL, stats, and manual invalidation
 */
export class InMemoryCacheImpl extends BaseCache implements ICache {
  private logger = getLogger('InMemoryCache')
  private storage: Map<string, StoredEntry> = new Map()
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(options?: CacheOptions) {
    const ttlSeconds = Math.ceil(
      (options?.defaultTtl ?? appConfig.cache.ttl) / 1000
    )

    super({
      defaultTtl: ttlSeconds,
      maxEntries: options?.maxEntries ?? appConfig.cache.maxEntries,
      autoCleanup: options?.autoCleanup ?? true,
      cleanupInterval: options?.cleanupInterval ?? 60,
    })

    this.logger.info('InMemoryCache initialized', {
      defaultTtlSeconds: this.defaultTtl,
      maxEntries: this.maxEntries,
    })
  }

  get<T = unknown>(key: string): T | undefined {
    const entry = this.getStoredEntry(key)
    if (!entry) {
      this.recordMiss()
      return undefined
    }

    entry.hits++
    entry.lastAccessed = Date.now()
    this.recordHit()
    return entry.value as T
  }

  set<T = unknown>(key: string, value: T, ttlSeconds?: number): void {
    const ttl = ttlSeconds ?? this.defaultTtl
    const now = Date.now()
    const expiresAt = ttl > 0 ? now + ttl * 1000 : Number.MAX_SAFE_INTEGER

    if (this.storage.size >= this.maxEntries && !this.storage.has(key)) {
      this.evictOldest()
    }

    this.storage.set(key, {
      value,
      createdAt: now,
      expiresAt,
      hits: 0,
      lastAccessed: now,
    })

    this.stats.entries = this.storage.size
    this.logger.debug('Cache set', { key, ttlSeconds: ttl })
  }

  delete(key: string): void {
    if (this.storage.delete(key)) {
      this.stats.entries = this.storage.size
      this.logger.debug('Cache invalidated', { key })
    }
  }

  has(key: string): boolean {
    return this.getStoredEntry(key) !== undefined
  }

  clear(): void {
    const count = this.storage.size
    this.storage.clear()
    this.stats.entries = 0
    this.logger.info('Cache cleared', { entriesCleared: count })
  }

  size(): number {
    return this.storage.size
  }

  cleanup(): void {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.storage.entries()) {
      if (entry.expiresAt <= now) {
        this.storage.delete(key)
        removed++
        this.recordEviction()
      }
    }

    if (removed > 0) {
      this.stats.entries = this.storage.size
      this.logger.debug('Cache cleanup performed', { removed })
    }
  }

  getEntry<T = unknown>(key: string): CacheEntry<T> | undefined {
    const entry = this.getStoredEntry(key)
    if (!entry) {
      return undefined
    }

    return {
      value: entry.value as T,
      metadata: {
        createdAt: new Date(entry.createdAt).toISOString(),
        expiresAt: new Date(entry.expiresAt).toISOString(),
        hits: entry.hits,
        lastAccessed: new Date(entry.lastAccessed).toISOString(),
      },
    }
  }

  /**
   * Get age of a cache entry in milliseconds
   */
  getAgeMs(key: string): number | null {
    const entry = this.storage.get(key)
    if (!entry || this.isExpired(entry)) {
      return null
    }
    return Date.now() - entry.createdAt
  }

  /**
   * Get remaining TTL in milliseconds
   */
  getRemainingTtlMs(key: string): number | null {
    const entry = this.storage.get(key)
    if (!entry || this.isExpired(entry)) {
      return null
    }
    return Math.max(0, entry.expiresAt - Date.now())
  }

  /**
   * Get last update timestamp for a key
   */
  getLastUpdated(key: string): string | null {
    const entry = this.storage.get(key)
    if (!entry || this.isExpired(entry)) {
      return null
    }
    return new Date(entry.createdAt).toISOString()
  }

  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  private getStoredEntry(key: string): StoredEntry | undefined {
    const entry = this.storage.get(key)
    if (!entry) {
      return undefined
    }

    if (this.isExpired(entry)) {
      this.storage.delete(key)
      this.stats.entries = this.storage.size
      this.recordMiss()
      return undefined
    }

    return entry
  }

  private isExpired(entry: StoredEntry): boolean {
    return entry.expiresAt <= Date.now()
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestAccess = Infinity

    for (const [key, entry] of this.storage.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.storage.delete(oldestKey)
      this.recordEviction()
    }
  }
}

let cacheInstance: InMemoryCacheImpl | null = null

export function getCacheInstance(): InMemoryCacheImpl {
  if (!cacheInstance) {
    cacheInstance = new InMemoryCacheImpl()
  }
  return cacheInstance
}

export function resetCacheInstance(): void {
  if (cacheInstance) {
    cacheInstance.shutdown()
    cacheInstance = null
  }
}
