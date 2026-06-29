/**
 * Interval-based Scheduler Implementation
 *
 * Executes registered services periodically using setInterval.
 */

import type { IService, ServiceExecutionResult } from './base-service'
import type { ServiceManager } from './service-manager'
import {
  BaseScheduler,
  type IScheduler,
  type SchedulerOptions,
} from './scheduler'
import { getLogger } from '@/lib/logger/logger'

export type ServiceExecutionHandler = (
  serviceId: string
) => Promise<ServiceExecutionResult>

/**
 * Scheduler that runs services on configurable intervals
 */
export class IntervalScheduler extends BaseScheduler implements IScheduler {
  private logger = getLogger('Scheduler')
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private serviceManager: ServiceManager
  private executeHandler: ServiceExecutionHandler
  private options: SchedulerOptions

  constructor(
    serviceManager: ServiceManager,
    executeHandler: ServiceExecutionHandler,
    options: SchedulerOptions = {}
  ) {
    super()
    this.serviceManager = serviceManager
    this.executeHandler = executeHandler
    this.options = options
  }

  start(): void {
    if (this.running) {
      return
    }

    this.running = true
    this.logger.info('Scheduler started', {
      tasks: this.tasks.size,
    })

    for (const serviceId of this.tasks.keys()) {
      this.startTaskTimer(serviceId)
    }
  }

  stop(): void {
    if (!this.running) {
      return
    }

    for (const timer of this.timers.values()) {
      clearInterval(timer)
    }
    this.timers.clear()
    this.running = false
    this.logger.info('Scheduler stopped')
  }

  scheduleService(service: IService): string {
    const serviceId = super.scheduleService(service)
    if (this.running) {
      this.startTaskTimer(serviceId)
    }
    return serviceId
  }

  unscheduleService(serviceId: string): void {
    const timer = this.timers.get(serviceId)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(serviceId)
    }
    super.unscheduleService(serviceId)
  }

  async executeNow(serviceId: string): Promise<ServiceExecutionResult> {
    return this.runTask(serviceId)
  }

  async shutdown(): Promise<void> {
    this.stop()
  }

  private startTaskTimer(serviceId: string): void {
    const task = this.tasks.get(serviceId)
    const service = this.serviceManager.getService(serviceId)
    if (!task || !service) {
      return
    }

    const existingTimer = this.timers.get(serviceId)
    if (existingTimer) {
      clearInterval(existingTimer)
    }

    const intervalMs = task.intervalSeconds * 1000

    void this.runTask(serviceId)

    const timer = setInterval(() => {
      void this.runTask(serviceId)
    }, intervalMs)

    if (timer.unref) {
      timer.unref()
    }

    this.timers.set(serviceId, timer)
    task.nextExecution = new Date(Date.now() + intervalMs).toISOString()
  }

  private async runTask(serviceId: string): Promise<ServiceExecutionResult> {
    const task = this.tasks.get(serviceId)
    if (!task) {
      throw new Error(`Scheduled task "${serviceId}" not found`)
    }

    if (task.isRunning) {
      this.logger.warning('Skipping overlapping execution', { serviceId })
      return {
        status: 'running',
        lastRun: new Date().toISOString(),
        duration: 0,
        itemsProcessed: 0,
        error: 'Previous execution still running',
      }
    }

    task.isRunning = true
    const startTime = Date.now()

    try {
      const result = await this.executeHandler(serviceId)
      const duration = Date.now() - startTime

      task.lastExecution = new Date().toISOString()
      task.nextExecution = new Date(
        Date.now() + task.intervalSeconds * 1000
      ).toISOString()

      if (result.status === 'error') {
        this.logger.warning('Scheduled task completed with error', {
          serviceId,
          duration,
          error: result.error,
        })
        this.options.onError?.(
          new Error(result.error || 'Task failed'),
          serviceId
        )
      }

      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const err = error instanceof Error ? error : new Error(String(error))

      this.logger.error('Scheduled task failed', {
        serviceId,
        duration,
        error: err.message,
      })
      this.options.onError?.(err, serviceId)

      return {
        status: 'error',
        lastRun: new Date().toISOString(),
        duration,
        itemsProcessed: 0,
        error: err.message,
      }
    } finally {
      task.isRunning = false
    }
  }
}

export function createIntervalScheduler(
  serviceManager: ServiceManager,
  executeHandler: ServiceExecutionHandler,
  options?: SchedulerOptions
): IntervalScheduler {
  return new IntervalScheduler(serviceManager, executeHandler, options)
}
