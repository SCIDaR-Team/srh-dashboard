/**
 * Type definitions for the SRH Program Dashboard.
 *
 * Split into two sections:
 *   1. Chart-wrapper types (chrome) — used by components in components/charts/
 *   2. Domain types — shapes of records returned by the four data sources
 *      (ODK Central + 3 Google Sheets) plus the global FilterState.
 *
 * Field names under ODKSubmission and FacilityBaselineRow mirror the exact
 * names from the source systems and may look quirky (truncated identifiers,
 * doubled underscores). Do not rename them here — they must match the raw
 * payload keys so the measures library can pick them up directly.
 */

// ===========================================================================
// 1. CHART CHROME
// ===========================================================================

/** Generic 2-D datum used by most chart wrappers. */
export interface ChartDatum {
  name: string
  value: number
  [key: string]: string | number
}

/** Node for the hierarchical TreeTable (e.g. State → LGA → Facility). */
export interface TreeRow {
  id: string
  label: string
  values: Record<string, number>
  children?: TreeRow[]
}

// ===========================================================================
// 2. DOMAIN TYPES
// ===========================================================================

// --- Yes/No helpers ---------------------------------------------------------

/** Lower-case yes/no flag as it appears in ODK form submissions. */
export type YesNo = 'yes' | 'no'

/** Title-case yes/no flag (some ODK select_one questions use this casing). */
export type YesNoTitle = 'Yes' | 'No'

/** Stocking status of a commodity in ODK. */
export type CommodityStatus = 'available' | 'not_available'

/** Tri-state used by infrastructure questions (power, water, …). */
export type AvailabilityTri = 'yes' | 'no' | 'yes__occasionally'

// --- Filter state -----------------------------------------------------------

/**
 * Global filter context.
 *
 * `state`, `lga`, `facilityName`, `facilityType`, and `reportingMonth`
 * default to the sentinel "All". `searchFacility` is a free-text input
 * that filters by substring match on `facility_name`.
 */
export interface FilterState {
  state: string | 'All'
  lga: string | 'All'
  facilityName: string | 'All'
  facilityType: string | 'All'
  reportingMonth: string | 'All'
  searchFacility: string
}

// --- ODK submission ---------------------------------------------------------

/**
 * One row from the monthly ODK "Revised routine tool".
 *
 * The form has 432 columns; only the fields actively read by the dashboard
 * are typed below. The trailing index signature lets the rest pass through
 * untouched (e.g. raw geolocation, audit metadata) without forcing every
 * caller to widen the type.
 *
 * Numeric counts may arrive as numbers OR as strings (ODK exports them as
 * strings); always coerce with `Number(row[field]) || 0` at the call site
 * via the `sumField` helper in the measures library (added in PROMPT 3).
 */
export interface ODKSubmission {
  // -- Metadata --------------------------------------------------------------
  __id: string
  State: string
  LGA: string
  facility_name: string
  facility_type: string // "BEmONC" | "CEmONC"
  Reporting_month: string // e.g. "January"
  Reporting_Month_Date: string // ISO date
  submission_date: string // ISO date

  // -- Enrollment & Insurance -----------------------------------------------
  women_enrolled_month: number
  Of_the_newly_enrolle_ommunity_Big_Sisters: number
  new_insured: number
  insured_srh_clients: number
  Public_insurance_NHIA: number
  Private_insurance_HMO: number
  Community_based_insurance: number
  Other_types_of_insurance: number

  // -- Family Planning -------------------------------------------------------
  fp_total: number
  fp_adolescent: number
  How_many_of_these_wo_s_for_the_first_time: number
  Oral_contraceptives: number
  Intra_Uterine_Contraceptive_Device_IUCD: number
  first_time_iucd: number
  Injectable_contraceptives_sa: number
  Injectable_contraceptives_fa: number
  first_time_injectable: number
  Implants: number
  first_time_implant: number
  Emergency_contraceptives: number

  // -- Post-Abortion Care ----------------------------------------------------
  How_many_women_and_girls_recei: number
  pac_adolescent: number
  pac_first_time: number
  pac_mva: number
  pac_medical_evac: number
  mnh_adolescent_mva: number
  Counselling_and_emotional_support: number
  Administration_of_Ibuprofen_tablets: number
  Administration_of_Ibuprofen_ta: number

  // -- Gender-Based Violence -------------------------------------------------
  gbv_total: number
  gbv_adolescent: number
  gbv_first: number
  Counselling_and_psyc_upport_for_survivors: number
  HIV_post_exposure_prophylaxis_PEP: number
  HIV_testing_and_screening_following_GBV: number
  gbv_emergency_contraception: number
  Administration_of_Metronidazole_tablets: number

  // -- Maternal & Newborn Health --------------------------------------------
  anc1_total: number
  anc4_total: number
  anc8_total: number
  deliveries_total: number
  cesarean_deliveries: number
  vaginal_deliveries: number
  partograph_used: number
  How_many_vaginal_del_this_reporting_month: number
  Oxytocin_injection: number
  Carbetocin_Heat_Stable_Carbetocin: number
  Misoprostol_Mifepristone_tablet: number
  Ergometrine: number
  Tranexamic_Acid_TXA: number
  Magnesium_Sulfate: number
  maternal_death_total: number
  neonatal_death_total: number
  How_many_deaths_were_audited: number
  How_many_neonatal_deaths_were_audited: number
  mnh_adolescent_deliveries: number
  mnh_adolescent_cs: number
  mnh_adolescent_vaginal: number

