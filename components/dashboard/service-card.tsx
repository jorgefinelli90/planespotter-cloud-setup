import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface ServiceCardProps {
  name: string
  status: 'healthy' | 'degraded' | 'error'
  description?: string
  details?: {
    [key: string]: string | number
  }
}

export function ServiceCard({
  name,
  status,
  description,
  details,
}: ServiceCardProps) {
  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      label: 'Healthy',
    },
    degraded: {
      icon: AlertCircle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      label: 'Degraded',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'Error',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-300">{name}</h3>
          {description && (
            <p className="mt-1 text-xs text-zinc-500">{description}</p>
          )}
        </div>
        <div className={`rounded-full p-2 ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.label}
        </span>
      </div>

      {details && Object.keys(details).length > 0 && (
        <div className="mt-3 space-y-2 border-t border-zinc-800 pt-3">
          {Object.entries(details).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-xs text-zinc-500 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-medium text-zinc-200">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
