'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface Aircraft {
  id: string
  icao24: string
  callsign: string | null
  latitude: number
  longitude: number
  altitude: number
  groundSpeed: number
  track: number
  verticalRate: number
  onGround: boolean
  squawk: string | null
  timestamp: number
}

export interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'error'
  name: string
  aircraftCount?: number
  lastUpdate?: string
  enabled?: boolean
  error?: string
}

export interface DashboardData {
  dashboard: {
    id: string
    userId: string
    name: string
    description: string
    visibility: 'private' | 'public'
    type: 'overview' | 'detailed'
    isDefault: boolean
    layout: {
      id: string
      name: string
      dashboardId: string
      columns: number
      widgets: Array<{
        id: string
        type: string
        title: string
        description: string
        position: {
          x: number
          y: number
          width: number
          height: number
        }
        config: Record<string, unknown>
      }>
      createdAt: string
      updatedAt: string
    }
    settings: {
      realtimeUpdates: boolean
      updateFrequency: number
      enableNotifications: boolean
      darkMode: boolean
      density: 'compact' | 'comfortable' | 'spacious'
    }
    createdAt: string
    updatedAt: string
  }
  services: {
    aircraft: ServiceStatus
  }
  aircraft: Aircraft[]
}

interface UseDashboardDataOptions {
  refreshInterval?: number
  enabled?: boolean
}

interface UseDashboardDataReturn {
  data: DashboardData | null
  isLoading: boolean
  error: Error | null
  lastUpdated: Date | null
  refresh: () => Promise<void>
}

export function useDashboardData(
  options: UseDashboardDataOptions = {}
): UseDashboardDataReturn {
  const { refreshInterval = 30000, enabled = true } = options

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard')

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard: ${response.statusText}`)
      }

      const json = await response.json()

      if (!json.success || !json.data) {
        throw new Error('Invalid dashboard response')
      }

      setData(json.data)
      setLastUpdated(new Date())
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to fetch dashboard data')
      setError(error)
      console.error('[v0] Dashboard fetch error:', error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchDashboard()
  }, [fetchDashboard])

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchDashboard()
    }
  }, [enabled, fetchDashboard])

  // Setup interval for auto-refresh
  useEffect(() => {
    if (!enabled) {
      return
    }

    intervalRef.current = setInterval(() => {
      fetchDashboard()
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, refreshInterval, fetchDashboard])

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  }
}
