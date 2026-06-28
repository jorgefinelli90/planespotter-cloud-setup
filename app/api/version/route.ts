import { NextResponse } from 'next/server'

/**
 * GET /api/version
 *
 * Get PlaneSpotter Cloud version information
 *
 * Response contains:
 * - project: Project name
 * - version: Current version (semver)
 * - build: Build number/hash
 * - compiledAt: Build timestamp in ISO 8601 format
 */
export async function GET() {
  const versionInfo = {
    project: 'PlaneSpotter Cloud',
    version: '0.1.0',
    build: 'v0-sprint-3',
    compiledAt: new Date().toISOString(),
  }

  return NextResponse.json(
    {
      success: true,
      data: versionInfo,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
