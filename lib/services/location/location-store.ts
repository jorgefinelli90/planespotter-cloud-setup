/**
 * Location Store
 *
 * File-based persistence for the radar DeviceLocation.
 * Ensures the configured location survives server restarts so the
 * IP geolocation lookup only runs on the very first startup.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { DeviceLocation } from '@/types'
import { getLogger } from '@/lib/logger/logger'

const logger = getLogger('LocationStore')

const DATA_DIR = path.join(process.cwd(), '.data')
const LOCATION_FILE = path.join(DATA_DIR, 'radar-location.json')

/**
 * Read the persisted location, or null if none has been saved yet.
 */
export async function readPersistedLocation(): Promise<DeviceLocation | null> {
  try {
    const raw = await fs.readFile(LOCATION_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as DeviceLocation

    if (
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      typeof parsed.radiusKm === 'number'
    ) {
      return parsed
    }

    logger.warning('Persisted location file is malformed — ignoring')
    return null
  } catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code !== 'ENOENT') {
      logger.warning('Failed to read persisted location', {
        error: err.message,
      })
    }
    return null
  }
}

/**
 * Persist the location to disk, creating the data directory if needed.
 */
export async function writePersistedLocation(
  location: DeviceLocation
): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
    await fs.writeFile(
      LOCATION_FILE,
      JSON.stringify(location, null, 2),
      'utf-8'
    )
    logger.debug('Radar location persisted', { file: LOCATION_FILE })
  } catch (error) {
    logger.error('Failed to persist radar location', error as Error)
  }
}
