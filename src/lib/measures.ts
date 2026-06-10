/**
 * SRH Dashboard — Measures Library
 *
 * JavaScript translation of the 290 DAX measures from the original Power BI
 * dashboard. Every function here is pure: input arrays go in, numbers /
 * labels / chart-ready arrays come out.
 *
 * Organisation:
 *   0.  Helpers (divide, sumField, count*, format*, computeMoM)
 *   1.  Coverage
 *   2.  Maternal & Newborn Health (MNH)
 *   3.  Family Planning
 *   4.  Gender-Based Violence (GBV)
 *   5.  Post-Abortion Care (PAC)
 *   6.  Adolescent Sexual & Reproductive Health (ASRH)
 *   7.  Commodity Availability
 *   8.  Demand Generation
 *   9.  Governance (TWG, policy, BHCPF, insurance, VGF)
 *   10. Facility Functionality (ODK + Baseline)
 *   11. Month-over-Month (MoM)
 *   12. Trend Analysis
 *   13. Facility Deepdive
 *   14. computeAllMeasures master
 *
 * Field-name reminder: ODK source identifiers are sometimes truncated
 * (e.g. `How_many_of_these_wo_s_for_the_first_time`) — preserved verbatim.
 */

import {
  COMMODITY_LIST,
  EQUIPMENT_LIST,
  INFRASTRUCTURE_LIST,
  type CommodityCategory,
} from './constants'
import type {
  CommodityMapping,
  FacilityBaselineRow,
  GovernanceRow,
  ODKSubmission,
  TreeRow,
} from './types'

// ===========================================================================
// 0. HELPERS
// ===========================================================================

export const divide = (num: number, den: number, fallback = 0): number =>
  den !== 0 ? num / den : fallback

export const sumField = (data: ODKSubmission[], field: string): number =>
  data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0)

export const countDistinct = (data: ODKSubmission[], field: string): number =>
  new Set(
    data
      .map((r) => r[field])
      .filter((v): v is string | number => v !== null && v !== undefined && v !== ''),
  ).size

export const countWhere = (
  data: ODKSubmission[],
  field: string,
  value: string,
): number =>
  data.filter((r) => String(r[field]).toLowerCase() === value.toLowerCase()).length

/** "65% (1,234/1,900)" */
export const formatPctFraction = (num: number, den: number): string => {
  if (den === 0) return '0% (0/0)'
  const pct = Math.round((num / den) * 100)
  return `${pct}% (${num.toLocaleString()}/${den.toLocaleString()})`
}

/** "12K" / "203" — for headline values */
export const formatK = (n: number): string =>
  n >= 1000 ? `${Math.round(n / 1000)}K` : String(n)

export interface MoMResult {
  pct: number
  label: string
}

/** Month-over-month delta. Up arrow good ≠ implied: pages choose colour. */
export const computeMoM = (current: number, previous: number): MoMResult => {
  if (!previous || previous === 0) return { pct: 0, label: '▶ 0%' }
  const pct = (current - previous) / previous
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '▶'
  return { pct, label: `${arrow} ${Math.round(Math.abs(pct) * 100)}%` }
}

// Internal: max of several numeric fields on a row (used by uterotonics).
const maxOfFields = (row: ODKSubmission, fields: string[]): number =>
  Math.max(0, ...fields.map((f) => Number(row[f]) || 0))

// ===========================================================================
// 1. COVERAGE
// ===========================================================================

export const totalAssessedFacilities = (data: ODKSubmission[]): number =>
  countDistinct(data, 'facility_name')

export const totalWomenEnrolled = (data: ODKSubmission[]): number =>
  sumField(data, 'women_enrolled_month')

// ===========================================================================
// 2. MNH — Maternal & Newborn Health
// ===========================================================================

export const totalANC1 = (data: ODKSubmission[]): number => sumField(data, 'anc1_total')
export const totalANC4 = (data: ODKSubmission[]): number => sumField(data, 'anc4_total')
export const totalANC8 = (data: ODKSubmission[]): number => sumField(data, 'anc8_total')

export const totalANCClients = (data: ODKSubmission[]): number =>
  totalANC1(data) + totalANC4(data) + totalANC8(data)

export const totalDeliveries = (data: ODKSubmission[]): number =>
  sumField(data, 'deliveries_total')

export const vaginalDeliveries = (data: ODKSubmission[]): number =>
  sumField(data, 'vaginal_deliveries')

export const cesareanDeliveries = (data: ODKSubmission[]): number =>
  sumField(data, 'cesarean_deliveries')

export const vaginalPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(vaginalDeliveries(data), totalDeliveries(data))

export const cSectionPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(cesareanDeliveries(data), totalDeliveries(data))

export const maternalDeaths = (data: ODKSubmission[]): number =>
  sumField(data, 'maternal_death_total')

export const neonatalDeaths = (data: ODKSubmission[]): number =>
  sumField(data, 'neonatal_death_total')

export const totalInFacilityDeaths = (data: ODKSubmission[]): number =>
  maternalDeaths(data) + neonatalDeaths(data)

export const auditedMaternalDeaths = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_deaths_were_audited')

export const auditedNeonatalDeaths = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_neonatal_deaths_were_audited')

