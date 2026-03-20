import { create } from 'zustand'
import type { AircraftListItem, Filters } from '../types'

interface AppStore {
  // Data
  aircraft: AircraftListItem[]
  setAircraft: (data: AircraftListItem[]) => void

  // Selection
  selectedIcao: string | null
  setSelectedIcao: (icao: string | null) => void

  // Filters
  filters: Filters
  setFilters: (f: Partial<Filters>) => void
  clearFilters: () => void

  // UI
  showFilterPanel: boolean
  setShowFilterPanel: (show: boolean) => void

  // Derived
  filteredAircraft: () => AircraftListItem[]
}

const DEFAULT_FILTERS: Filters = { type: '', status: '' }

export const useAppStore = create<AppStore>((set, get) => ({
  aircraft: [],
  setAircraft: (data) => set({ aircraft: data }),

  selectedIcao: null,
  setSelectedIcao: (icao) => set({ selectedIcao: icao }),

  filters: DEFAULT_FILTERS,
  setFilters: (f) =>
    set((state) => ({ filters: { ...state.filters, ...f } })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),

  showFilterPanel: false,
  setShowFilterPanel: (show) => set({ showFilterPanel: show }),

  filteredAircraft: () => {
    const { aircraft, filters } = get()
    return aircraft.filter((a) => {
      if (filters.type && a.aircraft_type !== filters.type) return false
      if (filters.status && a.status !== filters.status) return false
      return true
    })
  },
}))
