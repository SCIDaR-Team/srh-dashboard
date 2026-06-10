/**
 * Global filter state.
 *
 * Mirrors the slicer set on the original Power BI dashboard. Cascading:
 * changing State resets LGA + Facility; changing LGA resets Facility.
 *
 * Pages subscribe via narrow selectors (one slice per hook call) so an
 * unrelated filter change doesn't trigger a re-render.
 */

import { create } from 'zustand'
import type { FilterState } from '../lib/types'

/** Sentinel used everywhere for "no filter applied". */
export const ALL = 'All' as const

const DEFAULT_STATE: FilterState = {
  state: ALL,
  lga: ALL,
  facilityName: ALL,
  facilityType: ALL,
  reportingMonth: ALL,
  searchFacility: '',
}

interface FilterStore extends FilterState {
  /**
   * Set a single filter. Cascading behaviour:
   *   - changing `state` resets `lga` and `facilityName`
   *   - changing `lga` resets `facilityName`
   */
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void

  /** Reset every filter to its default. */
  resetFilters: () => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_STATE,

  setFilter: (key, value) =>
    set((prev) => {
      const next: FilterState = { ...prev, [key]: value }
      if (key === 'state') {
        next.lga = ALL
        next.facilityName = ALL
      } else if (key === 'lga') {
        next.facilityName = ALL
      }
      return next
    }),

  resetFilters: () => set({ ...DEFAULT_STATE }),
}))

// --- Selectors -------------------------------------------------------------

/** Pull every filter value at once. Use only when you genuinely need all. */
export const selectAllFilters = (s: FilterStore): FilterState => ({
  state: s.state,
  lga: s.lga,
  facilityName: s.facilityName,
  facilityType: s.facilityType,
  reportingMonth: s.reportingMonth,
  searchFacility: s.searchFacility,
})
