'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export type CardinalDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW'

export interface Aircraft {
  id: string
  icao24: string
  callsign: string | null
  latitude: number | null
  longitude: number | null
  altitude: number | null
  groundSpeed: number | null
  track: number | null
  trueTrack?: number | null
  verticalRate: number | null
  onGround: boolean
  squawk: string | null
  timestamp: number
  /** Distance from the radar in km (computed server-side via Haversine) */
  distanceKm?: number
  /** Bearing from the radar in degrees */
  bearing?: number
  /** Cardinal relative direction derived from bearing */
  relativeDirection?: CardinalDirection
}

export interface RadarInfo {
  location: {
    latitude: number
    longitude: number
    altitude?: number
    radiusKm: number
    source: 'manual' | 'ip' | 'gps'
  }
  aircraftInRadius: number
  aircraftFromProvider: number
}

export interface ServiceStatus {
  status: string
  name?: string
  aircraftCount?: number
  lastUpdate?: string | null
  enabled?: boolean
  error?: string
  intervalMs?: number
  lastExecution?: string | null
  nextExecution?: string | null
  ttlMs?: number
  entries?: number
  cacheAgeMs?: number | null
}

export interface SystemStatus {
  lastUpdate: string | null
  cacheAgeMs: number | null
  cacheTtlMs: number
  nextUpdate: string | null
  aircraftCountInCache: number
  schedulerRunning: boolean
  schedulerIntervalMs: number
  lastUpdateError: string | null
  provider: string
  lastSyncDurationMs: number | null
}

export interface DashboardAlert {
  id: string
  type: 'warning' | 'error'
  title: string
  message: string
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
    aircraft: ServiceStatus & { provider?: string }
    scheduler?: ServiceStatus
    cache?: ServiceStatus
  }
  systemStatus?: SystemStatus
  radar?: RadarInfo
  alerts?: DashboardAlert[]
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

      const normalizedAircraft = (json.data.aircraft || []).map(
        (plane: Aircraft) => ({
          ...plane,
          track: plane.track ?? plane.trueTrack ?? null,
        })
      )

      setData({
        ...json.data,
        aircraft: normalizedAircraft,
      })
      setLastUpdated(new Date())
    } catch (err) {
      const fetchError =
        err instanceof Error
          ? err
          : new Error('Failed to fetch dashboard data')
      setError(fetchError)
      console.error('[Dashboard] fetch error:', fetchError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    await fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    if (enabled) {
      fetchDashboard()
    }
  }, [enabled, fetchDashboard])

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