// --- Quality-of-care indicators (per-delivery) ----------------------------
//
// Spec: for each delivery, take MAX(any uterotonic field) then SUM across
// rows. Counts the max number of deliveries where at least one uterotonic
// was administered.
const UTEROTONIC_FIELDS = [
  'Oxytocin_injection',
  'Carbetocin_Heat_Stable_Carbetocin',
  'Misoprostol_Mifepristone_tablet',
  'Ergometrine',
  'Tranexamic_Acid_TXA',
  'Magnesium_Sulfate',
]

export const deliveriesWithUterotonics = (data: ODKSubmission[]): number =>
  data.reduce((acc, row) => acc + maxOfFields(row, UTEROTONIC_FIELDS), 0)

export const deliveriesWithPartographs = (data: ODKSubmission[]): number =>
  sumField(data, 'partograph_used')

export const deliveriesWithCalibratedDrapes = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_vaginal_del_this_reporting_month')

/** Coverage % + gap %, used by the Service Delivery stacked-bar visual. */
export interface QualityOfCare {
  used: number
  total: number
  usedPct: number
  gapPct: number
  label: string
}

const qualityOfCare = (used: number, total: number): QualityOfCare => {
  const usedPct = total === 0 ? 0 : (used / total) * 100
  return {
    used,
    total,
    usedPct: Math.round(usedPct),
    gapPct: Math.round(100 - usedPct),
    label: formatPctFraction(used, total),
  }
}

export const uterotonicsQoC = (d: ODKSubmission[]): QualityOfCare =>
  qualityOfCare(deliveriesWithUterotonics(d), totalDeliveries(d))

export const partographsQoC = (d: ODKSubmission[]): QualityOfCare =>
  qualityOfCare(deliveriesWithPartographs(d), totalDeliveries(d))

export const calibratedDrapesQoC = (d: ODKSubmission[]): QualityOfCare =>
  qualityOfCare(deliveriesWithCalibratedDrapes(d), totalDeliveries(d))

// --- MPCDSR ---------------------------------------------------------------

export const facilitiesConductingMPCDSR = (data: ODKSubmission[]): number =>
  countWhere(data, 'Did_this_facility_co_his_reporting_period', 'yes')

// --- ANC by women who delivered (donut chart breakdown) ------------------

export interface ANCByLiveBirth {
  none: number
  visit1: number
  visit4: number
  visit8plus: number
}

export const ancByLiveBirth = (data: ODKSubmission[]): ANCByLiveBirth => ({
  none: sumField(data, 'anc_livebirth_0'),
  visit1: sumField(data, 'anc_livebirth_1_4'),
  visit4: sumField(data, 'anc_livebirth_5_7'),
  visit8plus: sumField(data, 'anc_livebirth_8plus'),
})

// ===========================================================================
// 3. FAMILY PLANNING
// ===========================================================================

export const fpTotal = (data: ODKSubmission[]): number => sumField(data, 'fp_total')

export const fpAdolescents = (data: ODKSubmission[]): number =>
  sumField(data, 'fp_adolescent')

export const fpFirstTime = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_of_these_wo_s_for_the_first_time')

// --- IUCD -----------------------------------------------------------------

export const totalIUCD = (data: ODKSubmission[]): number =>
  sumField(data, 'Intra_Uterine_Contraceptive_Device_IUCD')

export const iucdFirstTime = (data: ODKSubmission[]): number =>
  sumField(data, 'first_time_iucd')

export const iucdReturning = (data: ODKSubmission[]): number =>
  Math.max(0, totalIUCD(data) - iucdFirstTime(data))

// --- Implants -------------------------------------------------------------

export const totalImplants = (data: ODKSubmission[]): number =>
  sumField(data, 'Implants')

export const implantsFirstTime = (data: ODKSubmission[]): number =>
  sumField(data, 'first_time_implant')

export const implantsReturning = (data: ODKSubmission[]): number =>
  Math.max(0, totalImplants(data) - implantsFirstTime(data))

// --- Injectables (SA + FA combined) --------------------------------------

export const totalInjectables = (data: ODKSubmission[]): number =>
  sumField(data, 'Injectable_contraceptives_sa') +
  sumField(data, 'Injectable_contraceptives_fa')

export const injectablesFirstTime = (data: ODKSubmission[]): number =>
  sumField(data, 'first_time_injectable')

export const injectablesReturning = (data: ODKSubmission[]): number =>
  Math.max(0, totalInjectables(data) - injectablesFirstTime(data))

// --- Other methods --------------------------------------------------------

export const oralContraceptives = (data: ODKSubmission[]): number =>
  sumField(data, 'Oral_contraceptives')

export const emergencyContraceptives = (data: ODKSubmission[]): number =>
  sumField(data, 'Emergency_contraceptives')

/** Method-mix for the FP bar chart on the Service Delivery page. */
export interface FPMethodDatum {
  name: string
  value: number
}

export const fpMethodMix = (data: ODKSubmission[]): FPMethodDatum[] => [
  { name: 'Oral Contraceptives', value: oralContraceptives(data) },
  { name: 'IUCD', value: totalIUCD(data) },
  {
    name: 'Injectables (SA)',
    value: sumField(data, 'Injectable_contraceptives_sa'),
  },
  {
    name: 'Injectables (FA)',
    value: sumField(data, 'Injectable_contraceptives_fa'),
  },
  { name: 'Implants', value: totalImplants(data) },
  { name: 'Emergency', value: emergencyContraceptives(data) },
]

