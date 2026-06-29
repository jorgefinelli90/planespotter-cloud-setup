/**
 * Scheduler - Service execution scheduler
 *
 * Coordinates periodic execution of services based on their refresh intervals.
 * Designed to be implementation-agnostic (cron, node-schedule, custom, etc).
 *
 * Sprint 4: Architecture only, no execution
 * Sprint 5+: Implement with actual scheduler (cron/node-schedule/etc)
 */

import type { IService, ServiceExecutionResult } from './base-service'

/**
 * Scheduled task entry
 */
export interface ScheduledTask {
  serviceId: string
  intervalSeconds: number
  lastExecution: string
  nextExecution: string
  isRunning: boolean
}

/**
 * Scheduler interface
 * Defines contract for service scheduling implementations
 */
export interface IScheduler {
  /**
   * Schedule a service for periodic execution
   *
   * @param service - Service to schedule
   * @returns Task ID
   */
  scheduleService(service: IService): string

  /**
   * Unschedule a service
   *
   * @param serviceId - Service ID
   */
  unscheduleService(serviceId: string): void

  /**
   * Start the scheduler
   * Begins executing scheduled tasks
   */
  start(): void

  /**
   * Stop the scheduler
   * Stops executing new tasks
   */
  stop(): void

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks(): ScheduledTask[]

  /**
   * Get a specific scheduled task
   */
  getScheduledTask(serviceId: string): ScheduledTask | undefined

  /**
   * Manually trigger execution of a service
   */
  executeNow(serviceId: string): Promise<ServiceExecutionResult>

  /**
   * Cleanup and stop scheduler
   */
  shutdown(): Promise<void>
}

/**
 * Abstract base scheduler implementation
 * Provides common functionality for scheduler implementations
 */
export abstract class BaseScheduler implements IScheduler {
  protected running: boolean = false
  protected tasks: Map<string, ScheduledTask> = new Map()

  /**
   * Schedule a service for periodic execution
   */
  scheduleService(service: IService): string {
    if (service.refreshInterval <= 0) {
      throw new Error(
        `Cannot schedule service "${service.id}": invalid refresh interval`
      )
    }

    const now = new Date()
    const nextRun = new Date(now.getTime() + service.refreshInterval * 1000)

    this.tasks.set(service.id, {
      serviceId: service.id,
      intervalSeconds: service.refreshInterval,
      lastExecution: now.toISOString(),
      nextExecution: nextRun.toISOString(),
      isRunning: false,
    })

    return service.id
  }

  /**
   * Unschedule a service
   */
  unscheduleService(serviceId: string): void {
    this.tasks.delete(serviceId)
  }

  /**
   * Start the scheduler
   */
  abstract start(): void

  /**
   * Stop the scheduler
   */
  abstract stop(): void

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this.running
  }

  /**
   * Get all scheduled tasks
   */
  getScheduledTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values())
  }

  /**
   * Get a specific scheduled task
   */
  getScheduledTask(serviceId: string): ScheduledTask | undefined {
    return this.tasks.get(serviceId)
  }

  /**
   * Manually trigger execution of a service
   * Must be implemented by subclasses
   */
  abstract executeNow(serviceId: string): Promise<ServiceExecutionResult>

  /**
   * Cleanup and stop scheduler
   */
  abstract shutdown(): Promise<void>
}

/**
 * Scheduler options for customization
 */
export interface SchedulerOptions {
  /**
   * Enable debug logging
   */
  debug?: boolean

  /**
   * Maximum concurrent service executions
   */
  maxConcurrent?: number

  /**
   * Timeout for service execution (ms)
   */
  executionTimeout?: number

  /**
   * Custom error handler
   */
  onError?: (error: Error, serviceId: string) => void
}

/**
 * Factory function to create a scheduler
 */
export function createScheduler(options?: SchedulerOptions): IScheduler {
  throw new Error(
    'Use createIntervalScheduler via bootstrap instead of createScheduler directly'
  )
}
