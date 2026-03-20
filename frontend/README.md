# Frontend — React + TypeScript + Mapbox

React 18 single-page application for the Qantas Aircraft Tracker. Displays live aircraft positions on an interactive Mapbox map, with filtering and per-aircraft detail panels.

## Running with Docker (recommended)

```bash
# From repo root
docker-compose up -d frontend-dev
# Open http://localhost:5174
```

## Running locally (without Docker)

```bash
cd frontend
npm install

# Create a .env.local file
echo "VITE_API_URL=http://localhost:8000" > .env.local
echo "VITE_MAPBOX_TOKEN=your_token_here" >> .env.local

npm run dev
# Open http://localhost:5174
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_MAPBOX_TOKEN` | Mapbox access token (required for map to render) |
| `VITE_API_URL` | Backend API base URL (default: `http://localhost:8000`) |

Get a free Mapbox token at https://account.mapbox.com

## Scripts

```bash
npm run dev          # Start dev server (http://localhost:5174)
npm run build        # Build for production (validates TypeScript)
npm run lint         # ESLint
npm run format       # Prettier (format)
npm run format:check # Prettier (check only)
```

## Component Structure

```
src/
├── App.tsx                    # Root: QueryClientProvider + Router
├── main.tsx                   # Entry point
├── types.ts                   # Shared TypeScript types
├── styles/index.css           # Tailwind base + Mapbox overrides
│
├── api/
│   └── client.ts              # Axios API client (typed fetch functions)
│
├── store/
│   └── index.ts               # Zustand global store (aircraft, filters, selection)
│
├── hooks/
│   └── useAircraft.ts         # TanStack Query hook (10s polling, syncs to store)
│
└── components/
    ├── Header.tsx             # Nav bar with logo and route links
    ├── MapView.tsx            # Mapbox GL JS map container + status overlay
    ├── AircraftMarkers.tsx    # Imperative Mapbox markers (one per aircraft)
    ├── DetailPanel.tsx        # Selected aircraft info (side panel / mobile modal)
    └── FilterPanel.tsx        # Type + status filters with live count
```

## Design System

Colors (from Tailwind config):
- `primary-pink` #FFB6D9 — A380, primary CTAs
- `primary-blue` #A8D8FF — B787, secondary actions
- `primary-orange` #FFD4A8 — A330, warnings
- `neutral-charcoal` #2C3E50 — primary text
- `status-active` #C8E6C9 — airborne indicator

Real-time updates: aircraft positions are polled every 10 seconds via TanStack Query `refetchInterval`. The Zustand store is kept in sync and all components re-render automatically.
