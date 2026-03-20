"""
Seed script: loads example aircraft into the Firestore emulator.
Run after starting docker-compose:
  docker-compose exec backend-api python seed_data.py
Or locally:
  FIRESTORE_EMULATOR_HOST=localhost:8080 python seed_data.py
"""

import os
import sys
from datetime import datetime, timezone

from firestore_client import get_firestore_client

SEED_METADATA = [
    {
        "icao_hex": "7CF8A7",
        "registration": "VH-ZNA",
        "aircraft_type": "B787-9",
        "manufacturer": "Boeing",
        "serial_number": "35843",
        "delivery_date": "2020-03-15",
        "first_flight_date": "2020-02-18",
        "airframe_hours": 12450.5,
        "cycle_count": 4230,
        "max_range_km": 14685,
        "seat_configuration": "LAYOUT_B787_236",
        "active": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "icao_hex": "7CF8B2",
        "registration": "VH-ZNB",
        "aircraft_type": "B787-9",
        "manufacturer": "Boeing",
        "serial_number": "35844",
        "delivery_date": "2020-05-20",
        "first_flight_date": "2020-04-25",
        "airframe_hours": 11200.0,
        "cycle_count": 3980,
        "max_range_km": 14685,
        "seat_configuration": "LAYOUT_B787_236",
        "active": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "icao_hex": "7CF8C1",
        "registration": "VH-ZNC",
        "aircraft_type": "B787-9",
        "manufacturer": "Boeing",
        "serial_number": "35845",
        "delivery_date": "2021-01-10",
        "first_flight_date": "2020-12-15",
        "airframe_hours": 9800.0,
        "cycle_count": 3400,
        "max_range_km": 14685,
        "seat_configuration": "LAYOUT_B787_236",
        "active": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "icao_hex": "7CB01A",
        "registration": "VH-OQA",
        "aircraft_type": "A380-800",
        "manufacturer": "Airbus",
        "serial_number": "019",
        "delivery_date": "2008-09-19",
        "first_flight_date": "2008-08-22",
        "airframe_hours": 45000.0,
        "cycle_count": 12500,
        "max_range_km": 15200,
        "seat_configuration": "LAYOUT_A380_484",
        "active": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "icao_hex": "7CB02B",
        "registration": "VH-OQB",
        "aircraft_type": "A380-800",
        "manufacturer": "Airbus",
        "serial_number": "020",
        "delivery_date": "2008-10-30",
        "first_flight_date": "2008-09-28",
        "airframe_hours": 43500.0,
        "cycle_count": 12100,
        "max_range_km": 15200,
        "seat_configuration": "LAYOUT_A380_484",
        "active": True,
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
]

SEED_POSITIONS = [
    {
        "icao_hex": "7CF8A7",
        "registration": "VH-ZNA",
        "aircraft_type": "B787-9",
        "latitude": -33.9249,
        "longitude": 151.1754,
        "altitude_ft": 0,
        "altitude_m": 0,
        "ground_speed_knots": 0,
        "ground_speed_kmh": 0,
        "heading": 0,
        "vertical_rate_ft_min": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "last_position_update": datetime.now(timezone.utc).isoformat(),
        "flight_number": None,
        "origin_iata": None,
        "destination_iata": None,
        "source_api": "seed",
        "on_ground": True,
    },
    {
        "icao_hex": "7CF8B2",
        "registration": "VH-ZNB",
        "aircraft_type": "B787-9",
        "latitude": -26.5,
        "longitude": 153.2,
        "altitude_ft": 35000,
        "altitude_m": 10668,
        "ground_speed_knots": 490,
        "ground_speed_kmh": 907,
        "heading": 45,
        "vertical_rate_ft_min": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "last_position_update": datetime.now(timezone.utc).isoformat(),
        "flight_number": "QF500",
        "origin_iata": "SYD",
        "destination_iata": "BNE",
        "source_api": "seed",
        "on_ground": False,
    },
    {
        "icao_hex": "7CF8C1",
        "registration": "VH-ZNC",
        "aircraft_type": "B787-9",
        "latitude": -12.0,
        "longitude": 130.5,
        "altitude_ft": 38000,
        "altitude_m": 11582,
        "ground_speed_knots": 510,
        "ground_speed_kmh": 945,
        "heading": 310,
        "vertical_rate_ft_min": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "last_position_update": datetime.now(timezone.utc).isoformat(),
        "flight_number": "QF7",
        "origin_iata": "SYD",
        "destination_iata": "LAX",
        "source_api": "seed",
        "on_ground": False,
    },
    {
        "icao_hex": "7CB01A",
        "registration": "VH-OQA",
        "aircraft_type": "A380-800",
        "latitude": -37.8136,
        "longitude": 144.9631,
        "altitude_ft": 0,
        "altitude_m": 0,
        "ground_speed_knots": 0,
        "ground_speed_kmh": 0,
        "heading": 180,
        "vertical_rate_ft_min": 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "last_position_update": datetime.now(timezone.utc).isoformat(),
        "flight_number": None,
        "origin_iata": None,
        "destination_iata": None,
        "source_api": "seed",
        "on_ground": True,
    },
    {
        "icao_hex": "7CB02B",
        "registration": "VH-OQB",
        "aircraft_type": "A380-800",
        "latitude": 1.3521,
        "longitude": 103.8198,
        "altitude_ft": 37000,
        "altitude_m": 11278,
        "ground_speed_knots": 520,
        "ground_speed_kmh": 963,
        "heading": 200,
        "vertical_rate_ft_min": -100,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "last_position_update": datetime.now(timezone.utc).isoformat(),
        "flight_number": "QF1",
        "origin_iata": "SYD",
        "destination_iata": "SIN",
        "source_api": "seed",
        "on_ground": False,
    },
]

SEED_ROUTES = [
    {
        "route_code": "SYD-LAX",
        "origin_iata": "SYD",
        "origin_name": "Sydney Kingsford Smith",
        "destination_iata": "LAX",
        "destination_name": "Los Angeles International",
        "distance_km": 12051,
        "distance_nm": 6508,
        "typical_duration_hours": 15.5,
        "aircraft_types": ["B787-9", "B787-10"],
        "frequency_per_week": 4,
        "active": True,
        "great_circle_path": [
            {"lat": -33.9, "lon": 151.2},
            {"lat": -20.0, "lon": 160.0},
            {"lat": 0.0, "lon": 175.0},
            {"lat": 20.0, "lon": -170.0},
            {"lat": 34.0, "lon": -118.2},
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "route_code": "SYD-SIN",
        "origin_iata": "SYD",
        "origin_name": "Sydney Kingsford Smith",
        "destination_iata": "SIN",
        "destination_name": "Singapore Changi",
        "distance_km": 6300,
        "distance_nm": 3402,
        "typical_duration_hours": 8.5,
        "aircraft_types": ["A380-800", "B787-9"],
        "frequency_per_week": 7,
        "active": True,
        "great_circle_path": [
            {"lat": -33.9, "lon": 151.2},
            {"lat": -20.0, "lon": 140.0},
            {"lat": -5.0, "lon": 125.0},
            {"lat": 1.4, "lon": 103.8},
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
    {
        "route_code": "MEL-LHR",
        "origin_iata": "MEL",
        "origin_name": "Melbourne Tullamarine",
        "destination_iata": "LHR",
        "destination_name": "London Heathrow",
        "distance_km": 16901,
        "distance_nm": 9124,
        "typical_duration_hours": 23.5,
        "aircraft_types": ["A380-800"],
        "frequency_per_week": 7,
        "active": True,
        "great_circle_path": [
            {"lat": -37.8, "lon": 144.9},
            {"lat": -10.0, "lon": 120.0},
            {"lat": 20.0, "lon": 60.0},
            {"lat": 40.0, "lon": 20.0},
            {"lat": 51.5, "lon": -0.5},
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    },
]


def seed():
    db = get_firestore_client()
    print("Seeding aircraft_metadata...")
    for aircraft in SEED_METADATA:
        db.collection("aircraft_metadata").document(aircraft["icao_hex"]).set(aircraft)
        print(f"  ✓ {aircraft['registration']} ({aircraft['icao_hex']})")

    print("Seeding aircraft_live_positions...")
    for pos in SEED_POSITIONS:
        db.collection("aircraft_live_positions").document(pos["icao_hex"]).set(pos)
        print(f"  ✓ {pos['registration']} — {'airborne' if not pos['on_ground'] else 'on ground'}")

    print("Seeding routes...")
    for route in SEED_ROUTES:
        db.collection("routes").document(route["route_code"]).set(route)
        print(f"  ✓ {route['route_code']}")

    print("\nSeed complete. 5 aircraft + 3 routes loaded.")


if __name__ == "__main__":
    seed()
