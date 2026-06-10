/**
 * GET /api/governance-data
 *
 * Reads the Governance sheet (TWG / policy adoption flags per state) from
 * a "Publish to web" CSV URL — no Google Cloud API key needed.
 *
 * Returns [] when GOVERNANCE_CSV_URL is unset.
 *
 * Env vars:
 *   GOVERNANCE_CSV_URL  — published CSV URL (File → Share → Publish to web
 *                         → Comma-separated values)
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

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const cache = createCache<Record<string, string>[]>(CACHE_TTL_MS)

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsPreflight()

  const cached = cache.get()
  if (cached) return jsonOk(cached, 300)

  const url = process.env.GOVERNANCE_CSV_URL
  if (!url) return jsonOk([])

  try {
    const rows = await fetchCsv(url)
    // Row 0 = headers, row 1+ = data.
    const data = rowsToObjects(rows, 0)
    cache.set(data)
    return jsonOk(data, 300)
  } catch (err) {
    return jsonError(502, err instanceof Error ? err.message : 'CSV fetch failed')
  }
}
