// Shared TypeScript types mirroring the backend Pydantic models

export interface CurrentPosition {
  latitude: number
  longitude: number
  altitude_ft?: number | null
  heading?: number | null
  speed_knots?: number | null
}

export interface AircraftListItem {
  icao_hex: string
  registration: string
  aircraft_type: string
  current_position?: CurrentPosition | null
  current_flight?: string | null
  status: 'airborne' | 'on_ground' | 'unknown'
  last_position_update?: string | null
}

export interface AircraftDetail {
  metadata?: {
    icao_hex: string
    registration: string
    aircraft_type: string
    manufacturer?: string
    serial_number?: string
    delivery_date?: string
    airframe_hours?: number
    active?: boolean
  } | null
  current_position?: {
    latitude: number
    longitude: number
    altitude_ft?: number | null
    ground_speed_knots?: number | null
    heading?: number | null
    vertical_rate_ft_min?: number | null
    timestamp?: string | null
  } | null
  flight_info?: {
    flight_number?: string | null
    origin?: string | null
    destination?: string | null
    scheduled_departure?: string | null
    estimated_arrival?: string | null
  } | null
  maintenance?: {
    status: string
    last_service_date?: string | null
  } | null
  incidents: unknown[]
}

export interface TrailPoint {
  timestamp: string
  latitude: number
  longitude: number
  altitude_ft?: number | null
}

export interface Route {
  route_code: string
  origin_iata: string
  origin_name?: string
  destination_iata: string
  destination_name?: string
  distance_km?: number
  typical_duration_hours?: number
  aircraft_types?: string[]
  frequency_per_week?: number
  active?: boolean
  great_circle_path?: Array<{ lat: number; lon: number }>
}

export interface Filters {
  type: string  // '' = all
  status: string  // '' = all, 'airborne', 'on_ground'
}

export type AircraftType = 'B787-9' | 'B787-10' | 'A380-800' | 'A330-300' | 'A330-200'

export const AIRCRAFT_TYPE_COLOR: Record<string, string> = {
  'B787-9': '#A8D8FF',
  'B787-10': '#A8D8FF',
  'A380-800': '#FFB6D9',
  'A330-300': '#FFD4A8',
  'A330-200': '#FFD4A8',
  'unknown': '#E8EEF5',
}

export const AIRCRAFT_TYPES: AircraftType[] = [
  'B787-9', 'B787-10', 'A380-800', 'A330-300', 'A330-200',
]
