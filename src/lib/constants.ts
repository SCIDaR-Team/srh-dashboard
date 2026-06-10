/**
 * Constants for the SRH Program Dashboard.
 *
 * Split into:
 *   1. Chart-chrome — brand palette, categorical series colours, nav (used
 *      by the layout / chart wrappers).
 *   2. Domain — program targets, reference lists for states / commodities /
 *      indicators / equipment / infrastructure (used by measures + pages).
 *
 * Targets follow the original Power BI dashboard. They are program-wide
 * benchmarks across the 8 supported states and may need refresh per cycle.
 */

import type { CommodityMapping } from './types'

// ===========================================================================
// 1. CHART CHROME
// ===========================================================================

/** Brand palette, kept in sync with tailwind.config.ts so chart libraries
 *  (which can't read Tailwind classes) still receive the right colours. */
export const COLORS = {
  primary: '#006B3F',
  accent: '#00A859',
  lightGreen: '#E8F5E9',
  danger: '#E52834',
  rose: '#FFC0CB',
  warning: '#FFE4B5',
  ink: '#1A1A1A',
  muted: '#6B7280',
  card: '#FFFFFF',
  page: '#F0F4F0',
} as const

/** Ordered palette for categorical series (donut slices, stacked bars). */
export const CHART_SERIES_COLORS = [
  '#006B3F',
  '#00A859',
  '#4FB286',
  '#8FD3B6',
  '#FFC0CB',
  '#FFE4B5',
  '#E52834',
  '#6B7280',
] as const

/** Top-level navigation. Routes mirror Claude_Code_Prompts_SRH_Dashboard_v2. */
export const PAGES = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/overview', label: 'Overview', icon: 'LayoutDashboard' },
  { path: '/service-delivery', label: 'Service Delivery', icon: 'HeartPulse' },
  { path: '/demand-generation', label: 'Demand Generation', icon: 'Megaphone' },
  { path: '/facility-functionality', label: 'Facility Functionality', icon: 'Building2' },
  { path: '/governance', label: 'Governance', icon: 'ShieldCheck' },
  { path: '/trend-analysis', label: 'Trend Analysis', icon: 'TrendingUp' },
  { path: '/facility-deepdive', label: 'Facility Deepdive', icon: 'Layers' },
] as const

// ===========================================================================
// 2. DOMAIN
// ===========================================================================

// --- Program targets / benchmarks ------------------------------------------
//
// Source: original Power BI dashboard (hardcoded numerator targets in
// .bim file). Adjust per cycle as the project scope evolves.
export const TARGETS = {
  totalFacilities: 250,
  assessedBEmONC: 230,
  empanelledCEmONC: 20,
  revitalizationTarget: 64,
  equipmentTarget: 64,
  commodityDistribution: 250,
} as const

// --- Supported states (8 Nigerian states) ----------------------------------
//
// Verified against live ODK Central data (June 2026): the form's STATE
// column contains exactly these 8 values. This is used as the fallback
// shown in the State dropdown before the ODK fetch completes; once data
// loads, useFilteredData derives the dropdown from `data.State` directly.
export const STATE_LIST = [
  'Akwa Ibom',
  'Benue',
  'Ekiti',
  'Enugu',
  'Kebbi',
  'Ondo',
  'Taraba',
  'Zamfara',
] as const

export type SRHState = (typeof STATE_LIST)[number]

