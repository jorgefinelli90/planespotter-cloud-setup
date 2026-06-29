import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface StatusCardProps {
  title: string
  status: 'online' | 'offline' | 'degraded'
  lastUpdate?: string
  details?: Array<{
    label: string
    value: string
  }>
}

export function StatusCard({
  title,
  status,
  lastUpdate,
  details,
}: StatusCardProps) {
  const statusColor =
    status === 'online'
      ? 'text-emerald-500'
      : status === 'degraded'
        ? 'text-amber-500'
        : 'text-red-500'

  const statusBgColor =
    status === 'online'
      ? 'bg-emerald-500/10'
      : status === 'degraded'
        ? 'bg-amber-500/10'
        : 'bg-red-500/10'

  const StatusIcon =
    status === 'online'
      ? CheckCircle
      : status === 'degraded'
        ? AlertCircle
        : AlertCircle

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
          <div className="mt-4 flex items-center gap-2">
            <div className={`rounded-full p-2 ${statusBgColor}`}>
              <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            </div>
            <span
              className={`text-lg font-semibold capitalize ${statusColor}`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="mt-6 space-y-3">
          {details.map((detail, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-xs text-zinc-500">{detail.label}</span>
              <span className="text-xs font-medium text-zinc-200">
                {detail.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {lastUpdate && (
        <div className="mt-4 flex items-center gap-2 pt-4 border-t border-zinc-800">
          <Clock className="h-3 w-3 text-zinc-500" />
          <span className="text-xs text-zinc-500">
            Last update: {lastUpdate}
          </span>
        </div>
      )}
    </div>
  )
}
