'use client'

import { useEffect, useState } from 'react'
import { MapPin, Loader2, Check, AlertCircle } from 'lucide-react'

interface RadarLocation {
  latitude: number
  longitude: number
  altitude?: number
  radiusKm: number
  source: 'manual' | 'ip' | 'gps'
}

interface RadarLimits {
  minRadiusKm: number
  maxRadiusKm: number
  defaultRadiusKm: number
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

export function RadarLocationSettings() {
  const [location, setLocation] = useState<RadarLocation | null>(null)
  const [limits, setLimits] = useState<RadarLimits | null>(null)
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [radiusKm, setRadiusKm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const res = await fetch('/api/settings/location')
        const json = await res.json()
        if (!active) return

        if (json.success && json.data) {
          setLocation(json.data.location)
          setLimits(json.data.limits)
          setLatitude(String(json.data.location.latitude))
          setLongitude(String(json.data.location.longitude))
          setRadiusKm(String(json.data.location.radiusKm))
        } else {
          setErrorMessage('Failed to load radar location')
        }
      } catch {
        if (active) setErrorMessage('Failed to load radar location')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaveState('saving')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/settings/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: Number(latitude),
          longitude: Number(longitude),
          radiusKm: Number(radiusKm),
        }),
      })

      const json = await res.json()

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update location')
      }

      setLocation(json.data.location)
      setLatitude(String(json.data.location.latitude))
      setLongitude(String(json.data.location.longitude))
      setRadiusKm(String(json.data.location.radiusKm))
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch (err) {
      setSaveState('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update location'
      )
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading radar location...</span>
        </div>
      </div>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Radar Location</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Aircraft are filtered to this location within the configured radius.
            {location ? (
              <span className="ml-1">
                Current source:{' '}
                <span className="font-medium uppercase">{location.source}</span>
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="latitude"
            className="text-sm font-medium text-foreground"
          >
            Latitude
          </label>
          <input
            id="latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="longitude"
            className="text-sm font-medium text-foreground"
          >
            Longitude
          </label>
          <input
            id="longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="radius"
            className="text-sm font-medium text-foreground"
          >
            Radius (km)
            {limits ? (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                {limits.minRadiusKm}–{limits.maxRadiusKm}
              </span>
            ) : null}
          </label>
          <input
            id="radius"
            type="number"
            step="1"
            min={limits?.minRadiusKm ?? 1}
            max={limits?.maxRadiusKm ?? 1000}
            value={radiusKm}
            onChange={(e) => setRadiusKm(e.target.value)}
            required
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="sm:col-span-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={saveState === 'saving'}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saveState === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Save location
          </button>

          {saveState === 'saved' ? (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
              <Check className="h-4 w-4" />
              Saved — filtering updated
            </span>
          ) : null}

          {errorMessage ? (
            <span className="inline-flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errorMessage}
            </span>
          ) : null}
        </div>
      </form>
    </section>
  )
}
