/**
 * DashboardBuilder - Orchestrates dashboard assembly from cache
 *
 * Reads exclusively from cache — never calls external APIs or executes services.
 */

import type { Dashboard } from '@/types'
import type { AircraftData } from './aircraft/types'
import { getSystemStatusFromCache } from './aircraft-updater'
import { CACHE_KEYS } from './cache-keys'
import type { AircraftCachePayload, SystemStatusInfo } from './cache-types'
import type { ICache } from './cache'
import type { ServiceManager } from './service-manager'
import type { IntervalScheduler } from './interval-scheduler'
import { appConfig } from '@/lib/config/app-config'
import { getLogger } from '@/lib/logger/logger'

export interface DashboardBuilderConfig {
  cache?: ICache
  includeMetadata?: boolean
}

export interface DashboardApiData {
  dashboard: Dashboard
  services: {
    aircraft: {
      status: 'healthy' | 'degraded' | 'error'
      name?: string
      provider?: string
      aircraftCount?: number
      lastUpdate?: string | null
      error?: string
    }
    scheduler: {
      status: 'running' | 'stopped'
      intervalMs: number
      lastExecution?: string | null
      nextExecution?: string | null
    }
    cache: {
      status: 'enabled' | 'disabled'
      ttlMs: number
      entries: number
      lastUpdate?: string | null
      cacheAgeMs?: number | null
    }
  }
  systemStatus: SystemStatusInfo
  aircraft: Array<AircraftData & { track: number | null }>
  alerts: Array<{
    id: string
    type: 'warning' | 'error'
    title: string
    message: string
  }>
}

export interface DashboardBuildResult {
  data: DashboardApiData
  buildTime: number
  fromCache: boolean
}

export class DashboardBuilder {
  private serviceManager: ServiceManager
  private cache?: ICache
  private includeMetadata: boolean = true
  private logger = getLogger('DashboardBuilder')

  constructor(
    serviceManager: ServiceManager,
    config?: DashboardBuilderConfig
  ) {
    this.serviceManager = serviceManager
    if (config?.cache) {
      this.cache = config.cache
    }
    if (config?.includeMetadata !== undefined) {
      this.includeMetadata = config.includeMetadata
    }
  }

  build(
    userId: string,
    scheduler?: IntervalScheduler
  ): DashboardBuildResult {
    const startTime = Date.now()

    const payload = this.cache?.get<AircraftCachePayload>(CACHE_KEYS.AIRCRAFT)
    const aircraft = payload?.aircraft ?? []
    const aircraftCount = payload?.aircraftCount ?? aircraft.length

    const scheduledTask = scheduler?.getScheduledTask('aircraft')
    const systemStatus = this.cache
      ? getSystemStatusFromCache(
          this.cache,
          scheduler?.isRunning() ?? false,
          scheduledTask?.nextExecution ?? null
        )
      : {
          lastUpdate: null,
          cacheAgeMs: null,
          cacheTtlMs: appConfig.cache.ttl,
          nextUpdate: null,
          aircraftCountInCache: 0,
          schedulerRunning: false,
          schedulerIntervalMs: appConfig.scheduler.aircraftUpdateInterval,
          lastUpdateError: null,
          provider: 'OpenSky',
          lastSyncDurationMs: null,
        }

    const aircraftStatus = this.resolveAircraftStatus(payload)
    const alerts = this.buildAlerts(payload, aircraftCount)

    const dashboard = this.buildDashboard(userId, aircraftCount, payload)
    const normalizedAircraft = aircraft
      .slice(0, appConfig.dashboard.maxAircraft)
      .map((plane) => ({
        ...plane,
        track: plane.trueTrack,
      }))

    const buildTime = Date.now() - startTime

    this.logger.debug('Dashboard built from cache', {
      userId,
      aircraftCount,
      buildTime,
      hasCache: !!payload,
    })

    return {
      fromCache: !!payload,
      buildTime,
      data: {
        dashboard,
        services: {
          aircraft: {
            status: aircraftStatus,
            name: payload?.provider ?? 'OpenSky',
            provider: payload?.provider ?? 'OpenSky',
            aircraftCount,
            lastUpdate: payload?.lastUpdate ?? null,
            error: payload?.lastError ?? undefined,
          },
          scheduler: {
            status: scheduler?.isRunning() ? 'running' : 'stopped',
            intervalMs: appConfig.scheduler.aircraftUpdateInterval,
            lastExecution: scheduledTask?.lastExecution ?? null,
            nextExecution: scheduledTask?.nextExecution ?? null,
          },
          cache: {
            status: appConfig.features.cacheEnabled ? 'enabled' : 'disabled',
            ttlMs: appConfig.cache.ttl,
            entries: this.cache?.size() ?? 0,
            lastUpdate: systemStatus.lastUpdate,
            cacheAgeMs: systemStatus.cacheAgeMs,
          },
        },
        systemStatus,
        aircraft: normalizedAircraft,
        alerts,
      },
    }
  }

