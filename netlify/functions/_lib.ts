/**
 * Shared helpers for the four serverless functions.
 *
 * Files prefixed with `_` are not deployed as functions by Netlify, so this
 * module is safe for internal-only code.
 */

// ---------------------------------------------------------------------------
// HTTP response helpers
// ---------------------------------------------------------------------------

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
} as const

export const jsonOk = (body: unknown, cacheSeconds = 0) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control':
      cacheSeconds > 0 ? `public, max-age=${cacheSeconds}` : 'no-store',
    ...CORS_HEADERS,
  },
  body: JSON.stringify(body),
})

export const jsonError = (status: number, message: string) => ({
  statusCode: status,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  body: JSON.stringify({ error: message }),
})

export const optionsPreflight = () => ({
  statusCode: 204,
  headers: CORS_HEADERS,
  body: '',
})

// ---------------------------------------------------------------------------
// In-memory cache (persists across warm invocations on Netlify Functions)
// ---------------------------------------------------------------------------

/** Build a TTL cache singleton scoped to one function module. */
export function createCache<T>(ttlMs: number) {
  let entry: { value: T; expiresAt: number } | null = null
  return {
    get(): T | null {
      if (entry && entry.expiresAt > Date.now()) return entry.value
      return null
    },
    set(value: T) {
      entry = { value, expiresAt: Date.now() + ttlMs }
    },
    clear() {
      entry = null
    },
  }
}

// ---------------------------------------------------------------------------
// Object flattening (for ODK OData group_* objects)
// ---------------------------------------------------------------------------

/**
 * Recursively flatten a nested object into a single-level record, keeping
 * leaf property names verbatim (no prefixing). ODK Central OData responses
 * group repeating sections under `group_<hash>` objects; this util pulls the
 * leaves up so downstream code reads `row.fp_total` directly.
 *
 * Last-write-wins on key collisions, which is intentional — ODK guarantees
 * leaf names are unique within a form definition.
 */
