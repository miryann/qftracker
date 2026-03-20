"""
FastAPI REST API server for the Qantas Aircraft Tracker.

Endpoints (Phase 1):
  GET /api/v1/health
  GET /api/v1/aircraft
  GET /api/v1/aircraft/{icao_hex}
  GET /api/v1/aircraft/{icao_hex}/trail
  GET /api/v1/routes

In local development (ENVIRONMENT=development), an APScheduler background
job runs fetch_qantas_positions() every 30 seconds and writes results to
Firestore. In production this is handled by Cloud Functions + Cloud Scheduler.
"""

import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from google.cloud.firestore_v1.base_query import FieldFilter

from firestore_client import get_firestore_client
from models import (
    AircraftDetailResponse,
    AircraftListItem,
    AircraftListResponse,
    CurrentPosition,
    ErrorDetail,
    ErrorResponse,
    FlightInfo,
    HealthResponse,
    MaintenanceSummary,
    PaginationMeta,
    RouteListResponse,
    TrailPoint,
    TrailResponse,
)
from opensky import fetch_qantas_positions

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

ENVIRONMENT = os.getenv("ENVIRONMENT", "production")

# ── APScheduler (local dev only) ──────────────────────────────────────────────

scheduler = None

def _ingest_positions():
    """Fetch OpenSky data and write to Firestore."""
    db = get_firestore_client()
    positions = fetch_qantas_positions()
    if not positions:
        logger.debug("No positions returned — keeping existing Firestore data")
        return

    # Enrich with metadata (registration + aircraft_type)
    meta_cache: dict = {}
    for pos in positions:
        icao = pos["icao_hex"]
        if icao not in meta_cache:
            meta_doc = db.collection("aircraft_metadata").document(icao).get()
            if meta_doc.exists:
                meta_cache[icao] = meta_doc.to_dict()
        meta = meta_cache.get(icao, {})
        if meta:
            pos["registration"] = meta.get("registration", pos.get("registration", ""))
            pos["aircraft_type"] = meta.get("aircraft_type", pos.get("aircraft_type", "unknown"))

        # Write live position
        db.collection("aircraft_live_positions").document(icao).set(pos)

        # Append trail point (sub-collection, sampled every 30 sec)
        trail_point = {
            "timestamp": pos["timestamp"],
            "latitude": pos["latitude"],
            "longitude": pos["longitude"],
            "altitude_ft": pos.get("altitude_ft"),
        }
        trail_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%SZ")
        (
            db.collection("aircraft_live_positions")
            .document(icao)
            .collection("trail_history")
            .document(trail_id)
            .set(trail_point)
        )

    logger.info("Ingested %d Qantas positions", len(positions))


@asynccontextmanager
async def lifespan(app: FastAPI):
    global scheduler
    if ENVIRONMENT == "development":
        from apscheduler.schedulers.background import BackgroundScheduler
        scheduler = BackgroundScheduler()
        # 30s interval stays within OpenSky anonymous rate limit (100 req/hour)
        scheduler.add_job(_ingest_positions, "interval", seconds=30, id="opensky_ingest")
        scheduler.start()
        logger.info("APScheduler started — ingesting OpenSky data every 30s")
    yield
    if scheduler:
        scheduler.shutdown()


# ── App setup ─────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Qantas Aircraft Tracker API",
    version="1.0.0",
    description="REST API for live Qantas widebody aircraft positions and metadata.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type"],
    max_age=86400,
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


def _make_error(code: str, message: str, status: int) -> HTTPException:
    return HTTPException(
        status_code=status,
        detail=ErrorResponse(
            error=ErrorDetail(
                code=code,
                message=message,
                timestamp=datetime.now(timezone.utc).isoformat(),
                request_id=str(uuid.uuid4())[:8],
            )
        ).model_dump(),
    )


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/api/v1/health", response_model=HealthResponse)
def health():
    db = get_firestore_client()
    firestore_status = "ok"
    opensky_status = "unknown"
    try:
        # Lightweight Firestore probe
        db.collection("aircraft_live_positions").limit(1).get()
    except Exception as exc:
        logger.error("Firestore health check failed: %s", exc)
        firestore_status = "error"
    return HealthResponse(
        status="ok" if firestore_status == "ok" else "degraded",
        timestamp=datetime.now(timezone.utc).isoformat(),
        services={"firestore": firestore_status, "opensky_api": opensky_status},
    )


VALID_AIRCRAFT_TYPES = {"B787-9", "B787-10", "A380-800", "A330-300", "A330-200"}


