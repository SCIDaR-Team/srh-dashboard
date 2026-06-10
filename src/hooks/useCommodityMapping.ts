/**
 * useCommodityMapping — read the Commodity Mapping rows from the global
 * DataProvider, falling back to the static COMMODITY_LIST when the
 * backend returns nothing (env vars unset, or empty sheet).
 */

import { useMemo } from 'react'
import { useDataContext } from '../state/DataProvider'
import { COMMODITY_LIST } from '../lib/constants'

export function useCommodityMapping() {
  const result = useDataContext().commodityMapping

  const data = useMemo(
    () => (result.data.length > 0 ? result.data : COMMODITY_LIST),
    [result.data],
  )

  return { ...result, data }
}
