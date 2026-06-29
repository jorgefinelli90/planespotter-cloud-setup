'use client'

import { Activity, Clock, Database, RefreshCw } from 'lucide-react'

export interface SystemStatusData {
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

interface SystemStatusCardProps {
  status: SystemStatusData
}

function formatDuration(ms: number | null): string {
  if (ms === null) {
    return 'N/A'
  }

  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function formatTime(isoString: string | null): string {
  if (!isoString) {
    return 'N/A'
  }

  try {
    return new Date(isoString).toLocaleTimeString()
  } catch {
    return 'N/A'
  }
}

export function SystemStatusCard({ status }: SystemStatusCardProps) {
  const schedulerLabel = status.schedulerRunning ? 'Running' : 'Stopped'
  const schedulerColor = status.schedulerRunning
    ? 'text-emerald-500'
    : 'text-amber-500'

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-300">System Status</h3>
          <p className="mt-1 text-xs text-zinc-500">
            Cache y scheduler en segundo plano
          </p>
        </div>
        <div className="rounded-full bg-blue-500/10 p-2">
          <Activity className="h-4 w-4 text-blue-500" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="h-3.5 w-3.5" />
            Última actualización
          </div>
          <span className="text-xs font-medium text-zinc-200">
            {formatTime(status.lastUpdate)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Database className="h-3.5 w-3.5" />
            Edad de la cache
          </div>
          <span className="text-xs font-medium text-zinc-200">
            {formatDuration(status.cacheAgeMs)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <RefreshCw className="h-3.5 w-3.5" />
            Próxima actualización
          </div>
          <span className="text-xs font-medium text-zinc-200">
            {formatTime(status.nextUpdate)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
          <span className="text-xs text-zinc-500">Provider</span>
          <span className="text-sm font-semibold text-emerald-400">
            {status.provider}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Aeronaves en cache</span>
          <span className="text-sm font-semibold text-blue-400">
            {status.aircraftCountInCache}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Scheduler</span>
          <span className={`text-xs font-semibold ${schedulerColor}`}>
            {schedulerLabel} ({formatDuration(status.schedulerIntervalMs)})
          </span>
        </div>
      </div>
    </div>
  )
}
