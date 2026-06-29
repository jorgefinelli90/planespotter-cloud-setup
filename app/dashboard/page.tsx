'use client'

import { useDashboardData } from '@/hooks/use-dashboard-data'
import { StatusCard } from '@/components/dashboard/status-card'
import { ServiceCard } from '@/components/dashboard/service-card'
import { AircraftTable } from '@/components/dashboard/aircraft-table'
import { AlertPanel, type Alert } from '@/components/dashboard/alert-panel'
import { RefreshButton } from '@/components/dashboard/refresh-button'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { data, isLoading, error, lastUpdated, refresh } = useDashboardData({
    refreshInterval: 30000,
    enabled: true,
  })

  const [alerts, setAlerts] = useState<Alert[]>([])

  // Generate alerts based on data state
  useEffect(() => {
    const newAlerts: Alert[] = []

    if (error) {
      newAlerts.push({
        id: 'fetch-error',
        type: 'error',
        title: 'Failed to fetch dashboard',
        message: error.message || 'Unable to load dashboard data',
      })
    }

    if (data?.services?.aircraft?.status === 'degraded') {
      newAlerts.push({
        id: 'service-degraded',
        type: 'warning',
        title: 'Service Degraded',
        message: data.services.aircraft.error || 'Aircraft service is running with limited capacity',
      })
    }

    if (data?.services?.aircraft?.status === 'error') {
      newAlerts.push({
        id: 'service-error',
        type: 'error',
        title: 'Service Error',
        message: data.services.aircraft.error || 'Aircraft service encountered an error',
      })
    }

    setAlerts(newAlerts)
  }, [data, error])

  const serverStatus =
    !error && data?.services?.aircraft?.status === 'healthy'
      ? 'online'
      : data?.services?.aircraft?.status === 'degraded'
        ? 'degraded'
        : 'offline'

  const formatTime = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A'
    try {
      return new Date(isoString).toLocaleTimeString()
    } catch {
      return 'N/A'
    }
  }

  const aircraftCount = data?.aircraft?.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">PlaneSpotter Dashboard</h1>
            <p className="mt-1 text-zinc-400">
              Real-time aircraft tracking and service monitoring
            </p>
          </div>
          <RefreshButton
            onRefresh={refresh}
            isLoading={isLoading}
            lastUpdated={lastUpdated || undefined}
          />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <AlertPanel alerts={alerts} />
        )}

        {/* Loading State */}
        {isLoading && !data && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-blue-500" />
              <p className="text-sm text-zinc-400">Loading dashboard...</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {data && (
          <>
            {/* Top Row - Status Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatusCard
                title="Server Status"
                status={serverStatus}
                details={[
                  {
                    label: 'Status',
                    value: serverStatus.toUpperCase(),
                  },
                  {
                    label: 'Last Update',
                    value: formatTime(data.services.aircraft.lastUpdate),
                  },
                ]}
                lastUpdate={lastUpdated?.toLocaleTimeString()}
              />

              <StatusCard
                title="Aircraft Detection"
                status="online"
                details={[
                  {
                    label: 'Total Aircraft',
                    value: aircraftCount.toString(),
                  },
                  {
                    label: 'Data Source',
                    value: data.services.aircraft.name || 'OpenSky',
                  },
                ]}
              />

              <StatusCard
                title="API Status"
                status={error ? 'offline' : 'online'}
                details={[
                  {
                    label: 'Endpoint',
                    value: '/api/dashboard',
                  },
                  {
                    label: 'Response',
                    value: error ? 'Error' : 'Success',
                  },
                ]}
              />
            </div>

            {/* Services Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ServiceCard
                name="Aircraft Service"
                status={
                  data.services.aircraft.status as
                    | 'healthy'
                    | 'degraded'
                    | 'error'
                }
                description="Tracks real-time aircraft data"
                details={{
                  aircraft_count: aircraftCount,
                  source: data.services.aircraft.name || 'opensky',
                }}
              />

              <ServiceCard
                name="Scheduler"
                status="healthy"
                description="Periodic update tasks"
                details={{
                  update_interval: '30s',
                  status: 'ready',
                }}
              />

              <ServiceCard
                name="Cache"
                status="healthy"
                description="Response caching layer"
                details={{
                  ttl: '5m',
                  status: 'enabled',
                }}
              />
            </div>

            {/* Aircraft Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Active Aircraft
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Showing {Math.min(25, aircraftCount)} of {aircraftCount} aircraft
                  </p>
                </div>
              </div>
              <AircraftTable
                aircraft={data.aircraft || []}
                isLoading={isLoading}
              />
            </div>

            {/* Footer Info */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-xs text-zinc-500">Last Refresh</p>
                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {lastUpdated?.toLocaleTimeString() || 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Update Frequency</p>
                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    Every 30 seconds
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Data Source</p>
                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    {data.services.aircraft.name || 'OpenSky Network'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !data && error && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  Failed to Load Dashboard
                </h3>
                <p className="mt-2 text-sm text-zinc-400">{error.message}</p>
                <button
                  onClick={refresh}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
