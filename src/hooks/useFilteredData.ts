/**
 * useFilteredData — apply the global FilterState to a raw ODK array.
 *
 * Beyond filtering, the hook also computes the dropdown source lists so a
 * FilterPanel can show only options that exist in the data (cascading:
 * LGAs limited to the chosen State, facilities limited to the chosen LGA).
 *
 * Memoised on the input array reference and the filter values, so updates
 * cost O(N) only when something actually changes.
 */

import { useMemo } from 'react'
import { useFilterStore, ALL } from '../store/filterStore'
import { FACILITY_TYPES } from '../lib/constants'
import type { ODKSubmission } from '../lib/types'

export interface FilteredDataResult {
  /** Records that match every active filter. */
  data: ODKSubmission[]
  /** Distinct sorted values, cascading top-down. */
  availableStates: string[]
  availableLGAs: string[]
  availableFacilities: string[]
  availableFacilityTypes: string[]
  availableMonths: string[]
}

const matchAll = (selected: string, value: string): boolean =>
  selected === ALL || selected === value

const distinctSorted = (xs: string[]): string[] =>
  [...new Set(xs.filter(Boolean))].sort((a, b) => a.localeCompare(b))

export function useFilteredData(raw: ODKSubmission[]): FilteredDataResult {
  const state = useFilterStore((s) => s.state)
  const lga = useFilterStore((s) => s.lga)
  const facilityName = useFilterStore((s) => s.facilityName)
  const facilityType = useFilterStore((s) => s.facilityType)
  const reportingMonth = useFilterStore((s) => s.reportingMonth)
  const searchFacility = useFilterStore((s) => s.searchFacility)

  return useMemo(() => {
    const search = searchFacility.trim().toLowerCase()

    // Available States are computed against the full dataset (no upstream
    // filter to cascade from), so the State dropdown shows everything.
    const availableStates = distinctSorted(raw.map((r) => r.State))

    // LGAs cascade from State.
    const stateScope = state === ALL ? raw : raw.filter((r) => r.State === state)
    const availableLGAs = distinctSorted(stateScope.map((r) => r.LGA))

    // Facilities cascade from LGA.
    const lgaScope = lga === ALL ? stateScope : stateScope.filter((r) => r.LGA === lga)
    const availableFacilities = distinctSorted(lgaScope.map((r) => r.facility_name))

    // Facility types and reporting months don't cascade — they're always
    // computed against the whole dataset. Types are whitelisted to the two
    // canonical values so a stray ODK `facility_type` never surfaces in the
    // dropdown.
    const facilityTypeWhitelist = new Set<string>(FACILITY_TYPES)
    const availableFacilityTypes = distinctSorted(
      raw.map((r) => r.facility_type),
    ).filter((t) => facilityTypeWhitelist.has(t))
    const availableMonths = distinctSorted(raw.map((r) => r.Reporting_month))

    const data = raw.filter(
      (r) =>
        matchAll(state, r.State) &&
        matchAll(lga, r.LGA) &&
        matchAll(facilityName, r.facility_name) &&
        matchAll(facilityType, r.facility_type) &&
        matchAll(reportingMonth, r.Reporting_month) &&
        (search === '' || r.facility_name?.toLowerCase().includes(search)),
    )

    return {
      data,
      availableStates,
      availableLGAs,
      availableFacilities,
      availableFacilityTypes,
      availableMonths,
    }
  }, [raw, state, lga, facilityName, facilityType, reportingMonth, searchFacility])
}