// ===========================================================================
// 4. GBV
// ===========================================================================

export const gbvTotal = (data: ODKSubmission[]): number => sumField(data, 'gbv_total')
export const gbvFirstTime = (data: ODKSubmission[]): number => sumField(data, 'gbv_first')
export const gbvAdolescents = (data: ODKSubmission[]): number =>
  sumField(data, 'gbv_adolescent')

export const gbvFirstTimePctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(gbvFirstTime(data), gbvTotal(data))

export const gbvCounsellingPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'Counselling_and_psyc_upport_for_survivors'),
    gbvTotal(data),
  )

export const gbvPepPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'HIV_post_exposure_prophylaxis_PEP'),
    gbvTotal(data),
  )

export const gbvHivTestingPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'HIV_testing_and_screening_following_GBV'),
    gbvTotal(data),
  )

export const gbvMetronidazolePctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'Administration_of_Metronidazole_tablets'),
    gbvTotal(data),
  )

export const gbvEmergencyContraceptivePctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'gbv_emergency_contraception'),
    gbvTotal(data),
  )

// ===========================================================================
// 5. PAC
// ===========================================================================

/** Total PAC clients — spec field has a truncated ODK identifier. */
export const pacTotal = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_women_and_girls_recei')

export const pacFirstTime = (data: ODKSubmission[]): number =>
  sumField(data, 'pac_first_time')

export const pacAdolescents = (data: ODKSubmission[]): number =>
  sumField(data, 'pac_adolescent')

export const pacSurgical = (data: ODKSubmission[]): number =>
  sumField(data, 'pac_mva')

export const pacMedical = (data: ODKSubmission[]): number =>
  sumField(data, 'pac_medical_evac')

export const pacAdolescentSurgical = (data: ODKSubmission[]): number =>
  sumField(data, 'mnh_adolescent_mva')

export const pacFirstTimePctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(pacFirstTime(data), pacTotal(data))

export const pacCounsellingPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'Counselling_and_emotional_support'),
    pacTotal(data),
  )

export const pacAntibioticsPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'Administration_of_Ibuprofen_tablets'),
    pacTotal(data),
  )

/**
 * Spec lists a "contraceptives received %" for PAC but the field is not
 * enumerated in the type spec. Using Emergency_contraceptives as a best
 * proxy — confirm against the real ODK form and replace the field if a
 * dedicated `pac_*_contraceptives` column exists.
 */
export const pacContraceptivesPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(
    sumField(data, 'Emergency_contraceptives'),
    pacTotal(data),
  )

export const pacAdolescentSurgicalPctLabel = (data: ODKSubmission[]): string =>
  formatPctFraction(pacAdolescentSurgical(data), pacAdolescents(data))

// ===========================================================================
// 6. ASRH — Adolescent
// ===========================================================================

export const adolescentMNH = (data: ODKSubmission[]): number =>
  sumField(data, 'mnh_adolescent_deliveries')

export interface AdolescentsByCategory {
  MNH: number
  FP: number
  PAC: number
  GBV: number
}

export const adolescentsByCategory = (data: ODKSubmission[]): AdolescentsByCategory => ({
  MNH: adolescentMNH(data),
  FP: fpAdolescents(data),
  PAC: pacAdolescents(data),
  GBV: gbvAdolescents(data),
})

export const totalAdolescents = (data: ODKSubmission[]): number => {
  const c = adolescentsByCategory(data)
  return c.MNH + c.FP + c.PAC + c.GBV
}

// ===========================================================================
// 7. COMMODITY AVAILABILITY
// ===========================================================================

export interface CommodityStockedRow {
  category: string
  stocked: number
  stockedOut: number
}

/** "available" count vs the rest for a single commodity backend name. */
const stockedForBackend = (
  data: ODKSubmission[],
  backendName: string,
): { stocked: number; stockedOut: number } => {
  const field = `comm_status_${backendName}`
  const stocked = data.filter((r) => r[field] === 'available').length
  return { stocked, stockedOut: data.length - stocked }
}

/** Stack rows for one commodity (used by Overview's 4-commodity strip). */
export const overviewCommodityAvailability = (
  data: ODKSubmission[],
): CommodityStockedRow[] => {
  // Spec calls out exactly these four on the Overview page.
  const overview = [
    'Carbetocin (Heat Stable)',
    'Misoprostol',
    'Oxy-Miso Combo Pack',
    'Oxytocin',
  ]
  return overview.flatMap((displayName) => {
    const mapping = COMMODITY_LIST.find((c) => c.CommodityName === displayName)
    if (!mapping) return []
    const { stocked, stockedOut } = stockedForBackend(data, mapping.BackendName)
    return [{ category: displayName, stocked, stockedOut }]
  })
}

/** Stack rows for every commodity in a category (Overview slicer). */
export const commodityAvailabilityByCategory = (
  data: ODKSubmission[],
  category: CommodityCategory,
  mapping: CommodityMapping[] = COMMODITY_LIST,
): CommodityStockedRow[] =>
  mapping
    .filter((m) => m.Category === category)
    .map((m) => {
      const { stocked, stockedOut } = stockedForBackend(data, m.BackendName)
      return { category: m.CommodityName, stocked, stockedOut }
    })

