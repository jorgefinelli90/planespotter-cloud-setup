'use client'

import { PlaneIcon } from 'lucide-react'

interface Aircraft {
  id: string
  callsign: string | null
  altitude: number | null
  groundSpeed: number | null
  track: number | null
  latitude: number | null
  longitude: number | null
  distanceKm?: number
  bearing?: number
  relativeDirection?: string
}

interface AircraftTableProps {
  aircraft: Aircraft[]
  isLoading?: boolean
}

export function AircraftTable({
  aircraft,
  isLoading,
}: AircraftTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-100" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 delay-200" />
        </div>
      </div>
    )
  }

  if (!aircraft || aircraft.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-col items-center justify-center space-y-3 py-8">
          <PlaneIcon className="h-8 w-8 text-zinc-600" />
          <p className="text-sm text-zinc-500">No aircraft detected</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400">
                Callsign
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                Distance
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400">
                Direction
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                Altitude
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                Velocity
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-zinc-400">
                Heading
              </th>
            </tr>
          </thead>
          <tbody>
            {aircraft.slice(0, 25).map((plane) => {
              const distance = plane.distanceKm ?? null
              const heading = Math.round(plane.track ?? plane.bearing ?? 0)
              const speed = Math.round((plane.groundSpeed ?? 0) * 1.94384)
              const altitude = plane.altitude ?? 0

              return (
                <tr
                  key={plane.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-zinc-200">
                    {plane.callsign ? (
                      <span className="font-semibold text-blue-400">
                        {plane.callsign}
                      </span>
                    ) : (
                      <span className="text-zinc-500">{plane.id}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-300">
                    {distance !== null ? `${distance.toFixed(1)} km` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {plane.relativeDirection ? (
                      <span className="inline-flex min-w-[2.5rem] justify-center rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-200">
                        {plane.relativeDirection}
                      </span>
                    ) : (
                      <span className="text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-300">
                    {(altitude / 1000).toFixed(2)} km
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-300">
                    {speed} kt
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-zinc-300">
                    {heading}°
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {aircraft.length > 25 && (
        <div className="border-t border-zinc-800 bg-zinc-900/30 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Showing 25 of {aircraft.length} aircraft
          </p>
        </div>
      )}
    </div>
  )
}
