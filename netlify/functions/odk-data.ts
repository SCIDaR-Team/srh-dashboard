/**
 * GET /api/odk-data
 *
 * Fetches all submissions from the SRH Routine Tool form on ODK Central via
 * its OData endpoint, follows @odata.nextLink pagination, flattens nested
 * `group_*` objects, and caches the result for 15 minutes.
 *
 * Behaves as a no-op (returns []) when ODK_EMAIL / ODK_PASSWORD are not set,
 * so the dashboard renders empty states cleanly until env vars land.
 *
 * Env vars:
 *   ODK_EMAIL     — ODK Central user with read access to project 1239
 *   ODK_PASSWORD  — that user's password
 *   ODK_BASE_URL  — optional override (default: SRH Routine Tool endpoint)
 */

import type { Handler } from '@netlify/functions'
import {
  jsonOk,
  jsonError,
  optionsPreflight,
  createCache,
  flattenDeep,
  normalizeODKRow,
} from './_lib'

const DEFAULT_ODK_URL =
  'https://odk.mine.bz/v1/projects/1239/forms/SRH%20Routine%20tool.svc/Submissions'

const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes
const cache = createCache<Record<string, unknown>[]>(CACHE_TTL_MS)

interface ODataResponse {
  value: Record<string, unknown>[]
  '@odata.nextLink'?: string
}

/** Fetch every page from ODK Central, following @odata.nextLink. */
async function fetchAllSubmissions(authHeader: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = []
  let nextUrl: string | undefined = process.env.ODK_BASE_URL || DEFAULT_ODK_URL

  while (nextUrl) {
    const res = await fetch(nextUrl, { headers: { Authorization: authHeader } })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`ODK ${res.status}: ${text.slice(0, 200)}`)
    }
    const body = (await res.json()) as ODataResponse
    all.push(...(body.value ?? []))
    nextUrl = body['@odata.nextLink']
  }

  return all
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsPreflight()

  // Serve from cache when fresh.
  const cached = cache.get()
  if (cached) return jsonOk(cached, 60)

  // Graceful no-op when credentials aren't set yet.
  const email = process.env.ODK_EMAIL
  const password = process.env.ODK_PASSWORD
  if (!email || !password) return jsonOk([])

  try {
    const auth = 'Basic ' + Buffer.from(`${email}:${password}`).toString('base64')
    const raw = await fetchAllSubmissions(auth)
    // Flatten group_* nesting, then rename a handful of fields to the names
    // the dashboard expects. See `normalizeODKRow` for the mapping.
    const flat = raw.map((row) => normalizeODKRow(flattenDeep(row)))
    cache.set(flat)
    return jsonOk(flat, 60)
  } catch (err) {
    return jsonError(502, err instanceof Error ? err.message : 'ODK fetch failed')
  }
}
