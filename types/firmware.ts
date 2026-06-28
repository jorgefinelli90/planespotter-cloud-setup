/**
 * Firmware types and interfaces
 * Manages firmware versions, releases, and OTA updates
 */

/**
 * Firmware release information
 */
export interface FirmwareRelease {
  /** Unique release identifier */
  id: string
  /** Semantic version (e.g., '1.2.3') */
  version: string
  /** Release channel: 'stable', 'beta', or 'alpha' */
  channel: 'stable' | 'beta' | 'alpha'
  /** Human-readable changelog */
  changelog: string
  /** Release date (ISO 8601) */
  releaseDate: string
  /** Binary file download URL */
  downloadUrl: string
  /** SHA256 checksum for integrity verification */
  checksum: string
  /** Compressed binary size in bytes */
  binarySize: number
  /** Compatible hardware revisions */
  compatibleHardware: string[]
  /** Whether this is a critical security update */
  isSecurityUpdate: boolean
  /** Breaking changes description */
  breakingChanges?: string
  /** Minimum firmware version required for upgrade path */
  minRequiredVersion?: string
}

/**
 * Over-the-air (OTA) update job
 */
export interface OTAUpdateJob {
  /** Unique job identifier */
  id: string
  /** Device ID being updated */
  deviceId: string
  /** Firmware version being deployed */
  firmwareVersion: string
  /** Job status */
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'
  /** Current progress percentage (0-100) */
  progress: number
  /** Job creation time (ISO 8601) */
  createdAt: string
  /** Job start time (ISO 8601) */
  startedAt?: string
  /** Job completion time (ISO 8601) */
  completedAt?: string
  /** Error message if status is 'failed' */
  error?: string
  /** Number of retry attempts */
  retryCount: number
  /** Maximum retry attempts */
  maxRetries: number
  /** Scheduled time for update (ISO 8601), null for immediate */
  scheduledFor?: string
}

/**
 * Firmware rollback request
 */
export interface FirmwareRollback {
  /** Unique rollback identifier */
  id: string
  /** Device ID */
  deviceId: string
  /** Current firmware version to rollback from */
  currentVersion: string
  /** Firmware version to rollback to */
  targetVersion: string
  /** Rollback reason */
  reason: string
  /** Request status */
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | 'failed'
  /** Approval comment if relevant */
  comment?: string
  /** Requested by user/system */
  requestedBy: string
  /** Request timestamp (ISO 8601) */
  requestedAt: string
  /** Approved/Rejected by */
  approvedBy?: string
  /** Approval timestamp (ISO 8601) */
  approvedAt?: string
}

/**
 * Firmware deployment strategy
 */
export interface DeploymentStrategy {
  /** Unique strategy identifier */
  id: string
  /** Strategy name */
  name: string
  /** Deployment description */
  description?: string
  /** Firmware version to deploy */
  firmwareVersion: string
  /** Target device IDs or device groups */
  targets: {
    /** Include all devices with these tags */
    tags?: string[]
    /** Specific device IDs */
    deviceIds?: string[]
    /** Geographic regions */
    regions?: string[]
  }
  /** Rollout strategy */
  rollout: {
    /** Type: 'immediate', 'staged', or 'scheduled' */
    type: 'immediate' | 'staged' | 'scheduled'
    /** Percentage of devices to update per stage (for staged rollouts) */
    stagePercentage?: number
    /** Hours between stages */
    stageIntervalHours?: number
    /** Scheduled deployment time (ISO 8601) */
    scheduledTime?: string
  }
  /** Whether to automatically rollback on errors */
  autoRollback: boolean
  /** Rollback threshold: percentage of failed updates triggering rollback */
  rollbackThreshold: number
  /** Pre-deployment validation required */
  requiresValidation: boolean
  /** Strategy status */
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
  /** Creation timestamp (ISO 8601) */
  createdAt: string
  /** Last updated timestamp (ISO 8601) */
  updatedAt: string
}

/**
 * Firmware build artifact
 * Represents a compiled firmware binary
 */
export interface FirmwareBuild {
  /** Unique build identifier */
  id: string
  /** Build version */
  version: string
  /** Git commit hash */
  commitHash: string
  /** Build timestamp (ISO 8601) */
  timestamp: string
  /** Binary file path/URL */
  binaryUrl: string
  /** SHA256 checksum */
  checksum: string
  /** Build size in bytes */
  size: number
  /** Build status */
  status: 'building' | 'success' | 'failed' | 'testing'
  /** Test results if available */
  testResults?: {
    /** Overall test status */
    status: 'passed' | 'failed'
    /** Test report URL */
    reportUrl?: string
    /** Key metrics */
    metrics: Record<string, number>
  }
}
