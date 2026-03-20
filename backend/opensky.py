"""
OpenSky Network API integration.
Fetches live aircraft positions and filters to Qantas widebody fleet.

Rate limits:
  - Authenticated: ~400 req/hour (~1/9 sec)
  - Anonymous:     ~100 req/hour (~1/36 sec)

We default to a 30-second ingestion interval to stay safely within limits.
"""

import logging
import os
from datetime import datetime, timezone
from typing import Optional

import requests

logger = logging.getLogger(__name__)

# OpenSky API bounding box covering Australia + nearby Pacific/Asia routes
# lamin, lomin, lamax, lomax
BOUNDING_BOX = (-50.0, 90.0, 10.0, 180.0)

# Qantas ICAO 24-bit address prefixes (hex, 6 chars = 3 bytes)
# Australian aircraft: 7C0000–7CFFFF; Qantas widebodies cluster in 7C8–7CB
QANTAS_PREFIXES = ("7c8", "7c9", "7ca", "7cb", "7cc", "7cd")

OPENSKY_URL = "https://opensky-network.org/api/states/all"

# OpenSky state vector field indices
# ref: https://openskynetwork.github.io/opensky-api/rest.html
SV_ICAO24 = 0
SV_CALLSIGN = 1
SV_ORIGIN_COUNTRY = 2
SV_TIME_POSITION = 3
SV_LAST_CONTACT = 4
SV_LONGITUDE = 5
SV_LATITUDE = 6
SV_BARO_ALTITUDE = 7
SV_ON_GROUND = 8
SV_VELOCITY = 9
SV_TRUE_TRACK = 10
SV_VERTICAL_RATE = 11
SV_GEO_ALTITUDE = 13
SV_SQUAWK = 14


def _build_auth() -> Optional[tuple[str, str]]:
    username = os.getenv("OPENSKY_USERNAME", "")
    password = os.getenv("OPENSKY_PASSWORD", "")
    if username and password:
        return (username, password)
    return None


def _is_qantas(icao24: str) -> bool:
    return icao24.lower().startswith(QANTAS_PREFIXES)


def _ft(meters: Optional[float]) -> Optional[float]:
    if meters is None:
        return None
    return round(meters * 3.28084, 0)


def _kmh(knots: Optional[float]) -> Optional[float]:
    if knots is None:
        return None
    return round(knots * 1.852, 1)


def _state_to_position(sv: list) -> dict:
    icao = sv[SV_ICAO24].upper() if sv[SV_ICAO24] else ""
    lat = sv[SV_LATITUDE]
    lon = sv[SV_LONGITUDE]
    alt_m = sv[SV_GEO_ALTITUDE] or sv[SV_BARO_ALTITUDE]
    speed_ms = sv[SV_VELOCITY]
    speed_knots = round(speed_ms * 1.94384, 1) if speed_ms else None
    vr_ms = sv[SV_VERTICAL_RATE]
    vr_ftmin = round(vr_ms * 196.85, 0) if vr_ms else None
    callsign = (sv[SV_CALLSIGN] or "").strip() or None
    ts = datetime.now(timezone.utc).isoformat()

    return {
        "icao_hex": icao,
        "registration": "",          # enriched later from aircraft_metadata
        "aircraft_type": "unknown",  # enriched later
        "latitude": lat,
        "longitude": lon,
        "altitude_ft": _ft(alt_m),
        "altitude_m": alt_m,
        "ground_speed_knots": speed_knots,
        "ground_speed_kmh": _kmh(speed_knots),
        "heading": sv[SV_TRUE_TRACK],
        "vertical_rate_ft_min": vr_ftmin,
        "timestamp": ts,
        "last_position_update": ts,
        "flight_number": callsign,
        "origin_iata": None,
        "destination_iata": None,
        "source_api": "opensky",
        "on_ground": bool(sv[SV_ON_GROUND]),
    }


def fetch_qantas_positions() -> list[dict]:
    """
    Fetch Qantas aircraft positions from OpenSky.
    Returns a list of position dicts ready to write to Firestore.
    Returns an empty list on error (caller should use cached Firestore data).
    """
    lamin, lomin, lamax, lomax = BOUNDING_BOX
    params = {
        "lamin": lamin, "lomin": lomin,
        "lamax": lamax, "lomax": lomax,
    }
    auth = _build_auth()

    try:
        resp = requests.get(
            OPENSKY_URL,
            params=params,
            auth=auth,
            timeout=15,
        )
        if resp.status_code == 429:
            logger.warning("OpenSky rate limit hit (429) — using cached positions")
            return []
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.error("OpenSky request failed: %s", exc)
        return []

    data = resp.json()
    states = data.get("states") or []
    positions = []

    for sv in states:
        if not sv or len(sv) < 10:
            continue
        icao = sv[SV_ICAO24] or ""
        if not _is_qantas(icao):
            continue
        lat, lon = sv[SV_LATITUDE], sv[SV_LONGITUDE]
        if lat is None or lon is None:
            continue
        positions.append(_state_to_position(sv))

    logger.info("OpenSky: %d Qantas aircraft found", len(positions))
    return positions
