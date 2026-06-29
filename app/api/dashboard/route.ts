import { NextResponse } from 'next/server'
import { ensureAppInitialized } from '@/lib/services/bootstrap'
import { getLogger } from '@/lib/logger/logger'

const logger = getLogger('DashboardEndpoint')

/**
 * GET /api/dashboard
 *
 * Returns dashboard data built exclusively from cache via DashboardBuilder.
 * Never queries OpenSky directly — background scheduler keeps cache updated.
 */
export async function GET() {
  const userId = 'user-placeholder'
  const startTime = Date.now()

  try {
    const runtime = await ensureAppInitialized()
    const result = runtime.dashboardBuilder.build(userId, runtime.scheduler)
    const duration = Date.now() - startTime

    logger.info('Dashboard served from cache', {
      userId,
      aircraftCount: result.data.aircraft.length,
      fromCache: result.fromCache,
      duration,
    })

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 200 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.error('Dashboard request failed', {
      error: errorMessage,
      duration,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          dashboard: {
            id: '',
            userId,
            name: 'Default Dashboard',
            description: 'Waiting for aircraft data...',
            visibility: 'private',
            type: 'overview',
            isDefault: true,
            layout: {
              id: '',
              name: 'Default Layout',
              dashboardId: '',
              columns: 4,
              widgets: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            settings: {
              realtimeUpdates: true,
              updateFrequency: 30,
              enableNotifications: true,
              darkMode: true,
              density: 'comfortable',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          services: {
            aircraft: {
              status: 'error',
              provider: 'OpenSky',
              error: errorMessage,
            },
            scheduler: { status: 'stopped', intervalMs: 15000 },
            cache: { status: 'disabled', ttlMs: 300000, entries: 0 },
          },
          systemStatus: {
            lastUpdate: null,
            cacheAgeMs: null,
            cacheTtlMs: 300000,
            nextUpdate: null,
            aircraftCountInCache: 0,
            schedulerRunning: false,
            schedulerIntervalMs: 15000,
            lastUpdateError: errorMessage,
            provider: 'OpenSky',
            lastSyncDurationMs: null,
          },
          radar: {
            location: {
              latitude: 0,
              longitude: 0,
              radiusKm: 200,
              source: 'ip',
            },
            aircraftInRadius: 0,
            aircraftFromProvider: 0,
          },
          aircraft: [],
          alerts: [
            {
              id: 'dashboard-error',
              type: 'error',
              title: 'Error del servidor',
              message: errorMessage,
            },
          ],
        },
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 200 }
    )
  }
}