/**
 * Stock-out risk buckets for the Service Delivery page.
 *
 * The original PBI dashboard derived these from per-commodity
 * days-of-stock fields (current quantity / daily consumption rate). Those
 * fields aren't enumerated in the type spec, so this implementation falls
 * back to the binary `comm_status_*` flag: facility-products marked
 * `not_available` count as "no stock". `criticalStock` and `warningStock`
 * are returned as 0 until DOS fields are wired up.
 */
export interface StockOutRisk {
  noStock: number
  criticalStock: number
  warningStock: number
}

export const stockOutRisk = (data: ODKSubmission[]): StockOutRisk => {
  let noStock = 0
  for (const row of data) {
    for (const c of COMMODITY_LIST) {
      if (row[`comm_status_${c.BackendName}`] === 'not_available') noStock += 1
    }
  }
  return { noStock, criticalStock: 0, warningStock: 0 }
}

// ===========================================================================
// 8. DEMAND GENERATION
// ===========================================================================

export const referralsByBigSisters = (data: ODKSubmission[]): number =>
  sumField(data, 'Of_the_newly_enrolle_ommunity_Big_Sisters')

export const referralsByTBAs = (data: ODKSubmission[]): number =>
  sumField(data, 'How_many_of_the_rece_rth_attendants_TBAs')

export const referralsByOtherHFs = (data: ODKSubmission[]): number =>
  sumField(data, 'ref_other_hf')

export const totalReferralsReceived = (data: ODKSubmission[]): number =>
  referralsByBigSisters(data) + referralsByTBAs(data) + referralsByOtherHFs(data)

export interface ReferralBreakdown {
  BigSisters: number
  TBAs: number
  OtherHFs: number
}

export const referralBreakdown = (data: ODKSubmission[]): ReferralBreakdown => ({
  BigSisters: referralsByBigSisters(data),
  TBAs: referralsByTBAs(data),
  OtherHFs: referralsByOtherHFs(data),
})

/**
 * "X% received" label. The original PBI used a hardcoded denominator
 * (4200). Spec requires real data. Without a distinct "referred but not
 * yet received" field in ODK, we report received / received = 100%
 * until the proper denominator field is identified.
 */
export const referralReceivedPctLabel = (data: ODKSubmission[]): string => {
  const received = totalReferralsReceived(data)
  return formatPctFraction(received, received)
}

// ===========================================================================
// 9. GOVERNANCE
// ===========================================================================

const N_STATES = 8 // 8 supported Nigerian states (denominator for X/8 labels)

const countYes = <K extends keyof GovernanceRow>(
  rows: GovernanceRow[],
  key: K,
): number => rows.filter((r) => String(r[key]).toLowerCase() === 'yes').length

export interface GovernanceMeasures {
  // TWG
  twgInauguratedLabel: string
  twgMeetingsLabel: string
  aopActivitiesLabel: string
  // Policy adoption
  rhPolicyLabel: string
  vappLabel: string
  vcatLabel: string
  stopLabel: string
  // BHCPF funding (from ODK)
  bhcpfReceivedDonut: { yes: number; no: number }
  bhcpfFullDonut: { yes: number; no: number }
  bhcpfOnTimeDonut: { yes: number; no: number }
  // BHCPF clients
  bhcpfClientsTotal: number
  bhcpfFemaleLabel: string
  bhcpfAdolescentLabel: string
  // Insurance
  womenEnrolled: number
  insured: number
  insuredPctLabel: string
  insuranceBreakdown: {
    NHIA: number
    HMO: number
    CommunityBased: number
    Others: number
  }
  // VGF
  providesVGFCount: number
  vgfIdentified: number
  vgfReceivedService: number
  vgfServiceBreakdown: {
    ANC: number
    Delivery: number
    PNC: number
    FP: number
    GBV: number
    PAC: number
  }
}

