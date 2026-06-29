/**
 * Application Bootstrap
 *
 * Initializes ServiceManager, Cache, Scheduler, and DashboardBuilder.
 * Ensures background updates run independently from API requests.
 */

import { appConfig, validateConfig } from '@/lib/config/app-config'
import { configureLogger, getLogger } from '@/lib/logger/logger'
import { createAircraftService, type AircraftService } from './aircraft'
import { runAircraftUpdate } from './aircraft-updater'
import type { ICache } from './cache'
import { getCacheInstance } from './cache/in-memory-cache'
import {
  createDashboardBuilder,
  type DashboardBuilder,
} from './dashboard-builder'
import {
  createIntervalScheduler,
  type IntervalScheduler,
} from './interval-scheduler'
import { createServiceManager, type ServiceManager } from './service-manager'
import {
  ensureLocationInitialized,
  type LocationService,
} from './location/location-service'

const logger = getLogger('Bootstrap')

export interface AppRuntime {
  serviceManager: ServiceManager
  cache: ICache
  scheduler: IntervalScheduler
  dashboardBuilder: DashboardBuilder
  aircraftService: AircraftService
  locationService: LocationService
}

declare global {
  // eslint-disable-next-line no-var
  var __planespotterRuntime: AppRuntime | undefined
  // eslint-disable-next-line no-var
  var __planespotterInitPromise: Promise<AppRuntime> | undefined
}

async function createRuntime(): Promise<AppRuntime> {
  configureLogger()

  const configValidation = validateConfig()

  if (!configValidation.valid) {
    logger.error('Application configuration is invalid — cannot start OpenSky provider')
    for (const message of configValidation.errors) {
      logger.error(message)
    }
    if (configValidation.missingEnvVars.length > 0) {
      logger.error('Missing environment variables', {
        variables: configValidation.missingEnvVars,
      })
    }
    throw new Error(
      `Invalid configuration: ${configValidation.errors.join('; ')}`
    )
  }

  logger.info('Configuration validated successfully')

  const serviceManager = createServiceManager()
  const cache = getCacheInstance()
  const aircraftService = createAircraftService()

  // Initialize radar location before building the dashboard so filtering
  // has a valid location from the very first request. On first ever startup
  // this performs a one-time IP geolocation lookup and persists the result.
  // Uses the shared singleton so the settings API mutates the same instance.
  const locationService = await ensureLocationInitialized()
  const initialLocation = locationService.getLocation()
  logger.info('Radar location ready', {
    latitude: initialLocation.latitude,
    longitude: initialLocation.longitude,
    radiusKm: initialLocation.radiusKm,
    source: initialLocation.source,
  })

  aircraftService.refreshInterval = Math.max(
    1,
    Math.floor(appConfig.scheduler.aircraftUpdateInterval / 1000)
  )

  serviceManager.register(aircraftService)
  await serviceManager.initializeAll()

  const scheduler = createIntervalScheduler(
    serviceManager,
    async (serviceId) => {
      if (serviceId === 'aircraft') {
        return runAircraftUpdate(aircraftService, cache)
      }

      return serviceManager.executeService(serviceId)
    },
    {
      onError: (error, serviceId) => {
        logger.error('Scheduler task error', {
          serviceId,
          error: error.message,
        })
      },
    }
  )

  const dashboardBuilder = createDashboardBuilder(serviceManager, {
    cache,
    includeMetadata: true,
    locationService,
  })

  if (appConfig.features.schedulerEnabled && appConfig.scheduler.enabled) {
    scheduler.scheduleService(aircraftService)
    scheduler.start()
    logger.info('Scheduler started with aircraft update task', {
      provider: 'OpenSky',
      intervalMs: appConfig.scheduler.aircraftUpdateInterval,
    })
  } else {
    logger.info('Scheduler disabled by configuration')
  }

  return {
    serviceManager,
    cache,
    scheduler,
    dashboardBuilder,
    aircraftService,
    locationService,
  }
}

export async function ensureAppInitialized(): Promise<AppRuntime> {
  if (globalThis.__planespotterRuntime) {
    return globalThis.__planespotterRuntime
  }

  if (!globalThis.__planespotterInitPromise) {
    globalThis.__planespotterInitPromise = createRuntime()
      .then((runtime) => {
        globalThis.__planespotterRuntime = runtime
        return runtime
      })
      .catch((error) => {
        globalThis.__planespotterInitPromise = undefined
        throw error
      })
  }

  return globalThis.__planespotterInitPromise
}

export function getAppRuntime(): AppRuntime | undefined {
  return globalThis.__planespotterRuntime
}

export async function resetAppRuntime(): Promise<void> {
  const runtime = globalThis.__planespotterRuntime
  if (runtime) {
    await runtime.scheduler.shutdown()
    await runtime.serviceManager.cleanupAll()
  }

  globalThis.__planespotterRuntime = undefined
  globalThis.__planespotterInitPromise = undefined
}
