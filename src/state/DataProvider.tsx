/**
 * DataProvider — fetches each data source once and exposes the results via
 * React context.
 *
 * Why: before this, every page that called useODKData() triggered its own
 * fetch + state machine. Multiple cards across one page caused N redundant
 * requests on mount. Now the four hooks read from a single provider.
 *
 * The provider is intentionally thin — no caching of derived measures
 * here, since pages still want fresh recomputation when filters change.
 */

import { createContext, useContext, type ReactNode } from 'react'
import { useFetchJSON, type FetchState } from '../hooks/useFetchJSON'
import { COMMODITY_LIST } from '../lib/constants'
import type {
  CommodityMapping,
  FacilityBaselineRow,
  GovernanceRow,
  ODKSubmission,
} from '../lib/types'

const FIFTEEN_MIN = 15 * 60 * 1000

interface DataContextValue {
  odk: FetchState<ODKSubmission[]>
  governance: FetchState<GovernanceRow[]>
  baseline: FetchState<FacilityBaselineRow[]>
  commodityMapping: FetchState<CommodityMapping[]>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const odk = useFetchJSON<ODKSubmission[]>({
    path: 'odk-data',
    fallback: [],
    refetchIntervalMs: FIFTEEN_MIN,
  })
  const governance = useFetchJSON<GovernanceRow[]>({
    path: 'governance-data',
    fallback: [],
  })
  const baseline = useFetchJSON<FacilityBaselineRow[]>({
    path: 'baseline-data',
    fallback: [],
  })
  const commodityMapping = useFetchJSON<CommodityMapping[]>({
    path: 'commodity-mapping',
    fallback: COMMODITY_LIST,
  })

  return (
    <DataContext.Provider value={{ odk, governance, baseline, commodityMapping }}>
      {children}
    </DataContext.Provider>
  )
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) {
    throw new Error('useDataContext must be called inside <DataProvider>')
  }
  return ctx
}