export function computeGovernanceMeasures(
  govData: GovernanceRow[],
  filteredODK: ODKSubmission[],
  stateFilter: string,
): GovernanceMeasures {
  // When a single state is selected, score that state's row only; otherwise
  // score across all 8 states (denominator = 8).
  const scopedGov =
    stateFilter && stateFilter !== 'All'
      ? govData.filter((r) => r.State === stateFilter)
      : govData
  const denom = stateFilter && stateFilter !== 'All' ? 1 : N_STATES

  // BHCPF donut counts (from ODK).
  const donut = (field: keyof ODKSubmission) => ({
    yes: countWhere(filteredODK, field as string, 'yes'),
    no: countWhere(filteredODK, field as string, 'no'),
  })

  const insured = sumField(filteredODK, 'new_insured')
  const womenEnrolled = sumField(filteredODK, 'women_enrolled_month')

  const bhcpfTotal = sumField(filteredODK, 'bhcpf_clients_total')
  const bhcpfFemale = sumField(filteredODK, 'bhcpf_clients_female')
  const bhcpfAdolescent = sumField(filteredODK, 'bhcpf_clients_adolescent')

  return {
    twgInauguratedLabel: formatPctFraction(
      countYes(scopedGov, 'TWG_inaugurated'),
      denom,
    ),
    twgMeetingsLabel: formatPctFraction(
      countYes(scopedGov, 'TWG_meeting_conducted'),
      denom,
    ),
    aopActivitiesLabel: formatPctFraction(
      countYes(scopedGov, 'AOP_activities_completed'),
      denom,
    ),
    rhPolicyLabel: formatPctFraction(
      countYes(scopedGov, 'RH_policy_adopted'),
      denom,
    ),
    vappLabel: formatPctFraction(
      countYes(scopedGov, 'Adopted_VAPP_protocol'),
      denom,
    ),
    vcatLabel: formatPctFraction(
      countYes(scopedGov, 'Stakeholders_trained_on_VCAT'),
      denom,
    ),
    stopLabel: formatPctFraction(
      countYes(scopedGov, 'STOP_guideline_adopted'),
      denom,
    ),
    bhcpfReceivedDonut: donut('bhcpf_received'),
    bhcpfFullDonut: donut('bhcpf_full_amount'),
    bhcpfOnTimeDonut: donut('bhcpf_on_time'),
    bhcpfClientsTotal: bhcpfTotal,
    bhcpfFemaleLabel: formatPctFraction(bhcpfFemale, bhcpfTotal),
    bhcpfAdolescentLabel: formatPctFraction(bhcpfAdolescent, bhcpfTotal),
    womenEnrolled,
    insured,
    insuredPctLabel: formatPctFraction(insured, womenEnrolled),
    insuranceBreakdown: {
      NHIA: sumField(filteredODK, 'Public_insurance_NHIA'),
      HMO: sumField(filteredODK, 'Private_insurance_HMO'),
      CommunityBased: sumField(filteredODK, 'Community_based_insurance'),
      Others: sumField(filteredODK, 'Other_types_of_insurance'),
    },
    providesVGFCount: countWhere(filteredODK, 'Does_this_facility_provide_VGF', 'yes'),
    vgfIdentified: sumField(filteredODK, 'vgf_identified'),
    vgfReceivedService: sumField(filteredODK, 'vgf_received_service'),
    vgfServiceBreakdown: {
      ANC: sumField(filteredODK, 'ANC'),
      Delivery: sumField(filteredODK, 'Delivery_service'),
      PNC: sumField(filteredODK, 'PNC'),
      FP: sumField(filteredODK, 'FP_001'),
      GBV: sumField(filteredODK, 'VGF_GBV'),
      PAC: sumField(filteredODK, 'VGF_PAC'),
    },
  }
}

// ===========================================================================
// 10. FACILITY FUNCTIONALITY
// ===========================================================================

// Map our friendly display names to the FacilityBaselineRow keys.
const EQUIPMENT_KEYS: Record<string, keyof FacilityBaselineRow> = {
  'Delivery beds': 'Delivery_beds',
  'Neonatal resuscitation kit': 'Neonatal_resuscitation_kit',
  'Vacuum extractor': 'Vacuum_extractor_forceps',
  'Sterile delivery kits': 'Sterile_delivery_kit',
  'MVA kits': 'MVA_kits',
  'IUD insertion tray': 'IUD_insertion_removal_tray',
  'Implant set': 'Implant_insertion_removal_set',
  'BP apparatus': 'BP_apparatus_stethoscope',
  Autoclave: 'Autoclave_or_sterilizer',
  'Pregnancy test kits': 'Pregnancy_test_kits',
}

const INFRASTRUCTURE_KEYS: Record<string, keyof FacilityBaselineRow> = {
  'Reliable power supply': 'Reliable_power_supply',
  'Reliable water supply': 'Reliable_water_supply',
  Toilet: 'Toilet',
  'Dedicated SRH/Maternity ward': 'Dedicated_SRH_Maternity_ward',
  'Operating theater': 'Operating_theater_CEmONC_only',
  'Blood bank/Transfusion services': 'Blood_bank_CEmONC_only',
}

export interface AvailabilityCount {
  item: string
  available: number
  notAvailable: number
}

/**
 * Strict "yes" count — only facilities where the item is fully present
 * and functional. The `yes__occasionally` bucket (= "available but
 * non-functional" in the source data) is intentionally NOT counted here
 * so the Infrastructure Availability HBar reflects service-ready state.
 *
 * For a tri-state visual that surfaces the "broken but present" cohort,
 * use `supplyTri()` instead.
 */
const baselineYesCount = (
  data: FacilityBaselineRow[],
  key: keyof FacilityBaselineRow,
): number =>
  data.filter((r) => String(r[key] ?? '').toLowerCase() === 'yes').length

