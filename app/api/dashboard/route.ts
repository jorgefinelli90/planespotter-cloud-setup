import { NextResponse } from 'next/server'
import { createAircraftService } from '@/lib/services/aircraft'
import { getLogger } from '@/lib/logger/logger'

const logger = getLogger('DashboardEndpoint')

/**
 * GET /api/dashboard
 *
 * Returns dashboard data with real aircraft information from AircraftService.
 * Gracefully handles service failures - returns valid dashboard even if services fail.
 */
export async function GET() {
  const userId = 'user-placeholder'
  const startTime = Date.now()

  try {
    // Create and initialize AircraftService
    const aircraftService = createAircraftService()
    await aircraftService.initialize()

    logger.info('Dashboard request initiated', { userId })

    // Fetch aircraft data
    const result = await aircraftService.execute()
    const aircraftData = aircraftService.getAircraft()
    const serviceState = aircraftService.getState()

    logger.info('Aircraft data retrieved', {
      count: aircraftData.length,
      healthy: serviceState.isHealthy,
    })

    // Build dashboard with aircraft data
    const dashboard = {
      id: '',
      userId,
      name: 'Default Dashboard',
      description: `Aircraft Monitoring - ${aircraftData.length} aircraft detected`,
      visibility: 'private' as const,
      type: 'overview' as const,
      isDefault: true,
      layout: {
        id: '',
        name: 'Default Layout',
        dashboardId: '',
        columns: 4,
        widgets: [
          {
            id: 'aircraft-list',
            type: 'aircraft-tracker' as const,
            title: 'Aircraft Detection',
            description: `Real-time monitoring of ${aircraftData.length} aircraft`,
            position: { x: 0, y: 0, width: 4, height: 2 },
            config: {
              refreshInterval: 30,
              showMap: true,
              limit: 100,
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      settings: {
        realtimeUpdates: true,
        updateFrequency: 30,
        enableNotifications: true,
        darkMode: true,
        density: 'comfortable' as const,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Add aircraft data to response metadata
    const responseData = {
      dashboard,
      services: {
        aircraft: {
          status: serviceState.isHealthy ? 'healthy' : 'degraded',
          name: serviceState.provider,
          aircraftCount: serviceState.aircraftCount,
          lastUpdate: serviceState.lastUpdate,
        },
      },
      aircraft: aircraftData.slice(0, 100), // Include first 100 aircraft
    }

    const duration = Date.now() - startTime

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 200 }
    )
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    logger.warning('Dashboard request failed, returning empty dashboard', {
      error: errorMessage,
      duration,
    })

    // Graceful degradation - return valid empty dashboard on error
    const fallbackDashboard = {
      id: '',
      userId,
      name: 'Default Dashboard',
      description: 'Waiting for aircraft data...',
      visibility: 'private' as const,
      type: 'overview' as const,
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
        density: 'comfortable' as const,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          dashboard: fallbackDashboard,
          services: {
            aircraft: {
              status: 'error',
              error: errorMessage,
            },
          },
          aircraft: [],
        },
        timestamp: new Date().toISOString(),
        duration,
      },
      { status: 200 }
    )
  }
}
