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

// ---------------------------------------------------------------------------
// Field whitelist — keeps the response under Netlify's 6 MB payload cap.
//
// The form has ~463 leaf keys per submission; the dashboard only reads ~100.
// We drop the rest before returning. Add to this list when a new measure
// needs a new field.
// ---------------------------------------------------------------------------
const KEEP_FIELDS: ReadonlySet<string> = new Set([
  // Metadata + derived (normalizeODKRow populates Reporting_month and
  // Reporting_Month_Date from the source fields below).
  '__id', 'State', 'STATE', 'LGA', 'facility_name', 'facility_type',
  'Reporting_month', 'Reporting_Month_Date',
  'submission_date', 'submissionDate',
  'date_of_data_collection',
  'Select_the_month_for_ta_is_being_reported',

  // Enrollment & insurance
  'women_enrolled_month', 'Of_the_newly_enrolle_ommunity_Big_Sisters',
  'new_insured', 'insured_srh_clients',
  'Public_insurance_NHIA', 'Private_insurance_HMO',
  'Community_based_insurance', 'Other_types_of_insurance',

  // Family Planning
  'fp_total', 'fp_adolescent', 'How_many_of_these_wo_s_for_the_first_time',
  'Oral_contraceptives', 'Intra_Uterine_Contraceptive_Device_IUCD',
  'first_time_iucd', 'Injectable_contraceptives_sa',
  'Injectable_contraceptives_fa', 'first_time_injectable',
  'Implants', 'first_time_implant', 'Emergency_contraceptives',

  // PAC
  'How_many_women_and_girls_recei', 'pac_adolescent', 'pac_first_time',
  'pac_mva', 'pac_medical_evac', 'mnh_adolescent_mva',
  'Counselling_and_emotional_support',
  'Administration_of_Ibuprofen_tablets', 'Administration_of_Ibuprofen_ta',

  // GBV
  'gbv_total', 'gbv_adolescent', 'gbv_first',
  'Counselling_and_psyc_upport_for_survivors',
  'HIV_post_exposure_prophylaxis_PEP',
  'HIV_testing_and_screening_following_GBV',
  'gbv_emergency_contraception', 'Administration_of_Metronidazole_tablets',

  // MNH
  'anc1_total', 'anc4_total', 'anc8_total',
  'deliveries_total', 'cesarean_deliveries', 'vaginal_deliveries',
  'partograph_used', 'How_many_vaginal_del_this_reporting_month',
  'Oxytocin_injection', 'Carbetocin_Heat_Stable_Carbetocin',
  'Misoprostol_Mifepristone_tablet', 'Ergometrine',
  'Tranexamic_Acid_TXA', 'Magnesium_Sulfate',
  'maternal_death_total', 'neonatal_death_total',
  'How_many_deaths_were_audited', 'How_many_neonatal_deaths_were_audited',
  'mnh_adolescent_deliveries', 'mnh_adolescent_cs', 'mnh_adolescent_vaginal',

  // ANC by livebirth
  'anc_livebirth_0', 'anc_livebirth_1_4',
  'anc_livebirth_5_7', 'anc_livebirth_8plus',

  // MPCDSR
  'Did_this_facility_co_his_reporting_period',

  // VGF
  'Does_this_facility_provide_VGF', 'vgf_identified', 'vgf_received_service',
  'ANC', 'Delivery_service', 'PNC', 'FP_001', 'VGF_GBV', 'VGF_PAC',

  // Emergency services
  'transport_type', 'ambulance_referrals',
  'Gender_Based_Violence_management_care', 'Post_Abortion_Care',
  'Adolescent_Sexual_an_ealth_ASRH_service',
  'Obstetric_maternal_emergency_cases', 'Newborn_neonatal_emergency_cases',

  // Referrals
  'How_many_of_the_rece_rth_attendants_TBAs', 'ref_other_hf',

  // BHCPF
  'bhcpf_received', 'bhcpf_full_amount', 'bhcpf_on_time',
  'bhcpf_clients_total', 'bhcpf_clients_female', 'bhcpf_clients_adolescent',

  // Staff (routine)
  'How_many_skilled_bir_this_health_facility',
  'Anesthesiologists', 'Obstetricians_Gynecologists',
  'Medical_Officers', 'Nurses_Midwives',

  // Revitalization + equipment receipt
  'Has_this_facility_been_revital',
  'Is_there_documentati_ipt_of_the_equipment',
  'order_fulfilled',

  // Commodity stocking status (19)
  'comm_status_Oxytocin_injection',
  'comm_status_Carbetocin__Heat_Stable_Carbetocin',
  'comm_status_Misoprostol_tablet',
  'comm_status_Magnesium_sulfate_injection',
  'comm_status_Tranexamic_Acid_TXA',
  'comm_status_Injectable_contraceptives',
  'comm_status_Implants',
  'comm_status_Intra_Uterine_Contraceptive_Device_IUCD',
  'comm_status_Oral_contraceptives',
  'comm_status_Ceftriaxone',
  'comm_status_Azithromycin_tablets',
  'comm_status_Ibuprofen_tablets',
  'comm_status_HIV_post_exposure_prophylaxis_PEP',
  'comm_status_Emergency_contraceptive_pills',
  'comm_status_HIV_test_kits',
  'comm_status_Metronidazole_tablets',
  'comm_status_Calibrated_drapes',
  'comm_status_Oxy_Miso_combi_pack',
  'comm_status_Mifepristone_tablet',
])

/** Keep only the fields the dashboard reads; drop everything else. */
function pickFields(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(row)) {
    if (KEEP_FIELDS.has(k)) out[k] = row[k]
  }
  return out
}

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
    // Pipeline:
    //   flatten group_* nesting
    //   → normalizeODKRow (STATE→State, derive Reporting_month/_Date, …)
    //   → pickFields (keep only the ~100 keys the dashboard reads, so the
    //     response stays well under Netlify's 6 MB payload cap — the raw
    //     flattened form is ~13 MB, ~463 keys × 481 submissions).
    const flat = raw.map((row) => pickFields(normalizeODKRow(flattenDeep(row))))
    cache.set(flat)
    return jsonOk(flat, 60)
  } catch (err) {
    return jsonError(502, err instanceof Error ? err.message : 'ODK fetch failed')
  }
}
