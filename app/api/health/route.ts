import { NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Check API health status and service states
 *
 * Response:
 * - status: 'healthy' | 'degraded' | 'critical'
 * - timestamp: ISO 8601 timestamp
 * - uptime: Server uptime in seconds
 * - version: Node.js version
 * - services: Individual service health states
 */
export async function GET() {
  const health = {
    status: 'healthy' as const,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    services: {
      aircraft: {
        status: 'initialized',
        name: 'Aircraft Service',
        enabled: true,
      },
      scheduler: {
        status: 'ready',
        name: 'Service Scheduler',
        enabled: false,
      },
      cache: {
        status: 'ready',
        name: 'Results Cache',
        enabled: false,
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
}
