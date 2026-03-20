# Qantas Aircraft Tracker

Real-time visualization of Qantas Boeing 787 and Airbus A380 aircraft on an interactive map,
with live position updates from the OpenSky Network API.

## Architecture

See [QANTAS_AIRCRAFT_TRACKER_ARCHITECTURE.md](./QANTAS_AIRCRAFT_TRACKER_ARCHITECTURE.md) for the full design document.

**Stack:** React 18 + TypeScript + Mapbox GL JS (frontend) · FastAPI + Firestore (backend) · Firebase Emulator (local dev) · Docker Compose

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A [Mapbox access token](https://account.mapbox.com) (free tier — required for map to render)
- (Optional) [OpenSky Network account](https://opensky-network.org) for live aircraft data

## Quick Start

```bash
# 1. Clone and enter the repo
git clone https://github.com/miryann/qftracker.git
cd qftracker

# 2. Configure environment
cp .env.example .env
# Edit .env and add your VITE_MAPBOX_TOKEN (and optionally OPENSKY credentials)

# 3. Start all services
docker-compose up -d

# 4. Load seed data (first time only)
docker-compose exec backend-api python seed_data.py
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5174 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Firestore Emulator UI | http://localhost:4000 |

## Running Without Docker

See [backend/README.md](./backend/README.md) and [frontend/README.md](./frontend/README.md).

## Project Structure

```
qftracker/
├── frontend/          # React 18 + TypeScript + Vite
├── backend/           # Python FastAPI + OpenSky ingestion
├── firestore/         # Security rules and indexes
├── .github/workflows/ # CI pipeline (lint + test)
├── docker-compose.yml
├── firebase.json
└── .env.example
```

## Phase Status

- [x] Phase 1 MVP: Live map, real-time positions, detail panel, filtering, REST API
- [ ] Phase 2: Schedule calendar, flight tables, route visualization
- [ ] Phase 3: Performance optimization, monitoring, production hardening
