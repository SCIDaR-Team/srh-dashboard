/**
 * GET /api/commodity-mapping
 *
 * Reads the Commodity Mapping sheet (display name ↔ backend field ↔ category)
 * from a "Publish to web" CSV URL — no Google Cloud API key needed.
 *
 * Returns [] when COMMODITY_CSV_URL is unset; the dashboard falls back to
 * the static COMMODITY_LIST shipped in src/lib/constants.ts.
 *
 * Env vars:
 *   COMMODITY_CSV_URL  — published CSV URL
 */

import type { Handler } from '@netlify/functions'
import {
  jsonOk,
  jsonError,
  optionsPreflight,
  createCache,
  fetchCsv,
  rowsToObjects,
} from './_lib'

const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
const cache = createCache<Record<string, string>[]>(CACHE_TTL_MS)

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsPreflight()

  const cached = cache.get()
  if (cached) return jsonOk(cached, 3600)

  const url = process.env.COMMODITY_CSV_URL
  if (!url) return jsonOk([])

  try {
    const rows = await fetchCsv(url)
    const data = rowsToObjects(rows, 0)
    cache.set(data)
    return jsonOk(data, 3600)
  } catch (err) {
    return jsonError(502, err instanceof Error ? err.message : 'CSV fetch failed')
  }
}