// --- Commodity master list (19 commodities) --------------------------------
//
// `BackendName` is the suffix that follows `comm_status_` in the ODK
// payload (e.g. `comm_status_Oxytocin_injection`). Display names follow
// the original Power BI dashboard conventions.
//
// NOTE: Carbetocin's commodity-status field uses a DOUBLE underscore
// (`Carbetocin__Heat_Stable_Carbetocin`) while the MNH-usage field uses
// a single (`Carbetocin_Heat_Stable_Carbetocin`). Both are intentional.
export const COMMODITY_LIST: CommodityMapping[] = [
  // Uterotonics
  { CommodityName: 'Oxytocin', BackendName: 'Oxytocin_injection', Category: 'Uterotonics' },
  { CommodityName: 'Carbetocin (Heat Stable)', BackendName: 'Carbetocin__Heat_Stable_Carbetocin', Category: 'Uterotonics' },
  { CommodityName: 'Misoprostol', BackendName: 'Misoprostol_tablet', Category: 'Uterotonics' },
  { CommodityName: 'Magnesium Sulfate', BackendName: 'Magnesium_sulfate_injection', Category: 'Uterotonics' },
  { CommodityName: 'Tranexamic Acid (TXA)', BackendName: 'Tranexamic_Acid_TXA', Category: 'Uterotonics' },
  { CommodityName: 'Mifepristone', BackendName: 'Mifepristone_tablet', Category: 'Uterotonics' },
  { CommodityName: 'Oxy-Miso Combo Pack', BackendName: 'Oxy_Miso_combi_pack', Category: 'Uterotonics' },

  // Contraceptives
  { CommodityName: 'Injectable Contraceptives', BackendName: 'Injectable_contraceptives', Category: 'Contraceptives' },
  { CommodityName: 'Implants', BackendName: 'Implants', Category: 'Contraceptives' },
  { CommodityName: 'IUCD', BackendName: 'Intra_Uterine_Contraceptive_Device_IUCD', Category: 'Contraceptives' },
  { CommodityName: 'Oral Contraceptives', BackendName: 'Oral_contraceptives', Category: 'Contraceptives' },
  { CommodityName: 'Emergency Contraceptive Pills', BackendName: 'Emergency_contraceptive_pills', Category: 'Contraceptives' },

  // Antibiotics
  { CommodityName: 'Ceftriaxone', BackendName: 'Ceftriaxone', Category: 'Antibiotics' },
  { CommodityName: 'Azithromycin', BackendName: 'Azithromycin_tablets', Category: 'Antibiotics' },
  { CommodityName: 'Metronidazole', BackendName: 'Metronidazole_tablets', Category: 'Antibiotics' },

  // Others
  { CommodityName: 'Ibuprofen', BackendName: 'Ibuprofen_tablets', Category: 'Others' },
  { CommodityName: 'HIV PEP', BackendName: 'HIV_post_exposure_prophylaxis_PEP', Category: 'Others' },
  { CommodityName: 'HIV Test Kits', BackendName: 'HIV_test_kits', Category: 'Others' },
  { CommodityName: 'Calibrated Drapes', BackendName: 'Calibrated_drapes', Category: 'Others' },
]

/** Distinct commodity categories used by the Overview commodity slicer. */
export const COMMODITY_CATEGORIES = [
  'Uterotonics',
  'Contraceptives',
  'Antibiotics',
  'Others',
] as const

export type CommodityCategory = (typeof COMMODITY_CATEGORIES)[number]

// --- Indicator list (drives the Trend Analysis dropdown) -------------------
export const INDICATOR_LIST = [
  { label: 'Assessed Facilities', category: 'Coverage' },
  { label: 'Women Enrolled', category: 'Coverage' },
  { label: 'Total ANC Clients', category: 'MNH' },
  { label: 'Total Deliveries', category: 'MNH' },
  { label: 'Vaginal Deliveries', category: 'MNH' },
  { label: 'C-Section Deliveries', category: 'MNH' },
  { label: 'Total Deaths', category: 'Deaths' },
  { label: 'Maternal Deaths', category: 'Deaths' },
  { label: 'Neonatal Deaths', category: 'Deaths' },
  { label: 'FP Total', category: 'FP' },
  { label: 'IUCD', category: 'FP' },
  { label: 'Implants', category: 'FP' },
  { label: 'Injectables', category: 'FP' },
  { label: 'PAC Total', category: 'PAC' },
  { label: 'GBV Total', category: 'GBV' },
  { label: 'Total Adolescent Beneficiaries', category: 'ASRH' },
] as const

export type IndicatorLabel = (typeof INDICATOR_LIST)[number]['label']

// --- Facility Deepdive columns ---------------------------------------------
export const DEEP_DIVE_INDICATORS = [
  'Assessed Facilities',
  'BEmONCs with 4+ SBAs',
  'Clients Accessing BEmONC Care',
  'Clients Accessing CEmONC Care',
] as const

// --- Baseline assessment reference lists -----------------------------------
//
// Human-readable items shown in the Facility Functionality page. The
// canonical mapping back to FacilityBaselineRow keys lives in the
// measures library (added in PROMPT 3).
export const EQUIPMENT_LIST = [
  'Delivery beds',
  'Neonatal resuscitation kit',
  'Vacuum extractor',
  'Sterile delivery kits',
  'MVA kits',
  'IUD insertion tray',
  'Implant set',
  'BP apparatus',
  'Autoclave',
  'Pregnancy test kits',
] as const

export const INFRASTRUCTURE_LIST = [
  'Reliable power supply',
  'Reliable water supply',
  'Toilet',
  'Dedicated SRH/Maternity ward',
  'Operating theater',
  'Blood bank/Transfusion services',
] as const
