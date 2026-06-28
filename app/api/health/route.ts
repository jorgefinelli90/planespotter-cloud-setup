import { NextResponse } from 'next/server'

/**
 * GET /api/health
 *
 * Check API health status
 *
 * Response:
 * - status: 'healthy' | 'degraded' | 'critical' | 'unknown'
 * - timestamp: ISO 8601 timestamp
 * - uptime: Server uptime in seconds
 * - version: Node.js version
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
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
