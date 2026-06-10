/**
 * GET /api/baseline-data
 *
 * Reads the Facility Baseline Assessment sheet (static infrastructure /
 * equipment / HR per facility) from a "Publish to web" CSV URL — no
 * Google Cloud API key needed.
 *
 * Sheet layout (per spec):
 *   row 0  — technical column headers (ignored)
 *   row 1  — display names (used as keys)
 *   row 2+ — data rows
 *
 * Set BASELINE_HEADER_ROW=0 if your published sheet has the human-friendly
 * names on row 0 (no technical header row).
 *
 * Returns [] when BASELINE_CSV_URL is unset.
 *
 * Env vars:
 *   BASELINE_CSV_URL    — published CSV URL
 *   BASELINE_HEADER_ROW — optional; default "1"
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

// Verbose sheet labels → short keys the dashboard's
// FacilityBaselineRow type expects. Anything not listed falls through
// the generic header normaliser (spaces / slashes / parens → underscore).
const HEADER_ALIASES: Record<string, string> = {
  'Blood bank/Transfusion services (CEmONC only)': 'Blood_bank_CEmONC_only',
  'Sterile delivery kits (clamps, scissors, cord clamps)': 'Sterile_delivery_kit',
  'Manual Vacuum Aspiration (MVA) kits': 'MVA_kits',
  'IUD insertion/removal tray with sterile instruments': 'IUD_insertion_removal_tray',
  'Blood pressure apparatus & stethoscope': 'BP_apparatus_stethoscope',
  'Community Health Officers (CHO)': 'CHO',
  'Senior Community Health Extension Workers (SCHEW)': 'SCHEW',
  'Junior Community Health Extension Workers (JCHEW)': 'JCHEW',
  'Medical Laboratory Scientist / Technician': 'Lab_Scientists',
}

// Infrastructure + equipment fields use the same controlled vocabulary in
// the ODK form. Map those source values to the dashboard's tri-state
// (`yes` / `yes__occasionally` / `no`).
//
//   available_and_functional       → yes              "service-ready"
//   available_but_non_functional   → yes__occasionally "present but broken"
//   not_available / n_a / (empty)  → no               "no service capability"
//
// The middle bucket is kept so the Power/Water tri-state visual can show
// the "broken but present" cohort distinctly. The HBar "Infrastructure
// availability" only counts strict `yes` (see baselineYesCount in
// src/lib/measures.ts).
const VALUE_MAP: Record<string, string> = {
  available_and_functional: 'yes',
  available_but_non_functional: 'yes__occasionally',
  not_available: 'no',
  n_a: 'no',
  '': 'no',
}

function normalizeValues(row: Record<string, string>): Record<string, string> {
  for (const k of Object.keys(row)) {
    const v = (row[k] ?? '').toString().trim().toLowerCase()
    if (v in VALUE_MAP) row[k] = VALUE_MAP[v]
  }
  return row
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return optionsPreflight()

  const cached = cache.get()
  if (cached) return jsonOk(cached, 3600)

  const url = process.env.BASELINE_CSV_URL
  if (!url) return jsonOk([])

  const headerRowIdx = Number(process.env.BASELINE_HEADER_ROW ?? '1')

  try {
    const rows = await fetchCsv(url)
    const data = rowsToObjects(
      rows,
      Number.isFinite(headerRowIdx) ? headerRowIdx : 1,
      HEADER_ALIASES,
    ).map(normalizeValues)
    cache.set(data)
    return jsonOk(data, 3600)
  } catch (err) {
    return jsonError(502, err instanceof Error ? err.message : 'CSV fetch failed')
  }
}
