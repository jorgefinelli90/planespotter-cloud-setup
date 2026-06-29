import { AlertCircle, Info, CheckCircle, X } from 'lucide-react'
import { useState } from 'react'

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
}

interface AlertPanelProps {
  alerts: Alert[]
}

export function AlertPanel({ alerts }: AlertPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  )

  const visibleAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id))

  if (!visibleAlerts || visibleAlerts.length === 0) {
    return null
  }

  const getAlertConfig = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400',
          titleColor: 'text-red-300',
        }
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/50',
          textColor: 'text-amber-400',
          titleColor: 'text-amber-300',
        }
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/50',
          textColor: 'text-emerald-400',
          titleColor: 'text-emerald-300',
        }
      case 'info':
      default:
        return {
          icon: Info,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/50',
          textColor: 'text-blue-400',
          titleColor: 'text-blue-300',
        }
    }
  }

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const config = getAlertConfig(alert.type)
        const Icon = config.icon

        return (
          <div
            key={alert.id}
            className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-4 flex items-start justify-between gap-4`}
          >
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`h-5 w-5 ${config.textColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h4 className={`text-sm font-semibold ${config.titleColor}`}>
                  {alert.title}
                </h4>
                <p className={`text-xs ${config.textColor} mt-1 opacity-90`}>
                  {alert.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const newDismissed = new Set(dismissedAlerts)
                newDismissed.add(alert.id)
                setDismissedAlerts(newDismissed)
              }}
              className="text-zinc-500 hover:text-zinc-400 flex-shrink-0"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
