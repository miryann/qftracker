"""
Pydantic v2 models matching the Firestore schema defined in the architecture document.
Field names mirror the exact collection schema — do not rename without updating Firestore docs.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Firestore document models ────────────────────────────────────────────────

class AircraftMetadata(BaseModel):
    icao_hex: str
    registration: str
    aircraft_type: str
    manufacturer: str
    serial_number: Optional[str] = None
    delivery_date: Optional[str] = None
    first_flight_date: Optional[str] = None
    airframe_hours: Optional[float] = None
    cycle_count: Optional[int] = None
    max_range_km: Optional[int] = None
    seat_configuration: Optional[str] = None
    active: bool = True
    last_updated: Optional[str] = None


class AircraftPosition(BaseModel):
    icao_hex: str
    registration: str
    aircraft_type: str
    latitude: float
    longitude: float
    altitude_ft: Optional[float] = None
    altitude_m: Optional[float] = None
    ground_speed_knots: Optional[float] = None
    ground_speed_kmh: Optional[float] = None
    heading: Optional[float] = None
    vertical_rate_ft_min: Optional[float] = None
    timestamp: str
    last_position_update: str
    flight_number: Optional[str] = None
    origin_iata: Optional[str] = None
    destination_iata: Optional[str] = None
    source_api: str = "opensky"
    on_ground: bool = False


class TrailPoint(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    altitude_ft: Optional[float] = None


class RouteDocument(BaseModel):
    route_code: str
    origin_iata: str
    origin_name: Optional[str] = None
    destination_iata: str
    destination_name: Optional[str] = None
    distance_km: Optional[int] = None
    distance_nm: Optional[int] = None
    typical_duration_hours: Optional[float] = None
    aircraft_types: list[str] = []
    frequency_per_week: Optional[int] = None
    active: bool = True
    great_circle_path: list[dict[str, float]] = []
    last_updated: Optional[str] = None


# ── API response models ───────────────────────────────────────────────────────

class CurrentPosition(BaseModel):
    latitude: float
    longitude: float
    altitude_ft: Optional[float] = None
    heading: Optional[float] = None
    speed_knots: Optional[float] = None


class AircraftListItem(BaseModel):
    icao_hex: str
    registration: str
    aircraft_type: str
    current_position: Optional[CurrentPosition] = None
    current_flight: Optional[str] = None
    status: str  # "airborne" | "on_ground" | "unknown"
    last_position_update: Optional[str] = None


class PaginationMeta(BaseModel):
    total: int
    offset: int
    limit: int
    next_offset: Optional[int] = None


class AircraftListResponse(BaseModel):
    data: list[AircraftListItem]
    pagination: PaginationMeta


class FlightInfo(BaseModel):
    flight_number: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    scheduled_departure: Optional[str] = None
    estimated_arrival: Optional[str] = None


class MaintenanceSummary(BaseModel):
    status: str = "active"
    last_service_date: Optional[str] = None
    next_scheduled_service: Optional[str] = None
    hours_since_last_service: Optional[float] = None


class IncidentSummary(BaseModel):
    id: Optional[str] = None
    date: Optional[str] = None
    type: Optional[str] = None
    severity: Optional[str] = None
    title: Optional[str] = None


class AircraftDetailResponse(BaseModel):
    metadata: Optional[dict[str, Any]] = None
    current_position: Optional[dict[str, Any]] = None
    flight_info: Optional[FlightInfo] = None
    maintenance: Optional[MaintenanceSummary] = None
    incidents: list[IncidentSummary] = []


class TrailResponse(BaseModel):
    icao_hex: str
    registration: str
    trail: list[TrailPoint]


class RouteListResponse(BaseModel):
    data: list[dict[str, Any]]
    pagination: PaginationMeta


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    services: dict[str, str]


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None
    timestamp: str
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail
