import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { useAppStore } from '../store'
import { AIRCRAFT_TYPE_COLOR } from '../types'
import type { AircraftListItem } from '../types'

function createMarkerEl(aircraft: AircraftListItem, isSelected: boolean): HTMLElement {
  const color = AIRCRAFT_TYPE_COLOR[aircraft.aircraft_type] ?? '#E8EEF5'
  const heading = aircraft.current_position?.heading ?? 0

  const el = document.createElement('div')
  el.className = 'aircraft-marker'
  el.style.cssText = `
    width: 36px;
    height: 36px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  `

  const inner = document.createElement('div')
  inner.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${color};
    border: ${isSelected ? '3px solid #FFB6D9' : '2px solid rgba(255,255,255,0.9)'};
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(${heading}deg);
    transition: all 0.3s ease;
  `

  // Plane SVG icon pointing up (north = 0°, rotated by heading)
  inner.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2C3E50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  `

  el.appendChild(inner)
  return el
}

interface MarkersProps {
  map: mapboxgl.Map
}

export default function AircraftMarkers({ map }: MarkersProps) {
  const filteredAircraft = useAppStore((s) => s.filteredAircraft)
  const selectedIcao = useAppStore((s) => s.selectedIcao)
  const setSelectedIcao = useAppStore((s) => s.setSelectedIcao)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map())

  useEffect(() => {
    const aircraft = filteredAircraft()
    const currentIcaos = new Set(aircraft.map((a) => a.icao_hex))

    // Remove markers no longer in filtered set
    for (const [icao, marker] of markersRef.current.entries()) {
      if (!currentIcaos.has(icao)) {
        marker.remove()
        markersRef.current.delete(icao)
        popupsRef.current.get(icao)?.remove()
        popupsRef.current.delete(icao)
      }
    }

    // Add / update markers
    for (const ac of aircraft) {
      const pos = ac.current_position
      if (!pos?.latitude || !pos?.longitude) continue

      const isSelected = ac.icao_hex === selectedIcao

      if (markersRef.current.has(ac.icao_hex)) {
        // Update position and style
        const marker = markersRef.current.get(ac.icao_hex)!
        marker.setLngLat([pos.longitude, pos.latitude])
        const el = marker.getElement()
        const inner = el.querySelector('div') as HTMLDivElement | null
        if (inner) {
          inner.style.transform = `rotate(${pos.heading ?? 0}deg)`
          inner.style.border = isSelected ? '3px solid #FFB6D9' : '2px solid rgba(255,255,255,0.9)'
          inner.style.boxShadow = isSelected
            ? '0 0 0 3px rgba(255,182,217,0.4), 0 2px 6px rgba(0,0,0,0.2)'
            : '0 2px 6px rgba(0,0,0,0.2)'
        }
      } else {
        // Create new marker
        const el = createMarkerEl(ac, isSelected)
        const popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 18,
          className: 'aircraft-popup',
        }).setHTML(
          `<div style="font-size:12px;line-height:1.4">
            <strong>${ac.registration}</strong><br/>
            ${ac.current_flight ? `<span style="color:#7F8C92">${ac.current_flight}</span><br/>` : ''}
            ${ac.aircraft_type}
          </div>`
        )

        el.addEventListener('mouseenter', () => {
          popup.setLngLat([pos.longitude, pos.latitude]).addTo(map)
        })
        el.addEventListener('mouseleave', () => {
          popup.remove()
        })
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          setSelectedIcao(ac.icao_hex)
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([pos.longitude, pos.latitude])
          .addTo(map)

        markersRef.current.set(ac.icao_hex, marker)
        popupsRef.current.set(ac.icao_hex, popup)
      }
    }
  }, [filteredAircraft, selectedIcao, setSelectedIcao, map])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const marker of markersRef.current.values()) marker.remove()
      for (const popup of popupsRef.current.values()) popup.remove()
    }
  }, [])

  return null
}
