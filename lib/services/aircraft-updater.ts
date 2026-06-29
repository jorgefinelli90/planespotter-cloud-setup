/**
 * Aircraft Update Task
 *
 * Fetches aircraft data via AircraftService and updates the cache.
 * Called exclusively by the Scheduler — never by API endpoints.
 */

import type { ServiceExecutionResult } from './base-service'
import type { ICache } from './cache'
import type { InMemoryCacheImpl } from './cache/in-memory-cache'
import { CACHE_KEYS } from './cache-keys'
import type { AircraftCachePayload } from './cache-types'
import type { AircraftService } from './aircraft'
import { appConfig } from '@/lib/config/app-config'
import { getLogger } from '@/lib/logger/logger'

const logger = getLogger('AircraftUpdater')

function getCacheTtlSeconds(): number {
  return Math.ceil(appConfig.cache.ttl / 1000)
}

function getExistingPayload(cache: ICache): AircraftCachePayload | undefined {
  return cache.get<AircraftCachePayload>(CACHE_KEYS.AIRCRAFT)
}

function buildPayload(
  aircraftService: AircraftService,
  duration: number,
  lastError: string | null,
  previous?: AircraftCachePayload
): AircraftCachePayload {
  const state = aircraftService.getState()
  const aircraft = aircraftService.getAircraft()

  return {
    aircraft,
    lastUpdate: state.lastUpdate || new Date().toISOString(),
    lastSuccessfulUpdate:
      lastError === null
        ? new Date().toISOString()
        : previous?.lastSuccessfulUpdate || null,
    provider: state.provider,
    aircraftCount: aircraft.length,
    updateDuration: duration,
    lastError,
  }
}

export async function runAircraftUpdate(
  aircraftService: AircraftService,
  cache: ICache
): Promise<ServiceExecutionResult> {
  const startTime = Date.now()
  logger.info('Scheduler aircraft update started')

  try {
    const result = await aircraftService.execute()
    const duration = Date.now() - startTime
    const previous = getExistingPayload(cache)

    if (result.status === 'success') {
      const payload = buildPayload(aircraftService, duration, null, previous)
      cache.set(CACHE_KEYS.AIRCRAFT, payload, getCacheTtlSeconds())

      logger.info('Aircraft cached', {
        count: payload.aircraftCount,
        provider: payload.provider,
        duration,
      })

      logger.info('Scheduler completed', {
        count: payload.aircraftCount,
        duration,
      })

      return result
    }

    const errorMessage = result.error || 'Aircraft update failed'
    logger.error('Aircraft update failed', {
      error: errorMessage,
      duration,
    })

    if (previous) {
      cache.set(
        CACHE_KEYS.AIRCRAFT,
        {
          ...previous,
          lastError: errorMessage,
          updateDuration: duration,
        },
        getCacheTtlSeconds()
      )
    }

    logger.info('Scheduler completed with errors', {
      duration,
      preservedCache: !!previous,
    })

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    const previous = getExistingPayload(cache)

    logger.error('Aircraft update failed with exception', {
      error: errorMessage,
      duration,
    })

    if (previous) {
      cache.set(
        CACHE_KEYS.AIRCRAFT,
        {
          ...previous,
          lastError: errorMessage,
          updateDuration: duration,
        },
        getCacheTtlSeconds()
      )
    }

    logger.info('Scheduler completed with errors', {
      duration,
      preservedCache: !!previous,
    })

    return {
      status: 'error',
      lastRun: new Date().toISOString(),
      duration,
      itemsProcessed: 0,
      error: errorMessage,
    }
  }
}

export function getSystemStatusFromCache(
  cache: ICache,
  schedulerRunning: boolean,
  nextUpdate: string | null
): import('./cache-types').SystemStatusInfo {
  const payload = cache.get<AircraftCachePayload>(CACHE_KEYS.AIRCRAFT)
  const entry = cache.getEntry<AircraftCachePayload>(CACHE_KEYS.AIRCRAFT)
  const cacheWithMeta = cache as InMemoryCacheImpl

  const cacheAgeMs =
    typeof cacheWithMeta.getAgeMs === 'function'
      ? cacheWithMeta.getAgeMs(CACHE_KEYS.AIRCRAFT)
      : entry
        ? Date.now() - new Date(entry.metadata.createdAt).getTime()
        : null

  return {
    lastUpdate: payload?.lastUpdate ?? entry?.metadata.createdAt ?? null,
    cacheAgeMs,
    cacheTtlMs: appConfig.cache.ttl,
    nextUpdate,
    aircraftCountInCache: payload?.aircraftCount ?? payload?.aircraft.length ?? 0,
    schedulerRunning,
    schedulerIntervalMs: appConfig.scheduler.aircraftUpdateInterval,
    lastUpdateError: payload?.lastError ?? null,
    provider: payload?.provider ?? 'OpenSky',
    lastSyncDurationMs: payload?.updateDuration ?? null,
  }
}