export interface FacilityFunctionalityMeasures {
  // ODK-derived
  totalAssessedBEmONC: number
  totalCEmONCHWs: number
  cEmONCStaffByType: {
    NursesMidwives: number
    MedicalOfficers: number
    Anaesthesiologists: number
    Gynecologists: number
  }
  revitalizationStatus: {
    Completed: number
    Ongoing: number
    NotStarted: number
  }
  commodityDistributionStatus: { yes: number; no: number }
  equipmentDistributionStatus: {
    FullyReceived: number
    PartiallyReceived: number
    NotReceived: number
  }
  transportTypes: { name: string; value: number }[]
  ambulanceReferrals: number
  referralsByCase: {
    ASRH: number
    GBV: number
    Newborn: number
    Obstetric: number
    PAC: number
  }
  bemoncBySBACount: Record<'0' | '1' | '2' | '3' | '4+', number>
  // Baseline-derived
  infrastructureAvailability: AvailabilityCount[]
  equipmentAvailability: AvailabilityCount[]
  powerSupplyByFacility: { hasReliable: number; hasOccasional: number; hasNone: number }
  waterSupplyByFacility: { hasReliable: number; hasOccasional: number; hasNone: number }
  facilitiesWithSBAs: number
  staffDistributionBaseline: {
    Obstetricians: number
    MedicalOfficers: number
    Nurses: number
    Midwives: number
    CHO: number
    SCHEW: number
    JCHEW: number
  }
}

const groupCount = <T>(items: T[], key: (t: T) => string): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const it of items) {
    const k = key(it)
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

const supplyTri = (
  baseline: FacilityBaselineRow[],
  field: keyof FacilityBaselineRow,
) => {
  let hasReliable = 0
  let hasOccasional = 0
  let hasNone = 0
  for (const r of baseline) {
    const v = String(r[field] ?? '').toLowerCase()
    if (v === 'yes') hasReliable += 1
    else if (v === 'yes__occasionally') hasOccasional += 1
    else hasNone += 1
  }
  return { hasReliable, hasOccasional, hasNone }
}

export function computeFacilityFunctionalityMeasures(
  filteredODK: ODKSubmission[],
  baselineData: FacilityBaselineRow[],
  stateFilter: string,
): FacilityFunctionalityMeasures {
  const scopedBaseline =
    stateFilter && stateFilter !== 'All'
      ? baselineData.filter((r) => r.STATE === stateFilter)
      : baselineData

  // --- ODK side --------------------------------------------------------
  const bemoncRows = filteredODK.filter((r) => r.facility_type === 'BEmONC')

  // SBA count buckets per facility (count over BEmONC rows).
  const sbaBuckets: Record<'0' | '1' | '2' | '3' | '4+', number> = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4+': 0,
  }
  for (const r of bemoncRows) {
    const n = Number(r.How_many_skilled_bir_this_health_facility) || 0
    if (n >= 4) sbaBuckets['4+'] += 1
    else sbaBuckets[String(n) as '0' | '1' | '2' | '3'] += 1
  }

  const transportCounts = groupCount(filteredODK, (r) =>
    String(r.transport_type || 'Unknown'),
  )

  return {
    totalAssessedBEmONC: countDistinct(bemoncRows, 'facility_name'),
    totalCEmONCHWs:
      sumField(filteredODK, 'Anesthesiologists') +
      sumField(filteredODK, 'Obstetricians_Gynecologists') +
      sumField(filteredODK, 'Medical_Officers') +
      sumField(filteredODK, 'Nurses_Midwives'),
    cEmONCStaffByType: {
      NursesMidwives: sumField(filteredODK, 'Nurses_Midwives'),
      MedicalOfficers: sumField(filteredODK, 'Medical_Officers'),
      Anaesthesiologists: sumField(filteredODK, 'Anesthesiologists'),
      Gynecologists: sumField(filteredODK, 'Obstetricians_Gynecologists'),
    },
    revitalizationStatus: {
      Completed: countWhere(filteredODK, 'Has_this_facility_been_revital', 'Yes'),
      Ongoing: countWhere(filteredODK, 'Has_this_facility_been_revital', 'No'),
      NotStarted: countWhere(filteredODK, 'Has_this_facility_been_revital', 'not_started'),
    },
    commodityDistributionStatus: {
      yes: countWhere(filteredODK, 'order_fulfilled', 'yes'),
      no: countWhere(filteredODK, 'order_fulfilled', 'no'),
    },
    equipmentDistributionStatus: {
      FullyReceived: countWhere(filteredODK, 'Is_there_documentati_ipt_of_the_equipment', 'Yes'),
      PartiallyReceived: 0, // dedicated field not enumerated in spec
      NotReceived: countWhere(filteredODK, 'Is_there_documentati_ipt_of_the_equipment', 'No'),
    },
    transportTypes: Object.entries(transportCounts).map(([name, value]) => ({
      name,
      value,
    })),
    ambulanceReferrals: sumField(filteredODK, 'ambulance_referrals'),
    referralsByCase: {
      ASRH: sumField(filteredODK, 'Adolescent_Sexual_an_ealth_ASRH_service'),
      GBV: sumField(filteredODK, 'Gender_Based_Violence_management_care'),
      Newborn: sumField(filteredODK, 'Newborn_neonatal_emergency_cases'),
      Obstetric: sumField(filteredODK, 'Obstetric_maternal_emergency_cases'),
      PAC: sumField(filteredODK, 'Post_Abortion_Care'),
    },
    bemoncBySBACount: sbaBuckets,

    // --- Baseline side ---------------------------------------------------
    infrastructureAvailability: INFRASTRUCTURE_LIST.map((item) => {
      const key = INFRASTRUCTURE_KEYS[item]
      const available = baselineYesCount(scopedBaseline, key)
      return { item, available, notAvailable: scopedBaseline.length - available }
    }),
    equipmentAvailability: EQUIPMENT_LIST.map((item) => {
      const key = EQUIPMENT_KEYS[item]
      const available = baselineYesCount(scopedBaseline, key)
      return { item, available, notAvailable: scopedBaseline.length - available }
    }),
    powerSupplyByFacility: supplyTri(scopedBaseline, 'Reliable_power_supply'),
    waterSupplyByFacility: supplyTri(scopedBaseline, 'Reliable_water_supply'),
    facilitiesWithSBAs: scopedBaseline.filter(
      (r) =>
        (Number(r.Nurses) || 0) +
          (Number(r.Midwives) || 0) +
          (Number(r.Medical_Officers) || 0) +
          (Number(r.Obstetricians_Gynecologists) || 0) >=
        4,
    ).length,
    staffDistributionBaseline: {
      Obstetricians: scopedBaseline.reduce(
        (a, r) => a + (Number(r.Obstetricians_Gynecologists) || 0),
        0,
      ),
      MedicalOfficers: scopedBaseline.reduce(
        (a, r) => a + (Number(r.Medical_Officers) || 0),
        0,
      ),
      Nurses: scopedBaseline.reduce((a, r) => a + (Number(r.Nurses) || 0), 0),
      Midwives: scopedBaseline.reduce((a, r) => a + (Number(r.Midwives) || 0), 0),
      CHO: scopedBaseline.reduce((a, r) => a + (Number(r.CHO) || 0), 0),
      SCHEW: scopedBaseline.reduce((a, r) => a + (Number(r.SCHEW) || 0), 0),
      JCHEW: scopedBaseline.reduce((a, r) => a + (Number(r.JCHEW) || 0), 0),
    },
  }
}

