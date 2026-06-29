/**
 * Production Aircraft Provider Factory
 *
 * Creates OpenSkyProvider for runtime use.
 * Stub provider is available only via stub-provider.ts for tests.
 */

import { appConfig, validateOpenSkyConfig } from '@/lib/config/app-config'
import { getLogger } from '@/lib/logger/logger'
import type { IAircraftProvider } from './provider'
import { createOpenSkyProvider } from './opensky'

const logger = getLogger('AircraftProviderFactory')

/**
 * Create the production aircraft data provider (OpenSky).
 * Throws if OpenSky configuration is invalid.
 */
export function createAircraftProvider(): IAircraftProvider {
  const validation = validateOpenSkyConfig()

  if (!validation.valid) {
    for (const message of validation.errors) {
      logger.error(message)
    }

    throw new Error(
      `OpenSky configuration invalid: ${validation.errors.join('; ')}`
    )
  }

  logger.info('Creating OpenSky provider', {
    apiUrl: appConfig.opensky.apiUrl,
    username: appConfig.opensky.username,
  })

  return createOpenSkyProvider(
    appConfig.opensky.username,
    appConfig.opensky.password,
    appConfig.opensky.apiUrl,
    appConfig.opensky.tokenUrl
  )
}