  invalidateCache(): void {
    this.cache?.delete(CACHE_KEYS.AIRCRAFT)
    this.logger.info('Aircraft cache invalidated manually')
  }

  private resolveAircraftStatus(
    payload: AircraftCachePayload | undefined
  ): 'healthy' | 'degraded' | 'error' {
    if (!payload) {
      return 'error'
    }

    if (payload.lastError) {
      return payload.aircraftCount > 0 ? 'degraded' : 'error'
    }

    return 'healthy'
  }

  private buildAlerts(
    payload: AircraftCachePayload | undefined,
    aircraftCount: number
  ): DashboardApiData['alerts'] {
    const alerts: DashboardApiData['alerts'] = []

    if (!payload) {
      alerts.push({
        id: 'cache-empty',
        type: 'warning',
        title: 'Cache vacía',
        message:
          'Esperando la primera actualización del scheduler. Los datos aparecerán en breve.',
      })
      return alerts
    }

    if (payload.lastError) {
      alerts.push({
        id: 'aircraft-update-error',
        type: aircraftCount > 0 ? 'warning' : 'error',
        title: 'Error al actualizar OpenSky',
        message: payload.lastError,
      })
    }

    return alerts
  }

  private buildDashboard(
    userId: string,
    aircraftCount: number,
    payload: AircraftCachePayload | undefined
  ): Dashboard {
    const now = new Date().toISOString()
    const description = payload
      ? `${aircraftCount} aircraft from ${payload.provider} — last update ${formatIsoTime(payload.lastUpdate)}`
      : 'Waiting for cached aircraft data from OpenSky...'

    return {
      id: '',
      userId,
      name: 'Default Dashboard',
      description,
      visibility: 'private',
      type: 'overview',
      isDefault: true,
      layout: {
        id: '',
        name: 'Default Layout',
        dashboardId: '',
        columns: 4,
        widgets: payload
          ? [
              {
                id: 'aircraft-list',
                type: 'aircraft-tracker' as const,
                title: 'Aircraft Detection',
                description: `${aircraftCount} aircraft from ${payload.provider}`,
                position: { x: 0, y: 0, width: 4, height: 2 },
                config: {
                  refreshInterval: Math.floor(
                    appConfig.scheduler.aircraftUpdateInterval / 1000
                  ),
                  showMap: true,
                  limit: appConfig.dashboard.maxAircraft,
                },
              },
            ]
          : [],
        createdAt: now,
        updatedAt: now,
      },
      settings: {
        realtimeUpdates: true,
        updateFrequency: Math.floor(
          appConfig.scheduler.aircraftUpdateInterval / 1000
        ),
        enableNotifications: true,
        darkMode: true,
        density: 'comfortable',
      },
      createdAt: now,
      updatedAt: now,
    }
  }
}

function formatIsoTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString()
  } catch {
    return isoString
  }
}

export function createDashboardBuilder(
  serviceManager: ServiceManager,
  config?: DashboardBuilderConfig
): DashboardBuilder {
  return new DashboardBuilder(serviceManager, config)
}
