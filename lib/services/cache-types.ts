/**
 * Cache payload types
 */

import type { AircraftData } from './aircraft/types'

export interface AircraftCachePayload {
  aircraft: AircraftData[]
  lastUpdate: string
  lastSuccessfulUpdate: string | null
  provider: string
  aircraftCount: number
  updateDuration: number
  lastError: string | null
}

export interface SystemStatusInfo {
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