export function flattenDeep(
  source: Record<string, unknown>,
  out: Record<string, unknown> = {},
): Record<string, unknown> {
  for (const [key, value] of Object.entries(source)) {
    if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      // Don't descend into Date-like / Blob-like prototypes.
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      flattenDeep(value as Record<string, unknown>, out)
    } else {
      out[key] = value
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// ODK field-name normalization
// ---------------------------------------------------------------------------
//
// The real SRH Routine Tool form uses a few field names that differ from
// what the dashboard frontend / measures library expects. Rather than
// updating every page + type in the FE, we rename here (single source of
// truth) so the frontend keeps reading the spec'd names.
//
// Verified deviations (via test-odk.mjs against odk.mine.bz, June 2026):
//   ODK actual                                       → dashboard expects
//   STATE                                            → State
//   submissionDate                                   → submission_date
//   Select_the_month_for_ta_is_being_reported (str)  → Reporting_month     ("May")
//                                                    → Reporting_Month_Date (ISO YYYY-MM-01)
//
// If new deviations turn up later, add them here and the rest of the app
// will pick them up with no further changes.

const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

/** "may" → "May"; unknown / missing → empty string. */
function titleCaseMonth(value: unknown): string {
  if (typeof value !== 'string' || !value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

/** "may" + collection date 2026-06-09 → "2026-05-01". */
function buildReportingMonthDate(
  monthName: unknown,
  collectionDate: unknown,
): string {
  if (typeof monthName !== 'string') return ''
  const monthIdx = MONTH_NAMES.indexOf(monthName.toLowerCase())
  if (monthIdx === -1) return ''

  let year: number
  if (typeof collectionDate === 'string' && /^\d{4}-/.test(collectionDate)) {
    year = Number(collectionDate.slice(0, 4))
  } else {
    year = new Date().getFullYear()
  }
  const mm = String(monthIdx + 1).padStart(2, '0')
  return `${year}-${mm}-01`
}

/**
 * Apply the renames in place on a flattened ODK row, then return it. The
 * original keys are kept too (so anything custom you query keeps working).
 */
export function normalizeODKRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  // STATE → State
  if (row.State === undefined && row.STATE !== undefined) {
    row.State = row.STATE
  }

  // submissionDate → submission_date
  if (row.submission_date === undefined && row.submissionDate !== undefined) {
    row.submission_date = row.submissionDate
  }

  // Select_the_month_for_ta_is_being_reported → Reporting_month + Reporting_Month_Date
  const selectedMonth = row.Select_the_month_for_ta_is_being_reported
  if (row.Reporting_month === undefined) {
    row.Reporting_month = titleCaseMonth(selectedMonth)
  }
  if (row.Reporting_Month_Date === undefined) {
    row.Reporting_Month_Date = buildReportingMonthDate(
      selectedMonth,
      row.date_of_data_collection,
    )
  }

  return row
}

// ---------------------------------------------------------------------------
// Google Sheets "Publish to web" CSV helpers
// ---------------------------------------------------------------------------
//
// We use the public CSV URL approach (File → Share → Publish to web → CSV)
// instead of the Sheets API, so no Google Cloud API key or service account
// is needed. The sheet owner just publishes the tab once and we fetch its
// CSV like any other URL.

/**
 * Minimal RFC 4180 CSV parser. Handles:
 *   - quoted fields  ("hello, world")
 *   - escaped quotes ("" inside a quoted field → ")
 *   - CRLF and LF line endings
 *   - trailing empty fields
 *
 * Good enough for Google's "Publish to web" CSV output, which is well-formed.
 * Returns an array of rows; each row is an array of cell strings.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        // Escaped quote ("") → single quote inside the field.
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
      continue
    }

    if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      // swallow — next char will be \n in CRLF, or end of line in CR-only
      if (text[i + 1] === '\n') i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }

  // Flush the final field/row if the file didn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
}

/** Fetch a published-to-web CSV URL and parse it. Throws on non-2xx. */
export async function fetchCsv(url: string): Promise<string[][]> {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`CSV fetch ${res.status}: ${text.slice(0, 200)}`)
  }
  return parseCsv(await res.text())
}

/**
 * Generic header normaliser — converts a free-text sheet header into the
 * snake_case identifier the dashboard expects. Handles:
 *   - spaces, slashes, ampersands → "_"
 *   - parentheses, brackets       → stripped
 *   - trailing/leading whitespace → trimmed
 *   - repeated/leading/trailing underscores → collapsed
 *
 * Examples:
 *   "TWG inaugurated"            → "TWG_inaugurated"
 *   "Reliable power supply"      → "Reliable_power_supply"
 *   "Vacuum extractor / forceps" → "Vacuum_extractor_forceps"
 *   "Operating theater (CEmONC only)" → "Operating_theater_CEmONC_only"
 */
export function normalizeHeader(h: string): string {
  return h
    .trim()
    .replace(/[\s/&]+/g, '_')
    .replace(/[()[\]]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Convert raw sheet rows into objects keyed by the header row.
 *
 * `headerRowIndex` defaults to 0; pass 1 to use the second row (e.g. the
 * Facility Baseline sheet has technical headers on row 0, display names
 * on row 1).
 *
 * Each header is normalised via `normalizeHeader()`, then run through
 * `aliasMap` — pass full sheet header strings (or their normalised form)
 * as keys to override the result. This lets us map verbose labels like
 * `"Community Health Officers (CHO)"` directly to the short spec name
 * (`"CHO"`) without touching the rest of the codebase.
 */
export function rowsToObjects<T extends Record<string, string>>(
  rows: string[][],
  headerRowIndex = 0,
  aliasMap: Record<string, string> = {},
): T[] {
  if (rows.length <= headerRowIndex) return []
  const headers = rows[headerRowIndex].map((raw) => {
    const trimmed = raw.trim()
    if (aliasMap[trimmed]) return aliasMap[trimmed]
    const normalized = normalizeHeader(raw)
    return aliasMap[normalized] ?? normalized
  })
  return rows.slice(headerRowIndex + 1).map((row) => {
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => {
      if (h) obj[h] = row[i] ?? ''
    })
    return obj as T
  })
}