// ===========================================================================
// 11. MONTH-OVER-MONTH (MoM)
// ===========================================================================

/** Per-row measure signature shared by all simple aggregations. */
export type Measure = (data: ODKSubmission[]) => number

/** "YYYY-MM" key from an ODK Reporting_Month_Date (ISO date). */
const monthKey = (iso: string): string => {
  if (!iso || typeof iso !== 'string') return ''
  return iso.slice(0, 7)
}

/**
 * Compare the most recent reporting month against the one before it.
 * If the dataset has only one month (or none), returns { pct:0, label:'▶ 0%' }.
 */
export function computeMoMForIndicator(
  allData: ODKSubmission[],
  measureFn: Measure,
): MoMResult {
  const months = [...new Set(allData.map((r) => monthKey(r.Reporting_Month_Date)))]
    .filter(Boolean)
    .sort()
  if (months.length < 2) return { pct: 0, label: '▶ 0%' }
  const [previousMonth, currentMonth] = months.slice(-2)
  const current = measureFn(
    allData.filter((r) => monthKey(r.Reporting_Month_Date) === currentMonth),
  )
  const previous = measureFn(
    allData.filter((r) => monthKey(r.Reporting_Month_Date) === previousMonth),
  )
  return computeMoM(current, previous)
}

/**
 * Group the dataset by State and apply `measure` to each group. Used by
 * the state-breakdown popovers wired into the Overview KPI cards.
 * Sorted high → low so the chart reads as a quick ranking.
 */
export function breakdownByState(
  allData: ODKSubmission[],
  measure: Measure,
): { state: string; value: number }[] {
  const byState = new Map<string, ODKSubmission[]>()
  for (const row of allData) {
    if (!row.State) continue
    if (!byState.has(row.State)) byState.set(row.State, [])
    byState.get(row.State)!.push(row)
  }
  return [...byState.entries()]
    .map(([state, rows]) => ({ state, value: measure(rows) }))
    .sort((a, b) => b.value - a.value)
}

// ===========================================================================
// 12. TREND ANALYSIS
// ===========================================================================

/** Indicator label → measure function. Drives the Trend Analysis dropdown. */
export const INDICATOR_MEASURES: Record<string, Measure> = {
  'Assessed Facilities': totalAssessedFacilities,
  'Women Enrolled': totalWomenEnrolled,
  'Total ANC Clients': totalANCClients,
  'Total Deliveries': totalDeliveries,
  'Vaginal Deliveries': vaginalDeliveries,
  'C-Section Deliveries': cesareanDeliveries,
  'Total Deaths': totalInFacilityDeaths,
  'Maternal Deaths': maternalDeaths,
  'Neonatal Deaths': neonatalDeaths,
  'FP Total': fpTotal,
  IUCD: totalIUCD,
  Implants: totalImplants,
  Injectables: totalInjectables,
  'PAC Total': pacTotal,
  'GBV Total': gbvTotal,
  'Total Adolescent Beneficiaries': totalAdolescents,
}

export interface TrendPoint {
  month: string
  value: number
}

export function computeTrendData(
  allData: ODKSubmission[],
  indicatorName: string,
): TrendPoint[] {
  const measureFn = INDICATOR_MEASURES[indicatorName]
  if (!measureFn) return []
  const byMonth = new Map<string, ODKSubmission[]>()
  for (const row of allData) {
    const key = monthKey(row.Reporting_Month_Date)
    if (!key) continue
    if (!byMonth.has(key)) byMonth.set(key, [])
    byMonth.get(key)!.push(row)
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, rows]) => ({ month, value: measureFn(rows) }))
}

