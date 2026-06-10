/**
 * useFetchJSON — shared fetch state machine for the data hooks.
 *
 * - Calls the endpoint on mount.
 * - Optionally re-fetches on an interval (used by useODKData for live ODK).
 * - Exposes refetch() for manual triggers.
 * - Aborts in-flight requests on unmount / route change.
 *
 * The hook always resolves to a value (`fallback`) so consumers never have
 * to guard against `undefined`. On failure, `error` is set but `data` stays
 * on the most recent successful value (or the fallback for the first load).
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface FetchState<T> {
  data: T
  isLoading: boolean
  error: Error | null
  lastUpdated: Date | null
  refetch: () => void
}

interface Options<T> {
  path: string // e.g. "odk-data"
  fallback: T // value returned before first success
  /** poll interval in ms; omit / set 0 to disable */
  refetchIntervalMs?: number
}

export function useFetchJSON<T>({ path, fallback, refetchIntervalMs = 0 }: Options<T>): FetchState<T> {
  const [data, setData] = useState<T>(fallback)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Latest abort controller so we can cancel on unmount.
  const ctrlRef = useRef<AbortController | null>(null)

  const fetchOnce = useCallback(async () => {
    ctrlRef.current?.abort()
    const ctrl = new AbortController()
    ctrlRef.current = ctrl
    setIsLoading(true)

    try {
      const res = await fetch(`/api/${path}`, { signal: ctrl.signal })
      if (!res.ok) throw new Error(`${path} responded ${res.status}`)
      const body = (await res.json()) as T
      if (ctrl.signal.aborted) return
      setData(body)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      if (ctrl.signal.aborted) return
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      if (!ctrl.signal.aborted) setIsLoading(false)
    }
  }, [path])

  useEffect(() => {
    void fetchOnce()
    if (refetchIntervalMs > 0) {
      const id = setInterval(() => void fetchOnce(), refetchIntervalMs)
      return () => {
        clearInterval(id)
        ctrlRef.current?.abort()
      }
    }
    return () => ctrlRef.current?.abort()
  }, [fetchOnce, refetchIntervalMs])

  return { data, isLoading, error, lastUpdated, refetch: fetchOnce }
}
