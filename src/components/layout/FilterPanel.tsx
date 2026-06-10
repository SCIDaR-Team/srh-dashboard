/**
 * FilterPanel — left-side filter sidebar.
 *
 * Light-chrome design (Round 4): white surface with a slate-200 right rail,
 * ink labels, primary-green focus accents on the dropdowns. The brand-green
 * sidebar slab of v1 has been retired so green can be reserved for the
 * brand mark and the active nav state.
 *
 * Drives the global Zustand filterStore. Cascading: changing State resets
 * LGA + Facility; changing LGA resets Facility. Dropdown options are sourced
 * from `useFilteredData` against the live ODK dataset, falling back to the
 * static STATE_LIST when no data is loaded yet.
 *
 * On screens < 1024px the panel is collapsible via a hamburger button shown
 * in TopNav; the panel itself slides in as a drawer with a backdrop.
 */

import { useState, useEffect, useMemo } from 'react'
import { CalendarRange, MapPin, Building2, Search, RotateCcw, X } from 'lucide-react'
import { useFilterStore, ALL } from '../../store/filterStore'
import { STATE_LIST } from '../../lib/constants'
import { useODKData } from '../../hooks/useODKData'
import { useFilteredData } from '../../hooks/useFilteredData'

/** Last 12 ISO months (newest first). Calendar facts — independent of data,
 *  so the Reporting-month dropdown is always usable even pre-ODK. */
function lastTwelveMonths(): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

interface FilterPanelProps {
  /** When true (mobile drawer mode), call onDismiss on backdrop click. */
  isDrawer?: boolean
  onDismiss?: () => void
}

const SELECT_CLASS =
  'w-full min-w-0 rounded-md border border-slate-200 bg-card px-2 py-1.5 text-[13px] text-ink transition-colors hover:border-slate-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

const LABEL_CLASS =
  'flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-label text-muted'

export function FilterPanel({
  isDrawer = false,
  onDismiss,
}: FilterPanelProps) {
  const state = useFilterStore((s) => s.state)
  const lga = useFilterStore((s) => s.lga)
  const facilityName = useFilterStore((s) => s.facilityName)
  const facilityType = useFilterStore((s) => s.facilityType)
  const reportingMonth = useFilterStore((s) => s.reportingMonth)
  const searchFacility = useFilterStore((s) => s.searchFacility)
  const setFilter = useFilterStore((s) => s.setFilter)
  const resetFilters = useFilterStore((s) => s.resetFilters)

  // Live ODK dataset → cascading dropdown sources.
  const odk = useODKData()
  const { availableStates, availableLGAs, availableFacilities, availableFacilityTypes, availableMonths } =
    useFilteredData(odk.data)

  // Fall backs when no ODK data is loaded yet.
  const states = availableStates.length > 0 ? availableStates : [...STATE_LIST]
  const types = availableFacilityTypes.length > 0 ? availableFacilityTypes : ['BEmONC', 'CEmONC']
  const fallbackMonths = useMemo(() => lastTwelveMonths(), [])
  const months = availableMonths.length > 0 ? availableMonths : fallbackMonths

  const lgaEmptyHint = availableLGAs.length === 0
  const facilityEmptyHint = availableFacilities.length === 0

  // Local debounced echo for the search input.
  const [search, setSearch] = useState(searchFacility)
  useEffect(() => setSearch(searchFacility), [searchFacility])
  useEffect(() => {
    const id = setTimeout(() => {
      if (search !== searchFacility) setFilter('searchFacility', search)
    }, 250)
    return () => clearTimeout(id)
  }, [search, searchFacility, setFilter])

  // Count of active (non-default) filters — surfaced in the header so the
  // user can see at a glance how much scope they've narrowed.
  const activeCount = [
    state !== ALL,
    lga !== ALL,
    facilityName !== ALL,
    facilityType !== ALL,
    reportingMonth !== ALL,
    searchFacility.trim() !== '',
  ].filter(Boolean).length

  return (
    <aside
      className={
        isDrawer
          ? 'srh-fade-in fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-card shadow-card-hover'
          : 'flex h-full w-52 shrink-0 flex-col border-r border-slate-200 bg-card'
      }
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold leading-tight text-ink">
            Filters
          </p>
          <p className="truncate text-[10px] leading-tight text-muted">
            Refine the dashboard scope
          </p>
        </div>
        {activeCount > 0 && !isDrawer && (
          <span
            className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-white"
            aria-label={`${activeCount} active filter${activeCount === 1 ? '' : 's'}`}
          >
            {activeCount}
          </span>
        )}
        {isDrawer && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md p-1 text-muted hover:bg-slate-100 hover:text-ink"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        )}
      </header>

      <div className="srh-scroll-hidden min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
        {/* Search */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <Search size={13} /> Search facility
          </label>
          <input
            type="text"
            placeholder="Type a facility name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${SELECT_CLASS} placeholder:text-slate-400`}
          />
        </div>

        {/* State */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <MapPin size={13} /> State
          </label>
          <select
            className={SELECT_CLASS}
            value={state}
            onChange={(e) => setFilter('state', e.target.value)}
          >
            <option value={ALL}>All states</option>
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* LGA */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <MapPin size={13} /> LGA
          </label>
          <select
            className={SELECT_CLASS}
            value={lga}
            onChange={(e) => setFilter('lga', e.target.value)}
          >
            <option value={ALL}>All LGAs</option>
            {lgaEmptyHint && (
              <option disabled>— awaiting ODK data —</option>
            )}
            {availableLGAs.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        {/* Facility name */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <Building2 size={13} /> Facility
          </label>
          <select
            className={SELECT_CLASS}
            value={facilityName}
            onChange={(e) => setFilter('facilityName', e.target.value)}
          >
            <option value={ALL}>All facilities</option>
            {facilityEmptyHint && (
              <option disabled>— awaiting ODK data —</option>
            )}
            {availableFacilities.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Facility type */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <Building2 size={13} /> Facility type
          </label>
          <select
            className={SELECT_CLASS}
            value={facilityType}
            onChange={(e) => setFilter('facilityType', e.target.value)}
          >
            <option value={ALL}>All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Reporting month */}
        <div className="space-y-1">
          <label className={LABEL_CLASS}>
            <CalendarRange size={13} /> Reporting month
          </label>
          <select
            className={SELECT_CLASS}
            value={reportingMonth}
            onChange={(e) => setFilter('reportingMonth', e.target.value)}
          >
            <option value={ALL}>All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 px-4 py-2.5">
        <button
          type="button"
          onClick={() => {
            resetFilters()
            setSearch('')
          }}
          disabled={activeCount === 0}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-card px-3 py-1.5 text-[13px] font-semibold text-ink transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card"
        >
          <RotateCcw size={14} /> Reset all
        </button>
      </footer>
    </aside>
  )
}
