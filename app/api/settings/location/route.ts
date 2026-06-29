import { NextResponse } from 'next/server'
import { ensureLocationInitialized } from '@/lib/services/location/location-service'
import { getLogger } from '@/lib/logger/logger'
import {
  radarConfig,
  isValidLatitude,
  isValidLongitude,
} from '@/lib/config/radar'

const logger = getLogger('LocationEndpoint')

/**
 * GET /api/settings/location
 *
 * Returns the current radar location and the allowed radius bounds.
 */
export async function GET() {
  try {
    const locationService = await ensureLocationInitialized()
    const location = locationService.getLocation()

    return NextResponse.json(
      {
        success: true,
        data: {
          location,
          limits: {
            minRadiusKm: radarConfig.minRadiusKm,
            maxRadiusKm: radarConfig.maxRadiusKm,
            defaultRadiusKm: radarConfig.defaultRadiusKm,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('Failed to read radar location', { error: message })
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/settings/location
 *
 * Updates the radar location (latitude, longitude, radius). Changes take
 * effect immediately for AircraftService filtering.
 */
export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      latitude?: number
      longitude?: number
      altitude?: number
      radiusKm?: number
    }

    if (
      body.latitude !== undefined &&
      !isValidLatitude(Number(body.latitude))
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid latitude (must be between -90 and 90)' },
        { status: 400 }
      )
    }

    if (
      body.longitude !== undefined &&
      !isValidLongitude(Number(body.longitude))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid longitude (must be between -180 and 180)',
        },
        { status: 400 }
      )
    }

    const locationService = await ensureLocationInitialized()
    const updated = await locationService.updateLocation({
      latitude:
        body.latitude !== undefined ? Number(body.latitude) : undefined,
      longitude:
        body.longitude !== undefined ? Number(body.longitude) : undefined,
      altitude:
        body.altitude !== undefined ? Number(body.altitude) : undefined,
      radiusKm:
        body.radiusKm !== undefined ? Number(body.radiusKm) : undefined,
    })

    logger.info('Radar location updated via API', {
      latitude: updated.latitude,
      longitude: updated.longitude,
      radiusKm: updated.radiusKm,
    })

    return NextResponse.json(
      {
        success: true,
        data: { location: updated },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logger.error('Failed to update radar location', { error: message })
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
