import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { useAircraftList } from '../hooks/useAircraft'
import { useAppStore } from '../store'
import AircraftMarkers from './AircraftMarkers'
import DetailPanel from './DetailPanel'
import FilterPanel from './FilterPanel'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  const setSelectedIcao = useAppStore((s) => s.setSelectedIcao)

  const { isLoading, isError, isFetching, dataUpdatedAt } = useAircraftList()

  // Initialise Mapbox
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    if (!MAPBOX_TOKEN) {
      setMapError('Mapbox token missing. Set VITE_MAPBOX_TOKEN in your .env file.')
      return
    }

    mapboxgl.accessToken = MAPBOX_TOKEN

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [134, -27], // Centre of Australia
        zoom: 4,
        minZoom: 2,
        maxZoom: 14,
      })

      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
      map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

      map.on('load', () => setMapReady(true))
      map.on('error', (e) => console.error('Mapbox error:', e))

      // Click on empty map → deselect
      map.on('click', () => setSelectedIcao(null))

      mapRef.current = map
    } catch (err) {
      setMapError('Failed to initialise map. Check your Mapbox token.')
      console.error(err)
    }

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [setSelectedIcao])

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString()
    : null

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapContainerRef} className="absolute inset-0" />

      {/* Token missing error */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-off-white z-10">
          <div className="bg-white rounded-md shadow-card border border-status-error p-6 max-w-sm mx-4 text-center">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-neutral-charcoal mb-2">Map unavailable</h3>
            <p className="text-sm text-neutral-medium-gray">{mapError}</p>
          </div>
        </div>
      )}

      {/* Top-left controls overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
        {/* Filter panel toggle */}
        <div className="relative">
          <FilterPanel />
        </div>
      </div>

      {/* Top-right status bar */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {isLoading && (
          <div className="bg-white rounded-base shadow-card px-3 py-1.5 text-xs text-neutral-medium-gray flex items-center gap-1.5">
            <RefreshCw size={12} className="animate-spin" />
            Loading…
          </div>
        )}
        {isError && (
          <div className="bg-status-error rounded-base shadow-card px-3 py-1.5 text-xs text-red-800 flex items-center gap-1.5">
            <AlertCircle size={12} />
            API unavailable
          </div>
        )}
        {!isLoading && !isError && lastUpdated && (
          <div className="bg-white rounded-base shadow-card px-3 py-1.5 text-xs text-neutral-medium-gray flex items-center gap-1.5">
            {isFetching && <RefreshCw size={11} className="animate-spin text-primary-blue" />}
            Updated {lastUpdated}
          </div>
        )}
      </div>

      {/* Aircraft markers — only rendered once map is ready */}
      {mapReady && mapRef.current && <AircraftMarkers map={mapRef.current} />}

      {/* Detail panel */}
      <DetailPanel />
    </div>
  )
}
