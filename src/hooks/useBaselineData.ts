/**
 * useBaselineData — read Facility Baseline rows from the global
 * DataProvider. See useODKData for the rationale.
 */

import { useDataContext } from '../state/DataProvider'

export function useBaselineData() {
  return useDataContext().baseline
}
