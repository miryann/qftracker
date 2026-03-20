# Backend — FastAPI + OpenSky Ingestion

Python 3.11 FastAPI service providing REST API endpoints and real-time data ingestion from the OpenSky Network.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check (Firestore connectivity) |
| GET | `/api/v1/aircraft` | List all aircraft with current positions |
| GET | `/api/v1/aircraft/{icao_hex}` | Aircraft detail (metadata + position + flight info) |
| GET | `/api/v1/aircraft/{icao_hex}/trail` | Position trail (last 24h, sub-collection) |
| GET | `/api/v1/routes` | Qantas widebody routes |

Interactive docs: http://localhost:8000/docs

## Running with Docker (recommended)

```bash
# From repo root
docker-compose up -d backend-api
```

## Running locally (without Docker)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Point at Firestore emulator
export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIRESTORE_PROJECT_ID=qantas-tracker-dev
export ENVIRONMENT=development

uvicorn main:app --reload --port 8000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIRESTORE_EMULATOR_HOST` | (unset) | Routes Firestore to emulator when set |
| `FIRESTORE_PROJECT_ID` | `qantas-tracker-dev` | GCP project ID |
| `OPENSKY_USERNAME` | (empty) | OpenSky credentials (optional) |
| `OPENSKY_PASSWORD` | (empty) | OpenSky credentials (optional) |
| `ENVIRONMENT` | `production` | Set to `development` to enable APScheduler ingestion |
| `LOG_LEVEL` | `INFO` | Python logging level |

## Seed Data

Load example aircraft into the Firestore emulator:

```bash
# Via Docker
docker-compose exec backend-api python seed_data.py

# Locally
FIRESTORE_EMULATOR_HOST=localhost:8080 python seed_data.py
```

## curl Examples

```bash
# Health check
curl http://localhost:8000/api/v1/health

# All aircraft
curl http://localhost:8000/api/v1/aircraft

# Filter by type and status
curl "http://localhost:8000/api/v1/aircraft?type=B787-9&active=true"

# Aircraft detail
curl http://localhost:8000/api/v1/aircraft/7CF8A7

# Trail (last 24h)
curl http://localhost:8000/api/v1/aircraft/7CF8A7/trail

# Routes
curl http://localhost:8000/api/v1/routes
```

## Code Structure

```
backend/
├── main.py              # FastAPI app, all endpoints, APScheduler setup
├── models.py            # Pydantic v2 models (mirrors Firestore schema)
├── firestore_client.py  # Firestore client (emulator-aware)
├── opensky.py           # OpenSky Network API integration
├── seed_data.py         # Load test data into emulator
├── requirements.txt
└── Dockerfile.dev
```