@app.get("/api/v1/aircraft", response_model=AircraftListResponse)
def list_aircraft(
    type: Optional[str] = Query(None, description="Filter by aircraft type"),
    active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    if type and type not in VALID_AIRCRAFT_TYPES:
        raise _make_error(
            "INVALID_PARAMETER",
            f"Invalid aircraft type '{type}'",
            400,
        )

    db = get_firestore_client()

    # Fetch live positions
    pos_query = db.collection("aircraft_live_positions")
    if type:
        pos_query = pos_query.where(filter=FieldFilter("aircraft_type", "==", type))
    pos_docs = list(pos_query.stream())

    items: list[AircraftListItem] = []
    for doc in pos_docs:
        pos = doc.to_dict()
        on_ground = pos.get("on_ground", True)

        if active is not None:
            # active=True → airborne; active=False → on ground
            if active and on_ground:
                continue
            if not active and not on_ground:
                continue

        current_pos = None
        if pos.get("latitude") is not None and pos.get("longitude") is not None:
            current_pos = CurrentPosition(
                latitude=pos["latitude"],
                longitude=pos["longitude"],
                altitude_ft=pos.get("altitude_ft"),
                heading=pos.get("heading"),
                speed_knots=pos.get("ground_speed_knots"),
            )

        items.append(
            AircraftListItem(
                icao_hex=pos.get("icao_hex", doc.id),
                registration=pos.get("registration", ""),
                aircraft_type=pos.get("aircraft_type", "unknown"),
                current_position=current_pos,
                current_flight=pos.get("flight_number"),
                status="airborne" if not on_ground else "on_ground",
                last_position_update=pos.get("last_position_update"),
            )
        )

    total = len(items)
    paginated = items[offset : offset + limit]
    next_offset = offset + limit if offset + limit < total else None

    return AircraftListResponse(
        data=paginated,
        pagination=PaginationMeta(total=total, offset=offset, limit=limit, next_offset=next_offset),
    )


@app.get("/api/v1/aircraft/{icao_hex}", response_model=AircraftDetailResponse)
def get_aircraft(icao_hex: str):
    db = get_firestore_client()
    icao_hex = icao_hex.upper()

    meta_doc = db.collection("aircraft_metadata").document(icao_hex).get()
    pos_doc = db.collection("aircraft_live_positions").document(icao_hex).get()

    if not meta_doc.exists and not pos_doc.exists:
        raise _make_error("NOT_FOUND", f"Aircraft {icao_hex} not found", 404)

    metadata = meta_doc.to_dict() if meta_doc.exists else None
    pos = pos_doc.to_dict() if pos_doc.exists else None

    current_position = None
    if pos:
        current_position = {
            "latitude": pos.get("latitude"),
            "longitude": pos.get("longitude"),
            "altitude_ft": pos.get("altitude_ft"),
            "ground_speed_knots": pos.get("ground_speed_knots"),
            "heading": pos.get("heading"),
            "vertical_rate_ft_min": pos.get("vertical_rate_ft_min"),
            "timestamp": pos.get("timestamp"),
        }

    flight_info = None
    if pos and pos.get("flight_number"):
        flight_info = FlightInfo(
            flight_number=pos.get("flight_number"),
            origin=pos.get("origin_iata"),
            destination=pos.get("destination_iata"),
        )

    # Phase 1: maintenance and incidents return empty placeholders
    # Phase 2 will add real data ingestion
    maintenance = MaintenanceSummary(status="active")

    return AircraftDetailResponse(
        metadata=metadata,
        current_position=current_position,
        flight_info=flight_info,
        maintenance=maintenance,
        incidents=[],
    )


@app.get("/api/v1/aircraft/{icao_hex}/trail", response_model=TrailResponse)
def get_trail(
    icao_hex: str,
    hours: int = Query(24, ge=1, le=48),
):
    db = get_firestore_client()
    icao_hex = icao_hex.upper()

    pos_doc = db.collection("aircraft_live_positions").document(icao_hex).get()
    if not pos_doc.exists:
        raise _make_error("NOT_FOUND", f"Aircraft {icao_hex} not found", 404)

    pos_data = pos_doc.to_dict()
    registration = pos_data.get("registration", "")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    cutoff_iso = cutoff.isoformat()

    trail_docs = (
        db.collection("aircraft_live_positions")
        .document(icao_hex)
        .collection("trail_history")
        .where(filter=FieldFilter("timestamp", ">=", cutoff_iso))
        .order_by("timestamp")
        .stream()
    )

    trail = []
    for doc in trail_docs:
        d = doc.to_dict()
        trail.append(
            TrailPoint(
                timestamp=d["timestamp"],
                latitude=d["latitude"],
                longitude=d["longitude"],
                altitude_ft=d.get("altitude_ft"),
            )
        )

    return TrailResponse(icao_hex=icao_hex, registration=registration, trail=trail)


@app.get("/api/v1/routes", response_model=RouteListResponse)
def list_routes(
    active: Optional[bool] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    db = get_firestore_client()
    query = db.collection("routes")
    if active is not None:
        query = query.where(filter=FieldFilter("active", "==", active))

    docs = list(query.stream())
    routes = [doc.to_dict() for doc in docs]
    total = len(routes)
    paginated = routes[offset : offset + limit]
    next_offset = offset + limit if offset + limit < total else None

    return RouteListResponse(
        data=paginated,
        pagination=PaginationMeta(total=total, offset=offset, limit=limit, next_offset=next_offset),
    )