// ===========================================================================
// 13. FACILITY DEEPDIVE
// ===========================================================================

/** Per-row totals used by the Facility Deepdive matrix. */
const clientsAccessingCare = (
  rows: ODKSubmission[],
  facilityType: 'BEmONC' | 'CEmONC',
): number => {
  const scoped = rows.filter((r) => r.facility_type === facilityType)
  return fpTotal(scoped) + gbvTotal(scoped) + pacTotal(scoped)
}

const deepDiveValuesForGroup = (rows: ODKSubmission[]): Record<string, number> => ({
  'Assessed Facilities': countDistinct(rows, 'facility_name'),
  'BEmONCs with 4+ SBAs': rows.filter(
    (r) =>
      r.facility_type === 'BEmONC' &&
      (Number(r.How_many_skilled_bir_this_health_facility) || 0) >= 4,
  ).length,
  'Clients Accessing BEmONC Care': clientsAccessingCare(rows, 'BEmONC'),
  'Clients Accessing CEmONC Care': clientsAccessingCare(rows, 'CEmONC'),
})

export interface DeepDiveTree {
  rows: TreeRow[]
  totals: Record<string, number>
}

export function computeDeepDiveData(filteredData: ODKSubmission[]): DeepDiveTree {
  // Build State → LGA → Facility groupings.
  const byState = new Map<string, Map<string, Map<string, ODKSubmission[]>>>()
  for (const row of filteredData) {
    if (!byState.has(row.State)) byState.set(row.State, new Map())
    const lgaMap = byState.get(row.State)!
    if (!lgaMap.has(row.LGA)) lgaMap.set(row.LGA, new Map())
    const facMap = lgaMap.get(row.LGA)!
    if (!facMap.has(row.facility_name)) facMap.set(row.facility_name, [])
    facMap.get(row.facility_name)!.push(row)
  }

  const rows: TreeRow[] = [...byState.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([state, lgaMap]) => {
      const stateRows = [...lgaMap.values()]
        .flatMap((m) => [...m.values()])
        .flat()
      return {
        id: `state-${state}`,
        label: state,
        values: deepDiveValuesForGroup(stateRows),
        children: [...lgaMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([lga, facMap]) => {
            const lgaRows = [...facMap.values()].flat()
            return {
              id: `lga-${state}-${lga}`,
              label: lga,
              values: deepDiveValuesForGroup(lgaRows),
              children: [...facMap.entries()]
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([facility, facRows]) => ({
                  id: `fac-${state}-${lga}-${facility}`,
                  label: facility,
                  values: deepDiveValuesForGroup(facRows),
                })),
            }
          }),
      }
    })

  return {
    rows,
    totals: deepDiveValuesForGroup(filteredData),
  }
}

// ===========================================================================
// 14. computeAllMeasures — master snapshot used by the Overview page
// ===========================================================================

/**
 * Convenience: compute every Overview-level KPI in one pass.
 * Pages that only need a couple of measures should call the individual
 * functions directly to avoid the extra work.
 */
export function computeAllMeasures(data: ODKSubmission[]) {
  return {
    // Coverage
    totalAssessedFacilities: totalAssessedFacilities(data),
    totalWomenEnrolled: totalWomenEnrolled(data),
    // MNH
    totalANCClients: totalANCClients(data),
    totalDeliveries: totalDeliveries(data),
    vaginalDeliveries: vaginalDeliveries(data),
    cesareanDeliveries: cesareanDeliveries(data),
    vaginalPctLabel: vaginalPctLabel(data),
    cSectionPctLabel: cSectionPctLabel(data),
    totalInFacilityDeaths: totalInFacilityDeaths(data),
    maternalDeaths: maternalDeaths(data),
    neonatalDeaths: neonatalDeaths(data),
    auditedMaternalDeaths: auditedMaternalDeaths(data),
    auditedNeonatalDeaths: auditedNeonatalDeaths(data),
    facilitiesConductingMPCDSR: facilitiesConductingMPCDSR(data),
    ancByLiveBirth: ancByLiveBirth(data),
    // FP
    fpTotal: fpTotal(data),
    fpAdolescents: fpAdolescents(data),
    fpFirstTime: fpFirstTime(data),
    totalIUCD: totalIUCD(data),
    iucdFirstTime: iucdFirstTime(data),
    iucdReturning: iucdReturning(data),
    totalImplants: totalImplants(data),
    implantsFirstTime: implantsFirstTime(data),
    implantsReturning: implantsReturning(data),
    totalInjectables: totalInjectables(data),
    injectablesFirstTime: injectablesFirstTime(data),
    injectablesReturning: injectablesReturning(data),
    // GBV / PAC / ASRH summary
    gbvTotal: gbvTotal(data),
    gbvFirstTimePctLabel: gbvFirstTimePctLabel(data),
    pacTotal: pacTotal(data),
    pacFirstTimePctLabel: pacFirstTimePctLabel(data),
    totalAdolescents: totalAdolescents(data),
    adolescentsByCategory: adolescentsByCategory(data),
    // Commodities (Overview slice)
    overviewCommodityAvailability: overviewCommodityAvailability(data),
  }
}