  // -- ANC visits by women who delivered (donut breakdown) ------------------
  anc_livebirth_0: number
  anc_livebirth_1_4: number
  anc_livebirth_5_7: number
  anc_livebirth_8plus: number

  // -- MPCDSR ----------------------------------------------------------------
  Did_this_facility_co_his_reporting_period: YesNo

  // -- VGF -------------------------------------------------------------------
  Does_this_facility_provide_VGF: YesNo
  vgf_identified: number
  vgf_received_service: number
  ANC: number
  Delivery_service: number
  PNC: number
  FP_001: number
  VGF_GBV: number
  VGF_PAC: number

  // -- Emergency services ----------------------------------------------------
  transport_type: string
  ambulance_referrals: number
  Gender_Based_Violence_management_care: number
  Post_Abortion_Care: number
  Adolescent_Sexual_an_ealth_ASRH_service: number
  Obstetric_maternal_emergency_cases: number
  Newborn_neonatal_emergency_cases: number

  // -- Referrals -------------------------------------------------------------
  How_many_of_the_rece_rth_attendants_TBAs: number
  ref_other_hf: number

  // -- BHCPF -----------------------------------------------------------------
  bhcpf_received: YesNo
  bhcpf_full_amount: YesNo
  bhcpf_on_time: YesNo
  bhcpf_clients_total: number
  bhcpf_clients_female: number
  bhcpf_clients_adolescent: number

  // -- Staff (routine) -------------------------------------------------------
  How_many_skilled_bir_this_health_facility: number
  Anesthesiologists: number
  Obstetricians_Gynecologists: number
  Medical_Officers: number
  Nurses_Midwives: number

  // -- Revitalization & equipment receipt -----------------------------------
  Has_this_facility_been_revital: YesNoTitle | 'not_started'
  Is_there_documentati_ipt_of_the_equipment: YesNoTitle
  order_fulfilled: string

  // -- Commodity stocking status (19 fields, comm_status_* prefix) ----------
  comm_status_Oxytocin_injection: CommodityStatus
  comm_status_Carbetocin__Heat_Stable_Carbetocin: CommodityStatus
  comm_status_Misoprostol_tablet: CommodityStatus
  comm_status_Magnesium_sulfate_injection: CommodityStatus
  comm_status_Tranexamic_Acid_TXA: CommodityStatus
  comm_status_Injectable_contraceptives: CommodityStatus
  comm_status_Implants: CommodityStatus
  comm_status_Intra_Uterine_Contraceptive_Device_IUCD: CommodityStatus
  comm_status_Oral_contraceptives: CommodityStatus
  comm_status_Ceftriaxone: CommodityStatus
  comm_status_Azithromycin_tablets: CommodityStatus
  comm_status_Ibuprofen_tablets: CommodityStatus
  comm_status_HIV_post_exposure_prophylaxis_PEP: CommodityStatus
  comm_status_Emergency_contraceptive_pills: CommodityStatus
  comm_status_HIV_test_kits: CommodityStatus
  comm_status_Metronidazole_tablets: CommodityStatus
  comm_status_Calibrated_drapes: CommodityStatus
  comm_status_Oxy_Miso_combi_pack: CommodityStatus
  comm_status_Mifepristone_tablet: CommodityStatus

  // -- Escape hatch for the remaining ~300 columns we don't enumerate -------
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// --- Google Sheet: Governance ----------------------------------------------

/** One state's governance status (TWG, AOP, policy adoption). */
export interface GovernanceRow {
  State: string
  TWG_inaugurated: YesNo
  TWG_meeting_conducted: YesNo
  AOP_activities_completed: YesNo
  RH_policy_adopted: YesNo
  Adopted_VAPP_protocol: YesNo
  Stakeholders_trained_on_VCAT: YesNo
  STOP_guideline_adopted: YesNo
}

// --- Google Sheet: Facility Baseline Assessment ----------------------------

/**
 * One facility's one-time baseline assessment — infrastructure, equipment,
 * and HR counts. Static; changes rarely.
 *
 * The source sheet has technical column names in row 1 and human-friendly
 * display names in row 2; the function maps to the display names below.
 */
export interface FacilityBaselineRow {
  STATE: string
  LGA: string
  facility_name: string
  facility_type: string

  // Infrastructure
  Reliable_power_supply: AvailabilityTri
  Reliable_water_supply: AvailabilityTri
  Toilet: string
  Dedicated_SRH_Maternity_ward: string
  Operating_theater_CEmONC_only: string
  Blood_bank_CEmONC_only: string

  // Equipment
  Delivery_beds: string
  Neonatal_resuscitation_kit: string
  Vacuum_extractor_forceps: string
  Sterile_delivery_kit: string
  MVA_kits: string
  IUD_insertion_removal_tray: string
  Implant_insertion_removal_set: string
  BP_apparatus_stethoscope: string
  Autoclave_or_sterilizer: string
  Pregnancy_test_kits: string

  // HR (baseline counts — distinct from routine "Nurses_Midwives" combined)
  Obstetricians_Gynecologists: number
  Medical_Officers: number
  Nurses: number
  Midwives: number
  CHO: number
  SCHEW: number
  JCHEW: number
  Pharmacists: number
  Lab_Scientists: number

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// --- Google Sheet: Commodity Mapping ---------------------------------------

/** Maps a display name to the backend field suffix used in ODK. */
export interface CommodityMapping {
  CommodityName: string
  BackendName: string
  Category: 'Uterotonics' | 'Contraceptives' | 'Antibiotics' | 'Others'
}
