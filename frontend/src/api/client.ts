import axios from 'axios'
import type { AircraftDetail, AircraftListItem, Filters, Route, TrailPoint } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10_000,
})

export interface AircraftListResponse {
  data: AircraftListItem[]
  pagination: {
    total: number
    offset: number
    limit: number
    next_offset?: number | null
  }
}

export interface RouteListResponse {
  data: Route[]
  pagination: {
    total: number
    offset: number
    limit: number
  }
}

export interface TrailResponse {
  icao_hex: string
  registration: string
  trail: TrailPoint[]
}

export async function fetchAircraft(filters: Partial<Filters> = {}): Promise<AircraftListItem[]> {
  const params: Record<string, string> = { limit: '500' }
  if (filters.type) params.type = filters.type
  if (filters.status === 'airborne') params.active = 'true'
  if (filters.status === 'on_ground') params.active = 'false'

  const res = await api.get<AircraftListResponse>('/api/v1/aircraft', { params })
  return res.data.data
}

export async function fetchAircraftDetail(icaoHex: string): Promise<AircraftDetail> {
  const res = await api.get<AircraftDetail>(`/api/v1/aircraft/${icaoHex}`)
  return res.data
}

export async function fetchAircraftTrail(icaoHex: string, hours = 24): Promise<TrailPoint[]> {
  const res = await api.get<TrailResponse>(`/api/v1/aircraft/${icaoHex}/trail`, {
    params: { hours },
  })
  return res.data.trail
}

export async function fetchRoutes(): Promise<Route[]> {
  const res = await api.get<RouteListResponse>('/api/v1/routes', { params: { active: 'true' } })
  return res.data.data
}
