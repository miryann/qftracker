import { useQuery } from '@tanstack/react-query'
import { X, Plane, Navigation, Gauge, ArrowUpDown, Clock } from 'lucide-react'
import { fetchAircraftDetail } from '../api/client'
import { useAppStore } from '../store'
import { AIRCRAFT_TYPE_COLOR } from '../types'

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between py-1.5 border-b border-neutral-soft-gray last:border-0">
      <span className="text-xs text-neutral-medium-gray">{label}</span>
      <span className="text-xs font-medium text-neutral-charcoal text-right">{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isAirborne = status === 'airborne'
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        isAirborne
          ? 'bg-status-active text-green-800'
          : 'bg-status-inactive text-neutral-medium-gray'
      }`}
    >
      {isAirborne ? 'Airborne' : 'On Ground'}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  const color = AIRCRAFT_TYPE_COLOR[type] ?? '#E8EEF5'
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-neutral-charcoal"
      style={{ backgroundColor: color }}
    >
      {type}
    </span>
  )
}

export default function DetailPanel() {
  const selectedIcao = useAppStore((s) => s.selectedIcao)
  const setSelectedIcao = useAppStore((s) => s.setSelectedIcao)
  const aircraft = useAppStore((s) => s.aircraft)

  // Get basic info from store (available immediately)
  const basicInfo = aircraft.find((a) => a.icao_hex === selectedIcao)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['aircraft-detail', selectedIcao],
    queryFn: () => fetchAircraftDetail(selectedIcao!),
    enabled: !!selectedIcao,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  if (!selectedIcao) return null

  const pos = detail?.current_position
  const meta = detail?.metadata
  const flight = detail?.flight_info

  const formatAlt = (ft?: number | null) =>
    ft != null ? `${ft.toLocaleString()} ft` : null
  const formatSpeed = (kn?: number | null) =>
    kn != null ? `${kn} kts` : null
  const formatVr = (vr?: number | null) =>
    vr != null ? `${vr > 0 ? '+' : ''}${vr} ft/min` : null
  const formatTs = (ts?: string | null) => {
    if (!ts) return null
    try {
      return new Date(ts).toLocaleTimeString()
    } catch {
      return ts
    }
  }

  return (
    <>
      {/* Mobile: overlay modal */}
      <div className="md:hidden fixed inset-0 z-40 bg-black/30" onClick={() => setSelectedIcao(null)} />
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-xl shadow-card-hover max-h-[70vh] overflow-y-auto">
        <PanelContent
          selectedIcao={selectedIcao}
          basicInfo={basicInfo}
          meta={meta}
          pos={pos}
          flight={flight}
          isLoading={isLoading}
          onClose={() => setSelectedIcao(null)}
          formatAlt={formatAlt}
          formatSpeed={formatSpeed}
          formatVr={formatVr}
          formatTs={formatTs}
        />
      </div>

      {/* Desktop: side panel */}
      <aside className="hidden md:flex flex-col absolute top-0 right-0 h-full w-80 bg-white border-l border-neutral-soft-gray shadow-card-hover z-20 overflow-y-auto">
        <PanelContent
          selectedIcao={selectedIcao}
          basicInfo={basicInfo}
          meta={meta}
          pos={pos}
          flight={flight}
          isLoading={isLoading}
          onClose={() => setSelectedIcao(null)}
          formatAlt={formatAlt}
          formatSpeed={formatSpeed}
          formatVr={formatVr}
          formatTs={formatTs}
        />
      </aside>
    </>
  )
}

interface PanelContentProps {
  selectedIcao: string
  basicInfo?: ReturnType<typeof useAppStore.getState>['aircraft'][0]
  meta?: ReturnType<typeof useQuery<import('../types').AircraftDetail>>['data'] extends infer D
    ? D extends { metadata?: infer M } ? M : never
    : never
  pos?: import('../types').AircraftDetail['current_position']
  flight?: import('../types').AircraftDetail['flight_info']
  isLoading: boolean
  onClose: () => void
  formatAlt: (v?: number | null) => string | null
  formatSpeed: (v?: number | null) => string | null
  formatVr: (v?: number | null) => string | null
  formatTs: (v?: string | null) => string | null
}

function PanelContent({
  selectedIcao,
  basicInfo,
  meta,
  pos,
  flight,
  isLoading,
  onClose,
  formatAlt,
  formatSpeed,
  formatVr,
  formatTs,
}: PanelContentProps) {
  const registration = meta?.registration ?? basicInfo?.registration ?? selectedIcao
  const type = meta?.aircraft_type ?? basicInfo?.aircraft_type ?? 'unknown'
  const status = basicInfo?.status ?? 'unknown'

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-base flex items-center justify-center"
            style={{ backgroundColor: AIRCRAFT_TYPE_COLOR[type] ?? '#E8EEF5' }}
          >
            <Plane size={18} className="text-neutral-charcoal" />
          </div>
          <div>
            <h2 className="font-bold text-base text-neutral-charcoal leading-tight">{registration}</h2>
            <p className="text-xs text-neutral-medium-gray font-mono">{selectedIcao}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-neutral-medium-gray hover:text-neutral-charcoal hover:bg-neutral-soft-gray rounded-base transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <TypeBadge type={type} />
        <StatusBadge status={status} />
      </div>

      {isLoading && (
        <p className="text-xs text-neutral-medium-gray text-center py-4">Loading details…</p>
      )}

      {/* Flight info */}
      {flight?.flight_number && (
        <div className="mb-3 p-3 bg-neutral-off-white rounded-base border border-neutral-soft-gray">
          <div className="flex items-center gap-1.5 mb-1">
            <Plane size={13} className="text-primary-pink" />
            <span className="font-semibold text-sm text-neutral-charcoal">{flight.flight_number}</span>
          </div>
          {flight.origin && flight.destination && (
            <p className="text-xs text-neutral-medium-gray">
              {flight.origin} → {flight.destination}
            </p>
          )}
        </div>
      )}

      {/* Position */}
      {pos && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-neutral-medium-gray uppercase tracking-wide mb-1">
            Position
          </h4>
          <div className="bg-neutral-off-white rounded-base border border-neutral-soft-gray px-3 py-1">
            <InfoRow label="Latitude" value={pos.latitude?.toFixed(4)} />
            <InfoRow label="Longitude" value={pos.longitude?.toFixed(4)} />
            <InfoRow
              label={<span className="flex items-center gap-1"><Navigation size={11} /> Altitude</span> as unknown as string}
              value={formatAlt(pos.altitude_ft)}
            />
            <InfoRow
              label={<span className="flex items-center gap-1"><Gauge size={11} /> Speed</span> as unknown as string}
              value={formatSpeed(pos.ground_speed_knots)}
            />
            <InfoRow label="Heading" value={pos.heading != null ? `${pos.heading}°` : null} />
            <InfoRow
              label={<span className="flex items-center gap-1"><ArrowUpDown size={11} /> Vert. Rate</span> as unknown as string}
              value={formatVr(pos.vertical_rate_ft_min)}
            />
            <InfoRow
              label={<span className="flex items-center gap-1"><Clock size={11} /> Updated</span> as unknown as string}
              value={formatTs(pos.timestamp)}
            />
          </div>
        </div>
      )}

      {/* Metadata */}
      {meta && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-medium-gray uppercase tracking-wide mb-1">
            Aircraft Info
          </h4>
          <div className="bg-neutral-off-white rounded-base border border-neutral-soft-gray px-3 py-1">
            <InfoRow label="Manufacturer" value={meta.manufacturer} />
            <InfoRow label="Serial Number" value={meta.serial_number} />
            <InfoRow label="Delivered" value={meta.delivery_date} />
            <InfoRow
              label="Airframe Hours"
              value={meta.airframe_hours != null ? meta.airframe_hours.toLocaleString() : null}
            />
          </div>
        </div>
      )}
    </div>
  )
}
