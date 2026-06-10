/**
 * useGovernanceData — read Governance Google Sheet rows from the global
 * DataProvider. See useODKData for the rationale.
 */

import { useDataContext } from '../state/DataProvider'

export function useGovernanceData() {
  return useDataContext().governance
}
