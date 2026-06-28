import { NextResponse } from 'next/server'

/**
 * GET /api/device/:id
 *
 * Get a specific device by ID
 * Currently returns empty structure - database integration in future sprint
 *
 * Parameters:
 * - id: Device ID (alphanumeric with hyphens and underscores)
 *
 * Response:
 * - Device object with the given ID and empty properties
 *
 * Errors:
 * - 404: Device not found (in future when database is integrated)
 * - 400: Invalid device ID format
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Validate ID format (basic validation)
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid ID format',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 400 }
      )
    }

    // TODO: In future sprint, fetch device from database
    // For now, return empty device structure
    const device = {
      id,
      name: `Device ${id}`,
      status: 'disconnected' as const,
      health: 'unknown' as const,
      location: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
      },
      lastLocationUpdate: new Date().toISOString(),
      batteryLevel: 0,
      isPowered: false,
      firmwareVersion: '',
      hardwareRevision: '',
      aircraftDetected: 0,
      messagesReceived: 0,
      uptime: 0,
      metadata: {
        createdAt: new Date().toISOString(),
        createdBy: 'system',
        updatedAt: new Date().toISOString(),
      },
    }

    return NextResponse.json(
      {
        success: true,
        data: device,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred processing your request',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}
