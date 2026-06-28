/**
 * Weather types and interfaces
 * Weather data associated with device locations and aircraft tracking
 */

import type { GeoLocation } from './common'

/**
 * Current weather at a location
 */
export interface Weather {
  /** Weather record identifier */
  id: string
  /** Location coordinates */
  location: GeoLocation
  /** Location name (city, airport, etc.) */
  locationName?: string
  /** Temperature in Celsius */
  temperature: number
  /** Feels like temperature in Celsius */
  feelsLike?: number
  /** Humidity percentage (0-100) */
  humidity: number
  /** Atmospheric pressure in hPa */
  pressure: number
  /** Wind speed in m/s */
  windSpeed: number
  /** Wind gust speed in m/s */
  windGust?: number
  /** Wind direction in degrees (0-359) */
  windDirection: number
  /** Cloud coverage percentage (0-100) */
  cloudCoverage: number
  /** Precipitation in mm */
  precipitation?: number
  /** Visibility in meters */
  visibility?: number
  /** UV index */
  uvIndex?: number
  /** Weather condition */
  condition: WeatherCondition
  /** Weather description */
  description: string
  /** Weather icon/emoji */
  icon?: string
  /** Dew point in Celsius */
  dewPoint?: number
  /** Data source: 'openweather', 'weatherapi', 'custom' */
  source: string
  /** Data timestamp (ISO 8601) */
  timestamp: string
  /** Measurement timestamp (ISO 8601) */
  measuredAt: string
}

/**
 * Weather condition enumeration
 */
export type WeatherCondition =
  | 'clear'
  | 'cloudy'
  | 'overcast'
  | 'partly_cloudy'
  | 'rain'
  | 'drizzle'
  | 'thunderstorm'
  | 'snow'
  | 'sleet'
  | 'fog'
  | 'mist'
  | 'haze'
  | 'wind'
  | 'dust'
  | 'smoke'
  | 'unknown'

/**
 * Weather forecast
 */
export interface WeatherForecast {
  /** Forecast identifier */
  id: string
  /** Location */
  location: GeoLocation
  /** Forecast start time (ISO 8601) */
  startTime: string
  /** Forecast end time (ISO 8601) */
  endTime: string
  /** Array of forecast periods */
  periods: WeatherForecastPeriod[]
  /** Data source */
  source: string
  /** Forecast generated at (ISO 8601) */
  generatedAt: string
}

/**
 * Single weather forecast period
 */
export interface WeatherForecastPeriod {
  /** Period start time (ISO 8601) */
  startTime: string
  /** Period end time (ISO 8601) */
  endTime: string
  /** Temperature in Celsius */
  temperature: number
  /** Wind speed in m/s */
  windSpeed: number
  /** Wind direction in degrees */
  windDirection: number
  /** Precipitation probability (0-100) */
  precipitationProbability: number
  /** Cloud coverage (0-100) */
  cloudCoverage: number
  /** Weather condition */
  condition: WeatherCondition
  /** Humidity (0-100) */
  humidity?: number
  /** Visibility in meters */
  visibility?: number
}

/**
 * METAR (Meteorological Aerodrome Report)
 * Aviation weather report
 */
export interface METAR {
  /** METAR identifier */
  id: string
  /** Airport ICAO code */
  icao: string
  /** Raw METAR string */
  raw: string
  /** METAR timestamp (ISO 8601) */
  timestamp: string
  /** Parsed wind information */
  wind?: {
    /** Wind direction in degrees */
    direction: number
    /** Wind speed in m/s */
    speed: number
    /** Wind gust in m/s */
    gust?: number
  }
  /** Visibility in meters */
  visibility?: number
  /** Cloud layers */
  clouds?: Array<{
    /** Coverage: 'SKC', 'CLR', 'FEW', 'SCT', 'BKN', 'OVC' */
    coverage: string
    /** Altitude in feet */
    altitude: number
    /** Cloud type (if available) */
    type?: string
  }>
  /** Temperature in Celsius */
  temperature?: number
  /** Dew point in Celsius */
  dewPoint?: number
  /** Altimeter setting in hPa */
  altimeter?: number
  /** Weather phenomena */
  phenomena?: string[]
  /** Remarks section */
  remarks?: string
}

/**
 * TAF (Terminal Aerodrome Forecast)
 * Aviation forecast
 */
export interface TAF {
  /** TAF identifier */
  id: string
  /** Airport ICAO code */
  icao: string
  /** Raw TAF string */
  raw: string
  /** Issued timestamp (ISO 8601) */
  issuedAt: string
  /** Valid from (ISO 8601) */
  validFrom: string
  /** Valid until (ISO 8601) */
  validUntil: string
  /** TAF forecast periods */
  periods: TAFPeriod[]
}

/**
 * TAF forecast period
 */
export interface TAFPeriod {
  /** Period start time (ISO 8601) */
  startTime: string
  /** Period end time (ISO 8601) */
  endTime: string
  /** Wind information */
  wind?: {
    /** Direction in degrees */
    direction: number
    /** Speed in m/s */
    speed: number
    /** Gust in m/s */
    gust?: number
  }
  /** Visibility in meters */
  visibility?: number
  /** Weather phenomena */
  phenomena?: string[]
  /** Cloud information */
  clouds?: Array<{
    /** Coverage type */
    coverage: string
    /** Altitude in feet */
    altitude: number
  }>
  /** Change indicator: 'BECMG', 'TEMPO' */
  changeType?: string
}

/**
 * Weather alert
 */
export interface WeatherAlert {
  /** Alert identifier */
  id: string
  /** Alert type */
  type:
    | 'severe_weather'
    | 'wind'
    | 'lightning'
    | 'visibility'
    | 'ceiling'
    | 'icing'
    | 'turbulence'
    | 'other'
  /** Affected location */
  location: GeoLocation
  /** Alert severity: 'advisory', 'warning' */
  severity: 'advisory' | 'warning'
  /** Alert description */
  description: string
  /** Alert start time (ISO 8601) */
  startTime: string
  /** Alert end time (ISO 8601) */
  endTime: string
  /** Affected airports (if applicable) */
  airports?: string[]
  /** Source */
  source: string
  /** Alert issued at (ISO 8601) */
  issuedAt: string
}

/**
 * Weather history
 * Historical weather data for analysis
 */
export interface WeatherHistory {
  /** History identifier */
  id: string
  /** Location */
  location: GeoLocation
  /** Date (ISO 8601) */
  date: string
  /** Minimum temperature in Celsius */
  minTemperature: number
  /** Maximum temperature in Celsius */
  maxTemperature: number
  /** Average temperature in Celsius */
  avgTemperature: number
  /** Precipitation in mm */
  precipitation: number
  /** Average wind speed in m/s */
  avgWindSpeed: number
  /** Predominant weather condition */
  condition: WeatherCondition
  /** Sunrise time (ISO 8601) */
  sunrise?: string
  /** Sunset time (ISO 8601) */
  sunset?: string
}

/**
 * Weather data subscription
 */
export interface WeatherSubscription {
  /** Subscription identifier */
  id: string
  /** User ID */
  userId: string
  /** Location to monitor */
  location: GeoLocation
  /** Location name */
  locationName: string
  /** Update frequency in minutes */
  updateFrequency: number
  /** Enable alerts */
  enableAlerts: boolean
  /** Alert types to notify about */
  alertTypes?: string[]
  /** Is active */
  isActive: boolean
  /** Subscribed at (ISO 8601) */
  subscribedAt: string
}
