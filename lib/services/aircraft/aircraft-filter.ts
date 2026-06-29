/**
 * AircraftFilter
 *
 * Independent processing stage that takes raw aircraft from the cache and:
 *  - calculates the distance between the radar and each aircraft (Haversine)
 *  - calculates the bearing and its cardinal relative direction
 *  - discards aircraft outside the configured radius
 *  - sorts the remaining aircraft by ascending distance
 *
 * This module NEVER modifies AircraftService. Filtering is a separate,
 * stateless stage applied on top of the cached aircraft data.
 */

import type { DeviceLocation } from '@/types'
import type { AircraftData } from './types'

/** Cardinal directions, evenly spaced by 45 degrees starting at North. */
export type CardinalDirection =
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW'

/**
 * Aircraft enriched with radar-relative information.
 */
export interface FilteredAircraft extends AircraftData {
  /** Distance from the radar in kilometers (Haversine) */
  distanceKm: number
  /** Bearing from the radar to the aircraft in degrees (0-359) */
  bearing: number
  /** Cardinal relative direction derived from the bearing */
  relativeDirection: CardinalDirection
}

const EARTH_RADIUS_KM = 6371

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Great-circle distance between two coordinates using the Haversine formula.
 * Returns kilometers. No simple approximations.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

/**
 * Initial bearing (forward azimuth) from point 1 to point 2.
 * Returns degrees normalized to [0, 360).
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1)
  const phi2 = toRadians(lat2)
  const dLon = toRadians(lon2 - lon1)

  const y = Math.sin(dLon) * Math.cos(phi2)
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon)

  const bearing = toDegrees(Math.atan2(y, x))
  return (bearing + 360) % 360
}

/**
 * Convert a bearing in degrees to an 8-point cardinal direction.
 */
export function bearingToCardinal(bearing: number): CardinalDirection {
  const directions: CardinalDirection[] = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ]
  const index = Math.round(((bearing % 360) / 45)) % 8
  return directions[index]
}

/**
 * Filter aircraft to those within the radar radius, enriching each with
 * distance, bearing and relative direction, sorted by ascending distance.
 */
export function filterAircraftByRadius(
  aircraft: AircraftData[],
  location: DeviceLocation
): FilteredAircraft[] {
  const result: FilteredAircraft[] = []

  for (const plane of aircraft) {
    if (plane.latitude === null || plane.longitude === null) {
      continue
    }

    const distanceKm = haversineDistanceKm(
      location.latitude,
      location.longitude,
      plane.latitude,
      plane.longitude
    )

    if (distanceKm > location.radiusKm) {
      continue
    }

    const bearing = calculateBearing(
      location.latitude,
      location.longitude,
      plane.latitude,
      plane.longitude
    )

    result.push({
      ...plane,
      distanceKm,
      bearing,
      relativeDirection: bearingToCardinal(bearing),
    })
  }

  result.sort((a, b) => a.distanceKm - b.distanceKm)

  return result
}
