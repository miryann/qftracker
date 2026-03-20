import { Filter, X } from 'lucide-react'
import { useAppStore } from '../store'
import { AIRCRAFT_TYPES } from '../types'

export default function FilterPanel() {
  const showFilterPanel = useAppStore((s) => s.showFilterPanel)
  const setShowFilterPanel = useAppStore((s) => s.setShowFilterPanel)
  const filters = useAppStore((s) => s.filters)
  const setFilters = useAppStore((s) => s.setFilters)
  const clearFilters = useAppStore((s) => s.clearFilters)
  const filteredAircraft = useAppStore((s) => s.filteredAircraft)
  const aircraft = useAppStore((s) => s.aircraft)

  const filteredCount = filteredAircraft().length
  const hasActiveFilters = filters.type !== '' || filters.status !== ''

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowFilterPanel(!showFilterPanel)}
        className={`flex items-center gap-2 px-3 py-2 rounded-base text-sm font-medium shadow-card transition-all ${
          hasActiveFilters
            ? 'bg-primary-pink text-white'
            : 'bg-white text-neutral-charcoal hover:bg-neutral-soft-gray'
        }`}
        title="Toggle filters"
      >
        <Filter size={15} />
        <span>Filter</span>
        {hasActiveFilters && (
          <span className="bg-white text-primary-pink rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {filteredCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {showFilterPanel && (
        <div className="absolute top-14 left-0 z-30 bg-white rounded-md shadow-card-hover border border-neutral-soft-gray p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-neutral-charcoal">
              Filters
              <span className="ml-2 text-neutral-medium-gray font-normal">
                {filteredCount}/{aircraft.length}
              </span>
            </h3>
            <button
              onClick={() => setShowFilterPanel(false)}
              className="text-neutral-medium-gray hover:text-neutral-charcoal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Aircraft type */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-neutral-medium-gray mb-1 uppercase tracking-wide">
              Aircraft Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ type: e.target.value })}
              className="w-full border border-neutral-soft-gray rounded-base px-3 py-2 text-sm text-neutral-charcoal bg-white focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
            >
              <option value="">All Types</option>
              {AIRCRAFT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-neutral-medium-gray mb-1 uppercase tracking-wide">
              Status
            </label>
            <div className="flex gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'airborne', label: 'Airborne' },
                { value: 'on_ground', label: 'On Ground' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilters({ status: value })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-base border transition-all ${
                    filters.status === value
                      ? 'bg-primary-blue border-primary-blue text-neutral-charcoal'
                      : 'border-neutral-soft-gray text-neutral-medium-gray hover:border-primary-blue'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-1.5 text-xs font-medium text-neutral-medium-gray hover:text-neutral-charcoal underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </>
  )
}
