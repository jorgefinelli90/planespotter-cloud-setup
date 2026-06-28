/**
 * Aircraft types and interfaces
 * Defines structures for aircraft tracking and detection data
 */

import type { GeoLocation } from './common'

/**
 * Detected aircraft information
 * Represents a single aircraft tracked by a PlaneSpotter device
 */
export interface Aircraft {
  /** Unique aircraft identifier (typically ICAO hex code) */
  id: string
  /** ICAO24 address in hex */
  icao24: string
  /** International Civil Aviation Organization (ICAO) code */
  icao?: string
  /** International Air Transport Association (IATA) code */
  iata?: string
  /** Aircraft call sign or registration number */
  callsign?: string
  /** Aircraft type/model identifier */
  aircraftType?: string
  /** Registration number (tail number) */
  registration?: string
  /** Aircraft manufacturer */
  manufacturer?: string
  /** Current aircraft position */
  position: GeoLocation
  /** Ground speed in knots */
  groundSpeed: number
  /** Track angle in degrees (0-359) */
  trackAngle?: number
  /** Vertical rate in feet per minute */
  verticalRate?: number
  /** Whether aircraft is on ground */
  onGround: boolean
  /** Squawk code (4 octal digits) */
  squawk?: string
  /** Signal strength (dBm) from receiver */
  signalStrength: number
  /** Number of Position messages received */
  positionMessageCount: number
  /** Last message timestamp (ISO 8601) */
  lastMessageTime: string
  /** First detection timestamp (ISO 8601) */
  firstDetectionTime: string
  /** Aircraft category */
  category?:
    | 'light'
    | 'small'
    | 'large'
    | 'heavy'
    | 'helicopter'
    | 'glider'
    | 'balloon'
    | 'unknown'
  /** Operating airline IATA code */
  airline?: string
  /** Is military aircraft */
  isMilitary: boolean
  /** Is emergency (Squawk 7700) */
  isEmergency: boolean
  /** Message type */
  messageType?: 'adsb' | 'mlat' | 'tisb' | 'other'
}

/**
 * Aircraft track history
 * Represents the historical path of an aircraft
 */
export interface AircraftTrack {
  /** Unique track identifier */
  id: string
  /** Aircraft ICAO24 */
  icao24: string
  /** Device ID that detected this aircraft */
  deviceId: string
  /** Track start time (ISO 8601) */
  startTime: string
  /** Track end time (ISO 8601) */
  endTime: string
  /** Array of track points (chronological) */
  points: AircraftTrackPoint[]
  /** Total distance traveled in nautical miles */
  totalDistance: number
  /** Minimum altitude reached */
  minAltitude: number
  /** Maximum altitude reached */
  maxAltitude: number
  /** Average speed */
  avgSpeed: number
  /** Duration in seconds */
  duration: number
}

/**
 * Single point in aircraft track history
 */
export interface AircraftTrackPoint {
  /** Position coordinates */
  position: GeoLocation
  /** Ground speed in knots */
  groundSpeed: number
  /** Track angle in degrees */
  trackAngle?: number
  /** Vertical rate in feet per minute */
  verticalRate?: number
  /** Timestamp (ISO 8601) */
  timestamp: string
  /** Signal strength (dBm) */
  signalStrength?: number
}

/**
 * Aircraft statistics
 */
export interface AircraftStatistics {
  /** ICAO24 code */
  icao24: string
  /** Total detections across all devices */
  totalDetections: number
  /** Detections in last 24 hours */
  detections24h: number
  /** Detections in last 7 days */
  detections7d: number
  /** Total unique devices that detected this aircraft */
  uniqueDevices: number
  /** Aircraft category if known */
  category?: string
  /** Most recent callsign used */
  lastCallsign?: string
  /** Most recent airline */
  lastAirline?: string
  /** Signal strength range (min, max) */
  signalRange?: {
    /** Minimum signal strength */
    min: number
    /** Maximum signal strength */
    max: number
  }
}

/**
 * Aircraft alert/interest marker
 * Flags important or interesting aircraft
 */
export interface AircraftAlert {
  /** Unique alert identifier */
  id: string
  /** ICAO24 code */
  icao24: string
  /** Alert type */
  type:
    | 'military'
    | 'emergency'
    | 'interesting'
    | 'rare'
    | 'custom'
  /** Alert reason/description */
  reason: string
  /** Whether alert is active */
  isActive: boolean
  /** Alert creation timestamp (ISO 8601) */
  createdAt: string
  /** Custom alert tags */
  tags?: string[]
  /** Notification priority: 'low', 'medium', 'high' */
  priority?: 'low' | 'medium' | 'high'
  /** Notify on detection */
  notifyOnDetection: boolean
}

/**
 * Aircraft comparison data
 * Used for statistics and analytics
 */
export interface AircraftFleetStatistics {
  /** Date range */
  period: {
    /** Start date (ISO 8601) */
    start: string
    /** End date (ISO 8601) */
    end: string
  }
  /** Total unique aircraft detected */
  totalUniqueAircraft: number
  /** Aircraft by category */
  byCategory: Record<string, number>
  /** Aircraft by airline */
  byAirline: Record<string, number>
  /** Most detected aircraft (top 10) */
  mostDetected: Array<{
    /** ICAO24 code */
    icao24: string
    /** Detection count */
    count: number
    /** Call sign if available */
    callsign?: string
  }>
  /** Average signal strength */
  avgSignalStrength: number
  /** Peak activity hour */
  peakActivityHour?: number
}

/**
 * Aircraft database entry (for caching airline/manufacturer info)
 */
export interface AircraftRegistry {
  /** ICAO24 code */
  icao24: string
  /** Registration/Tail number */
  registration: string
  /** Aircraft type */
  aircraftType: string
  /** Manufacturer name */
  manufacturer: string
  /** Manufacturing year */
  manufactureYear?: number
  /** Registered operator/airline */
  operator: string
  /** Last updated timestamp (ISO 8601) */
  lastUpdated: string
}
