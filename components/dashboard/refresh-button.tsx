'use client'

import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

interface RefreshButtonProps {
  onRefresh: () => Promise<void>
  isLoading?: boolean
  lastUpdated?: Date
}

export function RefreshButton({
  onRefresh,
  isLoading = false,
  lastUpdated,
}: RefreshButtonProps) {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsManualRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsManualRefreshing(false)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000

    if (diff < 60) {
      return 'just now'
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60)
      return `${mins}m ago`
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600)
      return `${hours}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isLoading || isManualRefreshing}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw
          className={`h-4 w-4 ${isLoading || isManualRefreshing ? 'animate-spin' : ''}`}
        />
        <span>Refresh</span>
      </button>
      {lastUpdated && (
        <span className="text-xs text-zinc-500">
          Updated {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  )
}
