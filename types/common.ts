/**
 * Common types and utilities used across PlaneSpotter Cloud
 * These are fundamental types that serve as building blocks for domain models
 */

/**
 * Represents a geographic coordinate with altitude
 * Used for tracking aircraft and device locations
 */
export interface GeoLocation {
  /** Latitude in decimal degrees (-90 to 90) */
  latitude: number
  /** Longitude in decimal degrees (-180 to 180) */
  longitude: number
  /** Altitude in meters above sea level */
  altitude: number
}

/**
 * Standard pagination parameters
 * Used in API requests for list endpoints
 */
export interface PaginationParams {
  /** Current page number (1-indexed) */
  page: number
  /** Number of items per page */
  limit: number
  /** Sort field (ascending by default, prefix with '-' for descending) */
  sort?: string
}

/**
 * Pagination metadata returned in API responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number
  /** Items per page */
  limit: number
  /** Total number of items */
  total: number
  /** Total number of pages */
  totalPages: number
  /** Whether more pages exist */
  hasMore: boolean
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  /** Error code for programmatic handling */
  code: string
  /** Human-readable error message */
  message: string
  /** Additional context or details */
  details?: Record<string, unknown>
  /** Request ID for debugging */
  requestId?: string
}

/**
 * API response wrapper for consistency
 */
export interface ApiResponse<T> {
  /** Response status */
  success: boolean
  /** Response data */
  data?: T
  /** Error information if success is false */
  error?: ErrorResponse
  /** Pagination info for list responses */
  pagination?: PaginationMeta
  /** Response timestamp in ISO 8601 format */
  timestamp: string
}

/**
 * Metadata for tracking record changes
 */
export interface AuditMetadata {
  /** When the record was created (ISO 8601) */
  createdAt: string
  /** When the record was last updated (ISO 8601) */
  updatedAt: string
  /** User or system that created the record */
  createdBy: string
  /** User or system that last updated the record */
  updatedBy?: string
}

/**
 * Connection status for devices and services
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'idle'

/**
 * Health status indicators
 */
export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'unknown'
