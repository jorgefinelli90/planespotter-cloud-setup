import { NextResponse } from 'next/server'
import { ensureAppInitialized } from '@/lib/services/bootstrap'
import { CACHE_KEYS } from '@/lib/services/cache-keys'
import type { AircraftCachePayload } from '@/lib/services/cache-types'
import { appConfig } from '@/lib/config/app-config'

/**
 * GET /api/health
 *
 * Check API health status and service states
 */
export async function GET() {
  try {
    const runtime = await ensureAppInitialized()
    const scheduledTask = runtime.scheduler.getScheduledTask('aircraft')
    const cachePayload = runtime.cache.get<AircraftCachePayload>(
      CACHE_KEYS.AIRCRAFT
    )
    const providerStatus = runtime.aircraftService
      .getState()

    const schedulerRunning = runtime.scheduler.isRunning()
    const hasCache = !!cachePayload

    const status =
      schedulerRunning && hasCache && !cachePayload?.lastError
        ? 'healthy'
        : schedulerRunning || hasCache
          ? 'degraded'
          : 'critical'

    const health = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.version,
      services: {
        aircraft: {
          status: hasCache ? 'initialized' : 'waiting',
          name: 'Aircraft Service',
          enabled: true,
          provider: cachePayload?.provider ?? providerStatus.provider,
          lastSync: cachePayload?.lastUpdate ?? providerStatus.lastUpdate,
          lastSyncDurationMs: cachePayload?.updateDuration ?? null,
          aircraftCount:
            cachePayload?.aircraftCount ?? providerStatus.aircraftCount,
          lastError: cachePayload?.lastError ?? providerStatus.lastError,
        },
        scheduler: {
          status: schedulerRunning ? 'running' : 'stopped',
          name: 'Service Scheduler',
          enabled: appConfig.features.schedulerEnabled,
          intervalMs: appConfig.scheduler.aircraftUpdateInterval,
          lastExecution: scheduledTask?.lastExecution ?? null,
          nextExecution: scheduledTask?.nextExecution ?? null,
        },
        cache: {
          status: hasCache ? 'populated' : 'empty',
          name: 'Results Cache',
          enabled: appConfig.features.cacheEnabled,
          entries: runtime.cache.size(),
          ttlMs: appConfig.cache.ttl,
        },
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: health,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Initialization failed'

    return NextResponse.json(
      {
        success: true,
        data: {
          status: 'critical',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: process.version,
          error: errorMessage,
          services: {
            aircraft: {
              status: 'error',
              enabled: false,
              provider: null,
              lastSync: null,
              lastSyncDurationMs: null,
              aircraftCount: 0,
            },
            scheduler: { status: 'stopped', enabled: false },
            cache: { status: 'empty', enabled: false },
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  }
}
