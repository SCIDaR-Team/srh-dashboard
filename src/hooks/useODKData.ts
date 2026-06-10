/**
 * useODKData — read ODK Central submissions from the global DataProvider.
 *
 * The fetch itself happens once in DataProvider; this hook just exposes
 * the shared FetchState so any number of components / pages can subscribe
 * without triggering extra network calls.
 */

import { useDataContext } from '../state/DataProvider'

export function useODKData() {
  return useDataContext().odk
}
