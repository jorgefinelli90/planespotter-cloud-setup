import { NextResponse } from 'next/server'

/**
 * GET /api/dashboard
 *
 * Get dashboard data structure
 * Currently returns empty structure - database integration in future sprint
 *
 * Response contains complete dashboard structure:
 * - layout: Widget layout configuration
 * - settings: Dashboard settings
 * - visibility: Dashboard visibility setting
 * - type: Dashboard type
 */
export async function GET() {
  // TODO: In future sprint, fetch user from authentication middleware
  // and retrieve dashboard data from database
  const userId = 'user-placeholder'

  const dashboard = {
    id: '',
    userId,
    name: 'Default Dashboard',
    description: '',
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
      data: dashboard,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
