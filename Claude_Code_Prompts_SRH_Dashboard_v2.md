# Claude Code Prompts: SRH Dashboard Web App (Revised)

## How to Use These Prompts

Run these prompts **sequentially** in Claude Code. Each prompt builds on the previous one. Wait for each to complete before running the next. Replace `[PLACEHOLDER]` values with your actual credentials and IDs before running.

**Data Sources (4 total):**
1. **ODK Central** — daily routine submissions (OData API, live connection)
2. **Google Sheets: Governance** — TWG, policy adoption data by state (manual updates)
3. **Google Sheets: Commodity Mapping** — maps commodity display names to backend fields (rarely changes)
4. **Google Sheets: Facility Baseline Assessment** — one-time infrastructure, equipment, HR data per facility (static)

---

## PROMPT 0: Project Scaffolding

```
Create a new React + TypeScript project for an SRH (Sexual and Reproductive Health) Program Dashboard web app. This dashboard tracks SRH program implementation across health facilities in 8 Nigerian states.

Stack:
- React 18+ with TypeScript, Vite as build tool
- Tailwind CSS 3+ for styling
- Recharts for all charts (donut, bar, area, gauge-style)
- React Router v6 for page navigation
- Zustand for global filter state management
- date-fns for date formatting
- lucide-react for icons
- Netlify Functions for serverless backend (data fetching)

Initialize the project:

```bash
npm create vite@latest srh-dashboard -- --template react-ts
cd srh-dashboard
npm install tailwindcss @tailwindcss/vite recharts react-router-dom zustand date-fns lucide-react
npm install -D @netlify/functions
```

Project structure:

```
srh-dashboard/
├── netlify/
│   └── functions/          # Serverless backend functions
│       ├── odk-data.ts
│       ├── governance-data.ts
│       ├── commodity-mapping.ts
│       └── baseline-data.ts
├── src/
│   ├── components/
│   │   ├── ui/             # MetricCard, GaugeChart, SectionCard
│   │   ├── layout/         # Sidebar, FilterPanel, PageShell, TopNav
│   │   └── charts/         # DonutChart, HBarChart, StackedBarChart, AreaChart, GroupedBarChart, TreeTable
│   ├── pages/              # 8 page components
│   ├── hooks/              # useODKData, useGovernanceData, useBaselineData, useFilteredData
│   ├── lib/
│   │   ├── measures.ts     # All DAX-equivalent calculation functions
│   │   ├── constants.ts    # Targets, thresholds, indicator lists
│   │   └── types.ts        # TypeScript interfaces
│   ├── store/
│   │   └── filterStore.ts  # Zustand global filter state
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── logos/              # Partner logo images
├── netlify.toml
├── .env.example
└── package.json
```

Configure tailwind with this color palette (matching the existing Power BI dashboard's green theme):
- Primary dark green: #006B3F (sidebar, headers, nav)
- Accent green: #00A859 (positive values, stocked, charts)
- Light green bg: #E8F5E9 (section header backgrounds)
- Red accent: #E52834 (deaths, stockouts, warnings)
- Pink/rose: #F8D7DA (stockout bar segments)
- Orange warning: #FFF3CD (critical stock alerts)
- Dark text: #1A1A1A
- Muted text: #6B7280
- Card bg: #FFFFFF
- Page bg: #F0F4F0 (subtle sage tint)

Fonts: Import "Inter" for body and "Plus Jakarta Sans" for headings from Google Fonts. Add the @import to index.css.

Create netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  functionsPort = 9999

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
```

---

## PROMPT 1: TypeScript Types & Constants

```
In the srh-dashboard project, create the core type definitions and constants. These must be precise — they define every data shape the app uses.

FILE: src/lib/types.ts

1. **ODKSubmission** — one row from the monthly ODK routine tool. Key fields:

Metadata: __id (string), State (string), LGA (string), facility_name (string), facility_type (string: "BEmONC"|"CEmONC"), Reporting_month (string, e.g. "January"), Reporting_Month_Date (string, ISO date), submission_date (string, ISO date)

Enrollment & Insurance: women_enrolled_month (number), Of_the_newly_enrolle_ommunity_Big_Sisters (number), new_insured (number), insured_srh_clients (number), Public_insurance_NHIA (number), Private_insurance_HMO (number), Community_based_insurance (number), Other_types_of_insurance (number)

Family Planning: fp_total (number), fp_adolescent (number), How_many_of_these_wo_s_for_the_first_time (number), Oral_contraceptives (number), Intra_Uterine_Contraceptive_Device_IUCD (number), first_time_iucd (number), Injectable_contraceptives_sa (number), Injectable_contraceptives_fa (number), first_time_injectable (number), Implants (number), first_time_implant (number), Emergency_contraceptives (number)

PAC: How_many_women_and_girls_recei (number), pac_adolescent (number), pac_first_time (number), pac_mva (number), pac_medical_evac (number), mnh_adolescent_mva (number), Counselling_and_emotional_support (number), Administration_of_Ibuprofen_tablets (number), Administration_of_Ibuprofen_ta (number)

GBV: gbv_total (number), gbv_adolescent (number), gbv_first (number), Counselling_and_psyc_upport_for_survivors (number), HIV_post_exposure_prophylaxis_PEP (number), HIV_testing_and_screening_following_GBV (number), gbv_emergency_contraception (number), Administration_of_Metronidazole_tablets (number)

MNH: anc1_total (number), anc4_total (number), anc8_total (number), deliveries_total (number), cesarean_deliveries (number), vaginal_deliveries (number), partograph_used (number), How_many_vaginal_del_this_reporting_month (number), Oxytocin_injection (number), Carbetocin_Heat_Stable_Carbetocin (number), Misoprostol_Mifepristone_tablet (number), Ergometrine (number), Tranexamic_Acid_TXA (number), Magnesium_Sulfate (number), maternal_death_total (number), neonatal_death_total (number), How_many_deaths_were_audited (number), How_many_neonatal_deaths_were_audited (number), mnh_adolescent_deliveries (number), mnh_adolescent_cs (number), mnh_adolescent_vaginal (number)

ANC by women who delivered: anc_livebirth_0 (number), anc_livebirth_1_4 (number), anc_livebirth_5_7 (number), anc_livebirth_8plus (number)

MPCDSR: Did_this_facility_co_his_reporting_period (string: "yes"|"no")

VGF: Does_this_facility_provide_VGF (string: "yes"|"no"), vgf_identified (number), vgf_received_service (number), ANC (number), Delivery_service (number), PNC (number), FP_001 (number), VGF_GBV (number), VGF_PAC (number)

Emergency: transport_type (string), ambulance_referrals (number), Gender_Based_Violence_management_care (number), Post_Abortion_Care (number), Adolescent_Sexual_an_ealth_ASRH_service (number), Obstetric_maternal_emergency_cases (number), Newborn_neonatal_emergency_cases (number)

Referrals: How_many_of_the_rece_rth_attendants_TBAs (number), ref_other_hf (number)

BHCPF: bhcpf_received (string: "yes"|"no"), bhcpf_full_amount (string: "yes"|"no"), bhcpf_on_time (string: "yes"|"no"), bhcpf_clients_total (number), bhcpf_clients_female (number), bhcpf_clients_adolescent (number)

Staff: How_many_skilled_bir_this_health_facility (number), Anesthesiologists (number), Obstetricians_Gynecologists (number), Medical_Officers (number), Nurses_Midwives (number)

Revitalization & Equipment: Has_this_facility_been_revital (string: "Yes"|"No"|"not_started"), Is_there_documentati_ipt_of_the_equipment (string: "Yes"|"No"), order_fulfilled (string)

Commodities — for each of 19 commodities, a status field (string: "available"|"not_available"). Use this naming pattern: comm_status_Oxytocin_injection, comm_status_Carbetocin__Heat_Stable_Carbetocin, comm_status_Misoprostol_tablet, comm_status_Magnesium_sulfate_injection, comm_status_Tranexamic_Acid_TXA, comm_status_Injectable_contraceptives, comm_status_Implants, comm_status_Intra_Uterine_Contraceptive_Device_IUCD, comm_status_Oral_contraceptives, comm_status_Ceftriaxone, comm_status_Azithromycin_tablets, comm_status_Ibuprofen_tablets, comm_status_HIV_post_exposure_prophylaxis_PEP, comm_status_Emergency_contraceptive_pills, comm_status_HIV_test_kits, comm_status_Metronidazole_tablets, comm_status_Calibrated_drapes, comm_status_Oxy_Miso_combi_pack, comm_status_Mifepristone_tablet

Use `[key: string]: any` at the end to allow additional fields.

2. **GovernanceRow** — one state's governance data from Google Sheets:
   - State (string), TWG_inaugurated (string), TWG_meeting_conducted (string), AOP_activities_completed (string), RH_policy_adopted (string), Adopted_VAPP_protocol (string), Stakeholders_trained_on_VCAT (string), STOP_guideline_adopted (string)
   All "yes"/"no" values.

3. **FacilityBaselineRow** — one facility's baseline assessment from Google Sheets. Key fields:
   - STATE (string), LGA (string), facility_name (string), facility_type (string)
   - Reliable_power_supply (string: "yes"|"no"|"yes__occasionally")
   - Reliable_water_supply (string: "yes"|"no"|"yes__occasionally")
   - Toilet (string), Dedicated_SRH_Maternity_ward (string)
   - Operating_theater_CEmONC_only (string), Blood_bank_CEmONC_only (string)
   - Delivery_beds (string), Neonatal_resuscitation_kit (string)
   - Vacuum_extractor_forceps (string), Sterile_delivery_kit (string)
   - MVA_kits (string), IUD_insertion_removal_tray (string)
   - Implant_insertion_removal_set (string), BP_apparatus_stethoscope (string)
   - Autoclave_or_sterilizer (string), Pregnancy_test_kits (string)
   - Obstetricians_Gynecologists (number), Medical_Officers (number)
   - Nurses (number), Midwives (number)
   - CHO (number), SCHEW (number), JCHEW (number)
   - Pharmacists (number), Lab_Scientists (number)
   Use `[key: string]: any` at the end.

4. **CommodityMapping** — maps display name to backend field:
   - CommodityName (string), BackendName (string), Category (string: "Uterotonics"|"Contraceptives"|"Antibiotics"|"Others")

5. **FilterState** — global filter context:
   - state: string | "All"
   - lga: string | "All"
   - facilityName: string | "All"
   - facilityType: string | "All"
   - reportingMonth: string | "All"
   - searchFacility: string

FILE: src/lib/constants.ts

Define these:
- TARGETS: { totalFacilities: 250, assessedBEmONC: 230, empanelledCEmONC: 20, revitalizationTarget: 64, equipmentTarget: 64, commodityDistribution: 250 }
- COMMODITY_LIST: array of all 19 commodity names with their backend field suffixes and category
- INDICATOR_LIST: array of { label: string, category: string } for the Trend Analysis dropdown, covering: Assessed Facilities, Women Enrolled, Total ANC Clients, Total Deliveries, Vaginal Deliveries, C-Section Deliveries, Total Deaths, Maternal Deaths, Neonatal Deaths, FP Total, IUCD, Implants, Injectables, PAC Total, GBV Total, Total Adolescent Beneficiaries
- DEEP_DIVE_INDICATORS: ["Assessed Facilities", "BEmONCs with 4+ SBAs", "Clients Accessing BEmONC Care", "Clients Accessing CEmONC Care"]
- STATE_LIST: ["Akwa Ibom", "Benue", "Ekiti", "Enugu", "Katsina", "Osun", "Plateau", "Sokoto"]
- EQUIPMENT_LIST: array of all equipment items from the baseline assessment (Delivery beds, Neonatal resuscitation kit, Vacuum extractor, Sterile delivery kits, MVA kits, IUD insertion tray, Implant set, BP apparatus, Autoclave, Pregnancy test kits)
- INFRASTRUCTURE_LIST: ["Reliable power supply", "Reliable water supply", "Toilet", "Dedicated SRH/Maternity ward", "Operating theater", "Blood bank/Transfusion services"]
```

---

## PROMPT 2: Data Layer (Netlify Functions + React Hooks)

```
Create the data fetching layer for the SRH Dashboard. There are 4 data sources: ODK Central (live), Google Sheets Governance (manual), Google Sheets Commodity Mapping (static), and Google Sheets Facility Baseline (static).

PART A: NETLIFY FUNCTIONS

FILE: netlify/functions/odk-data.ts
- Fetches from ODK Central OData endpoint: https://odk.mine.bz/v1/projects/1239/forms/SRH%20Routine%20tool.svc/Submissions
- Uses Basic Auth with env vars: ODK_EMAIL, ODK_PASSWORD
- The OData response has a "value" array. Each submission may have nested group objects (group_da6ne51, group_ie83b74, etc.) — flatten all nested objects into a single flat object per row, preserving the leaf property names
- Implement in-memory cache with 15-minute TTL (module-level variable that persists across warm invocations)
- Add CORS headers (Access-Control-Allow-Origin: *)
- Fetch all records (handle OData pagination with @odata.nextLink if present)
- Return the flattened array as JSON
- Handle errors with appropriate HTTP status codes and error messages

FILE: netlify/functions/governance-data.ts
- Fetches from Google Sheets API v4
- Sheet ID from env var: GOVERNANCE_SHEET_ID
- API key from env var: GOOGLE_API_KEY
- Endpoint: https://sheets.googleapis.com/v4/spreadsheets/{SHEET_ID}/values/Sheet1!A:I?key={API_KEY}
- First row = headers, subsequent rows = data
- Map to GovernanceRow objects
- Cache for 1 hour
- Return JSON array

FILE: netlify/functions/commodity-mapping.ts
- Same pattern as governance but with env var: COMMODITY_SHEET_ID
- Map to CommodityMapping objects
- Cache for 24 hours (this data rarely changes)
- Return JSON array

FILE: netlify/functions/baseline-data.ts
- Same pattern as governance but with env var: BASELINE_SHEET_ID
- This is the Facility Baseline Assessment data — one-time infrastructure/equipment/HR data per facility
- The sheet has technical column headers in row 1 and display names in row 2. Use the display names as keys
- Map to FacilityBaselineRow objects — key fields: STATE, LGA, facility_name, facility_type, Reliable_power_supply, Reliable_water_supply, and all equipment/infrastructure columns, plus staff counts (Obstetricians, Medical Officers, Nurses, Midwives, CHO, SCHEW, JCHEW)
- Cache for 24 hours (this is static baseline data)
- Return JSON array

PART B: REACT HOOKS

FILE: src/hooks/useODKData.ts
- Fetches from /api/odk-data on mount
- Returns { data: ODKSubmission[], isLoading: boolean, error: Error | null, refetch: () => void }
- Auto-refetches every 15 minutes (setInterval)
- Stores lastUpdated timestamp

FILE: src/hooks/useGovernanceData.ts
- Same pattern, fetches from /api/governance-data
- Returns { data: GovernanceRow[], isLoading, error }

FILE: src/hooks/useBaselineData.ts
- Same pattern, fetches from /api/baseline-data
- Returns { data: FacilityBaselineRow[], isLoading, error }

FILE: src/hooks/useFilteredData.ts
- Takes raw ODKSubmission[] and the current FilterState from the Zustand store
- Returns a filtered array based on all active filters
- Applies cascading filter logic: LGA options depend on selected State, facility names depend on selected LGA
- Uses useMemo to memoize the filtered result
- Also returns: availableStates (string[]), availableLGAs (string[]), availableFacilities (string[]), availableMonths (string[]) — for populating filter dropdowns dynamically

FILE: src/store/filterStore.ts
- Zustand store with: state, lga, facilityName, facilityType, reportingMonth, searchFacility
- Actions: setFilter(key, value), resetFilters()
- All filters default to "All"
- When state changes, reset lga/facilityName to "All" (cascading)
- When lga changes, reset facilityName to "All"
```

---

## PROMPT 3: Measures Library

```
Create src/lib/measures.ts — the calculation engine that translates all Power BI DAX measures into JavaScript. This is the most critical file in the project.

Export individual measure functions and a master computeAllMeasures() function.

HELPER FUNCTIONS:

```typescript
const divide = (num: number, den: number, fallback = 0) => den !== 0 ? num / den : fallback;

const sumField = (data: ODKSubmission[], field: string) =>
  data.reduce((acc, row) => acc + (Number(row[field]) || 0), 0);

const countDistinct = (data: ODKSubmission[], field: string) =>
  new Set(data.map(r => r[field]).filter(Boolean)).size;

const countWhere = (data: ODKSubmission[], field: string, value: string) =>
  data.filter(r => String(r[field]).toLowerCase() === value.toLowerCase()).length;

const formatPctFraction = (num: number, den: number) => {
  if (den === 0) return "0% (0/0)";
  const pct = Math.round((num / den) * 100);
  return `${pct}% (${num.toLocaleString()}/${den.toLocaleString()})`;
};

const formatK = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);

const computeMoM = (current: number, previous: number) => {
  if (!previous || previous === 0) return { pct: 0, label: '▶ 0%' };
  const pct = (current - previous) / previous;
  const arrow = pct > 0 ? '▲' : pct < 0 ? '▼' : '▶';
  return { pct, label: `${arrow} ${Math.round(Math.abs(pct) * 100)}%` };
};
```

MEASURE GROUPS — implement ALL of these:

**1. COVERAGE**
- totalAssessedFacilities: countDistinct(data, 'facility_name')
- totalWomenEnrolled: sumField(data, 'women_enrolled_month')

**2. MNH (Maternal and Newborn Health)**
- totalANC1: sumField(data, 'anc1_total')
- totalANC4: sumField(data, 'anc4_total')
- totalANC8: sumField(data, 'anc8_total')
- totalANCClients: totalANC1 + totalANC4 + totalANC8
- totalDeliveries: sumField(data, 'deliveries_total')
- vaginalDeliveries: sumField(data, 'vaginal_deliveries')
- cesareanDeliveries: sumField(data, 'cesarean_deliveries')
- vaginalPctLabel: formatPctFraction(vaginal, totalDeliveries)
- cSectionPctLabel: formatPctFraction(cesarean, totalDeliveries)
- totalInFacilityDeaths: maternalDeaths + neonatalDeaths
- maternalDeaths: sumField(data, 'maternal_death_total')
- neonatalDeaths: sumField(data, 'neonatal_death_total')
- auditedMaternalDeaths: sumField(data, 'How_many_deaths_were_audited')
- auditedNeonatalDeaths: sumField(data, 'How_many_neonatal_deaths_were_audited')
- deliveriesWithUterotonics: For each row, take the MAX of (Oxytocin_injection, Carbetocin, Misoprostol, Ergometrine, TXA, MagSulfate), then SUM across rows. Or alternatively: count rows where any uterotonic was used
- deliveriesWithPartographs: sumField(data, 'partograph_used')
- deliveriesWithCalibratedDrapes: sumField(data, 'How_many_vaginal_del_this_reporting_month')
- For each of the above three: compute percentage against totalDeliveries, compute gap percentage (1 - pct)
- facilitiesConductingMPCDSR: countWhere(data, 'Did_this_facility_co_his_reporting_period', 'yes')
- ANC by women who delivered (for donut chart): sums of anc_livebirth_0 (None), anc_livebirth_1_4 (1st visit), anc_livebirth_5_7 (4th visit), anc_livebirth_8plus (8th+)

**3. FAMILY PLANNING**
- fpTotal: sumField(data, 'fp_total')
- fpAdolescents: sumField(data, 'fp_adolescent')
- fpFirstTime: sumField(data, 'How_many_of_these_wo_s_for_the_first_time')
- totalIUCD, iucdFirstTime, iucdReturning (total - firstTime)
- totalImplants, implantsFirstTime, implantsReturning
- totalInjectables (SA + FA), injectablesFirstTime, injectablesReturning
- oralContraceptives, emergencyContraceptives
- FP method data for bar chart: array of { name, value } for each method

**4. GBV**
- gbvTotal, gbvFirstTime, gbvAdolescents
- gbvFirstTimePctLabel: formatPctFraction(firstTime, total)
- counsellingPctLabel, pepPctLabel, hivTestingPctLabel, metronidazolePctLabel, emergencyContraceptivePctLabel — each as formatPctFraction against gbvTotal

**5. PAC**
- pacTotal, pacFirstTime, pacAdolescents
- pacMedical, pacSurgical
- pacFirstTimePctLabel, pacCounsellingPctLabel, pacAntibioticsPctLabel, pacContraceptivesPctLabel, pacAdolescentSurgicalPctLabel

**6. ASRH (Adolescent)**
- totalAdolescents: sum of mnh_adolescent + fp_adolescent + gbv_adolescent + pac_adolescent
- adolescentsByCategory: { MNH: number, FP: number, PAC: number, GBV: number } for bar chart

**7. COMMODITY AVAILABILITY** (for Overview and Service Delivery)
- For each of the 4 overview commodities (Carbetocin, Misoprostol, Oxy-Miso Combo, Oxytocin):
  - stockedCount: count rows where comm_status_[X] === "available"
  - stockedOutCount: total - stockedCount
  - Return as array of { category, stocked, stockedOut } for StackedBarChart
- Stock-out risk counts (for Service Delivery): noStock, criticalStock, warningStock — aggregate from commodity days-of-stock fields

**8. DEMAND GENERATION**
- referralsByBigSisters: sumField(data, 'Of_the_newly_enrolle_ommunity_Big_Sisters')
- referralsByTBAs: sumField(data, 'How_many_of_the_rece_rth_attendants_TBAs')
- referralsByOtherHFs: sumField(data, 'ref_other_hf')
- totalReferralsReceived: sum of all three
- referralReceivedPctLabel: formatPctFraction(received, totalReferred) — use actual data, not hardcoded 4200
- breakdownByType: { BigSisters, TBAs, OtherHFs } for donut and grouped bar

**9. GOVERNANCE** (separate function taking GovernanceRow[] + filtered ODK data)
- computeGovernanceMeasures(govData: GovernanceRow[], filteredODK: ODKSubmission[], stateFilter: string):
  - TWG: inaugurated count/total, meetings count/total, AOP count/total — each as "X% (N/8)" label
  - Policy: RH policy, VAPP, VCAT, STOP — each as "X% (N/8)" label
  - BHCPF (from ODK): receivedFunds, didNotReceive, receivedInFull, notInFull, receivedOnTime, notOnTime — as count pairs for donuts
  - BHCPF clients: total, female count, female % label, adolescent count, adolescent % label
  - Insurance breakdown: { NHIA, HMO, CommunityBased, Others } as sums for bar chart
  - VGF: providesVGF count, identifiedClients sum, receivedService sum, serviceBreakdown { ANC, Delivery, PNC, FP, GBV, PAC }
  - Women enrolled: sumField(filteredODK, 'women_enrolled_month')
  - Total insured: sumField(filteredODK, 'new_insured'), insuredPctLabel

**10. FACILITY FUNCTIONALITY** (separate function taking ODK data + Baseline data)
- computeFacilityFunctionalityMeasures(filteredODK: ODKSubmission[], baselineData: FacilityBaselineRow[], stateFilter: string):

  From ODK (routine data — changes monthly):
  - totalAssessedBEmONC: countDistinct filtered by facility_type === "BEmONC"
  - totalCEmONCHWs: sum of (Anesthesiologists + Obstetricians_Gynecologists + Medical_Officers + Nurses_Midwives) across rows
  - cEmONCStaffByType: { NursesMidwives, MedicalOfficers, Anaesthesiologists, Gynecologists } for bar chart
  - revitalizationStatus: { Completed: countWhere "Yes", Ongoing: countWhere "No", NotStarted: countWhere "not_started" }
  - commodityDistributionStatus: { yes: count, no: count } based on order_fulfilled
  - equipmentDistributionStatus: { FullyReceived, PartiallyReceived, NotReceived }
  - transportTypes: group by transport_type and count for bar chart
  - ambulanceReferrals: sumField(data, 'ambulance_referrals')
  - referralsByCase: { ASRH, GBV, Newborn, Obstetric, PAC } for bar chart
  - bemoncBySBACount: { "0", "1", "2", "3", "4+" } counts for donut chart, based on How_many_skilled_bir_this_health_facility

  From Baseline (static — infrastructure/equipment):
  - infrastructureAvailability: for each item in INFRASTRUCTURE_LIST, count facilities that have it vs don't
  - equipmentAvailability: for each item in EQUIPMENT_LIST, same
  - powerSupplyByFacility: { hasReliable, hasOccasional, hasNone } counts
  - waterSupplyByFacility: same pattern
  - facilitiesWithSBAs: count baseline facilities where total staff (Nurses + Midwives + Medical_Officers + Obstetricians) >= 4
  - staffDistributionBaseline: { Obstetricians, MedicalOfficers, Nurses, Midwives, CHO, SCHEW, JCHEW } totals

**11. MONTH-OVER-MONTH (MoM) CHANGES**
- Create a generic function: computeMoMForIndicator(allData: ODKSubmission[], measureFn: (data) => number)
  - Find the most recent month in the data
  - Filter data for that month → compute current value
  - Filter data for the previous month → compute previous value
  - Return computeMoM(current, previous)
- Apply to: Assessed facilities, ANC clients, Deliveries, Deaths, FP, IUCD, Implants, Injectables, GBV, PAC, Adolescents, CEmONC HWs

**12. TREND ANALYSIS**
- computeTrendData(allData: ODKSubmission[], indicatorName: string, filters: FilterState) → { month: string, value: number }[]
  - Group data by Reporting_Month_Date (month-year)
  - For each month, apply the selected indicator's measure function to that month's data
  - Return sorted array for the area chart
  - The indicatorName maps to the measure function via a switch/lookup

**13. FACILITY DEEPDIVE**
- computeDeepDiveData(filteredData: ODKSubmission[]) → nested tree
  - Group by State → LGA → facility_name
  - At each level compute: assessedFacilities (count distinct), bemoncWith4PlusSBAs (count where SBAs >= 4), clientsAccessingBEmONCCare (sum of fp+gbv+pac clients where facility_type="BEmONC"), clientsAccessingCEmONCCare (same for CEmONC)
  - Return as nested { name, children?, values } for TreeTable component
  - Include a totals object at the root level
```

---

## PROMPT 4: UI Component Library

```
Build the reusable UI components for the SRH Dashboard. The design should be significantly more polished than the original Power BI dashboard — cleaner spacing, consistent typography, subtle shadows, smooth transitions, professional healthcare aesthetic.

Design principles:
- Cards: white bg, border border-gray-100, rounded-xl, shadow-sm, hover:shadow-md transition
- Section headers: small uppercase tracking-wider text in muted green (#006B3F at 60% opacity), not giant bold text
- Values: large font-semibold numbers in dark text. MoM arrows colored green/red
- White and gray dominate; green accents punctuate sparingly
- Deaths/warnings in #E52834 red
- Consistent spacing rhythm: 12px / 16px / 24px / 32px
- All chart colors use the green palette with variations: #006B3F, #00A859, #66BB6A, #A5D6A7, #E8F5E9

COMPONENTS:

FILE: src/components/ui/MetricCard.tsx
Props: title (string), value (string|number), subtitle? (string, e.g. MoM label), subtitleColor? ("green"|"red"|"neutral"), format? ("number"|"raw"), size? ("sm"|"md"|"lg"), onClick? (() => void)
- Compact card, title on top (text-xs uppercase tracking-wide text-gray-500), large value centered (text-2xl font-bold), subtitle below value with colored text
- Subtle fade-in animation on mount
- If onClick provided, show a pointer cursor and "Click to deep dive" text at bottom

FILE: src/components/ui/GaugeChart.tsx
Props: value (number), max (number), target? (number), label? (string), color? (string)
- SVG semi-circular arc gauge
- Show value number centered below the arc
- Mark target with a small indicator tick if provided
- Animate arc fill on mount using CSS transition

FILE: src/components/ui/SectionCard.tsx
Props: title (string), headerColor? (string, default "#E8F5E9"), children (ReactNode), onClick? (() => void)
- Card with a colored header strip at top containing the section title
- Clean white body below with the children
- Rounded corners, subtle border

FILE: src/components/charts/DonutChart.tsx
Props: data ({ name, value, color? }[]), size? (number, default 200), innerRadius? (number, default 50), showLabels? (boolean), centerLabel? (string), centerValue? (string)
- Recharts PieChart wrapper
- Labels show count and percentage outside
- Optional center text (e.g. "737 (78%)")

FILE: src/components/charts/HBarChart.tsx
Props: data ({ name, value, color? }[]), showValues? (boolean)
- Horizontal bar chart using Recharts BarChart with layout="vertical"
- Value labels at end of each bar
- Green color default

FILE: src/components/charts/StackedBarChart.tsx
Props: data ({ category, stocked, stockedOut }[]), colors? ({ stocked, stockedOut })
- 100% stacked column chart
- Default colors: stocked=#00A859, stockedOut=#F8D7DA
- Show percentage labels inside each segment

FILE: src/components/charts/AreaChartComponent.tsx
Props: data ({ month, value }[]), color? (string), showDataLabels? (boolean), title? (string)
- Recharts AreaChart with gradient fill
- Data point labels showing values
- Green gradient fill (#00A859 to transparent)
- Smooth curve type

FILE: src/components/charts/GroupedBarChart.tsx
Props: data ({ category, values: { name, value, color? }[] }[])
- Side-by-side grouped bars
- Legend at top

FILE: src/components/charts/TreeTable.tsx
Props: data (nested tree), columns ({ key, label }[]), expandable (boolean)
- Expandable hierarchical table: State → LGA → Facility
- Expand/collapse chevron icons (lucide-react ChevronRight/ChevronDown)
- State rows: bold, light green background
- LGA rows: semi-bold, white background
- Facility rows: normal weight, white, slightly indented
- Sticky header row
- Totals row at bottom with bold values
- Horizontal scrolling on mobile

FILE: src/components/layout/FilterPanel.tsx
- Left sidebar filter panel using the Zustand filter store
- Dark green background (#006B3F) with white labels
- Custom-styled select dropdowns
- Filters: State, LGA, Facility name, Facility type, Reporting month
- Text search input for "Search facility name"
- Cascading: LGA depends on State, Facility depends on LGA
- "Reset all" button at bottom
- Collapsible on mobile (slide-out drawer with overlay)

FILE: src/components/layout/PageShell.tsx
Props: children (ReactNode), title? (string), showFilters? (boolean, default true), filterVariant? ("default"|"facility") — "facility" uses Commodity/LGA/Facility/Type/MonthYear instead of the standard set
- Renders: FilterPanel on left (when showFilters=true), TopNav at top, main content area
- Responsive: sidebar collapses on < 1024px

FILE: src/components/layout/TopNav.tsx
- Horizontal navigation bar
- Tabs: Home, Overview, Service Delivery, Demand Generation, Facility Functionality, Governance, Trend Analysis, Facility Deepdive
- Active tab: green underline accent
- Shows "Last updated: X min ago" on the right
- "Reporting period: [Month Year]" badge
- Hamburger menu on mobile

FILE: src/components/ui/StateBreakdownTooltip.tsx
Props: data ({ state, value }[]), title (string), isOpen (boolean), onClose (() => void)
- Modal/popover that shows a horizontal bar chart breaking down a metric by state
- Used when clicking on cards that support "by state" breakdowns
- Slide-in animation, backdrop overlay
```

---

## PROMPT 5: Pages — Overview + Service Delivery

```
Build the Overview and Service Delivery pages. These are the two densest pages.

FILE: src/pages/OverviewPage.tsx

Use the useODKData hook, useFilteredData for applying filters, and computeAllMeasures for calculations. Layout with CSS grid, responsive.

SECTION 1 — TOP ROW:
- Coverage: GaugeChart (totalAssessedFacilities / 250), "Click to deep dive" link → /facility-deepdive
- Facility functionality: Two small gauges — CEmONC empanelled (value/20), L2 BEmONC (value/64). Show 0 if data is blank.

SECTION 2 — MAIN KPIs:
- MNH (SectionCard title="Maternal and newborn health (MNH)"):
  - Row: ANC clients card (totalANCClients, formatted as "14K", MoM label), DonutChart (ANC1/ANC4/ANC8)
  - Row: Deliveries card (totalDeliveries, MoM), Vaginal card (vaginalPctLabel), C-section card (cSectionPctLabel)
  - Row: Deaths (red) — Total deaths, Maternal, Neonatal + Audited counts
  - "Click here to deep dive" link

- FP (SectionCard title="Family planning (FP)"):
  - Total clients card (fpTotal, MoM)
  - Three sub-cards: IUCD (with MoM), Implants (with MoM), Injectables (with MoM)
  - Toggle buttons: IUCD | Implants | Injectables — switches which DonutChart shows (first-time vs returning)

- ASRH:
  - Total adolescent clients card (totalAdolescents, MoM)
  - HBarChart showing MNH/FP/PAC/GBV adolescent counts

SECTION 3 — BOTTOM ROW:
- GBV: Total clients, MoM, First-time %
- PAC: Total clients, MoM, First-time %
- Commodity availability: StackedBarChart (stocked vs stockedOut) for 4 commodities. Category slicer buttons: Uterotonics | Contraceptives | Antibiotics | Others

FILE: src/pages/ServiceDeliveryPage.tsx

LAYOUT — LEFT COLUMN:
- MNH: Deliveries card (MoM), StackedBarChart showing uterotonics/partographs/calibrated drapes (each bar: "Used" vs "Not used" percentages)
- ANC by women who delivered: DonutChart (1st visit/4th/8th/None percentages)
- MPCDSR: facilities conducting count (or "--" if blank)

RIGHT COLUMN TOP:
- FP: Total clients card (MoM), HBarChart of all contraceptive methods (Oral, IUCD, Injectables SA, Injectables FA, Implants, Emergency)

FAR RIGHT:
- Facilities at risk of stock out: Three severity cards — No stock (red), Critical <30 days (red), Warning <60 days (orange-yellow). "Click to deep dive" link

BOTTOM LEFT:
- GBV section: Total clients, First-time %, Counselling %, PEP %, HIV testing %, Metronidazole %, Emergency contraceptives %

BOTTOM RIGHT:
- PAC section: Total clients, MoM, DonutChart (Medical vs Surgical), Adolescents surgical %, Contraceptives %, Antibiotics %, Counselling donut (Yes/No)
```

---

## PROMPT 6: Pages — Remaining 6

```
Build the remaining 6 pages.

FILE: src/pages/HomePage.tsx
- Clean landing page
- Title: "Progress Dashboard for SRH Program Implementation"
- Date stamp: "as @ [today's date]" formatted with date-fns
- 5 navigation cards in a grid: Overview, Service Delivery, Facility Functionality, Demand Generation, Governance — each with a Lucide icon, 1-line description, and onClick → router navigation
- Also include Trend Analysis and Facility Deepdive as smaller secondary cards
- Partner logos at bottom: "SWAP • [State Government] • Federal Ministry of Health" (use text or img tags if logo files exist in /public/logos/)
- Spacious, premium feel — NO clip art or hexagons. Use a clean gradient or abstract pattern

FILE: src/pages/DemandGenerationPage.tsx
- Referrals: Total referred card, % received in facilities (formatPctFraction)
- DonutChart: breakdown by type (Big Sisters, TBAs, Other HFs)
- GroupedBarChart: referred vs received for each source
- Big Sisters section: total card
- Line-listed clients: pregnant women line-listed, referred to HFs (show "--" if blank)

FILE: src/pages/FacilityFunctionalityPage.tsx
This page uses BOTH ODK data AND Baseline data. It also has a DIFFERENT filter set — Commodity, LGA, Facility, Facility Type, Month Year. Use filterVariant="facility" on the PageShell.

Call computeFacilityFunctionalityMeasures(filteredODK, baselineData, stateFilter).

LAYOUT:
- Human resource for health (from ODK):
  - GaugeChart: Total assessed BEmONCs (value/230)
  - Card: Total CEmONC HWs with MoM
  - DonutChart: BEmONCs by SBA count (0/1/2/3/4+) with red→yellow→green scale
  - HBarChart: CEmONC staff by type

- Infrastructure, equipment, and commodities (MIX of ODK + Baseline):
  - Three target cards: BEmONC prioritized for revitalization (64), Commodity distribution (250), Equipment distribution (64)
  - Three DonutCharts: Revitalization status (Completed/Ongoing/NotStarted from ODK), Commodity distribution (Yes/No from ODK), Equipment distribution (Fully/Partially/Not received from ODK)
  - Infrastructure availability section (from Baseline): show counts/percentages for power supply, water supply across facilities

- Emergency services (from ODK):
  - Bar chart: Transport type across facilities
  - Card: Ambulance referrals
  - Bar chart: Referrals by case type (ASRH, GBV, Newborn, Obstetric, PAC)

- Training section: "Total health workers trained" and "NPHCDA eLearning" — show "--" if data not available

FILE: src/pages/GovernancePage.tsx
Uses BOTH ODK data (BHCPF, insurance, VGF) and Google Sheets governance data (TWG, policy).

- RMNCAH TWG: Inaugurated (X/8), Meetings (X/8), AOP activities (X/8)
- BHCPF Funding: Three DonutCharts — received funds (yes/no), in full (yes/no), on time (yes/no)
- BHCPF clients: total, female % label, adolescent % label
- Policy adoption: RH policy (X/8), VAPP (X/8), VCAT (X/8), STOP (X/8)
- Policy training: Law enforcement, Religious leaders (show "--")
- Insurance & VGF: Women enrolled, VGF facilities, Total insured % label, VGF clients, Received SRH services %, Subsidized care %
- HBarChart: Insurance type (NHIA, HMO, Community, Others)
- HBarChart: Subsidized services (ANC, Delivery, PNC, FP, GBV, PAC, Other)

FILE: src/pages/TrendAnalysisPage.tsx
- Dropdown at top: "Select an indicator" — from INDICATOR_LIST
- AreaChartComponent showing selected indicator values over time (monthly)
- Data labels on chart
- Chart title updates to show selected indicator name
- Uses computeTrendData()
- Green gradient fill (#00A859)

FILE: src/pages/FacilityDeepDivePage.tsx
- TreeTable: State → LGA → Facility hierarchy
- Columns: Assessed Facilities, BEmONCs with 4+ SBAs, Clients Accessing BEmONC Care, Clients Accessing CEmONC Care
- Expandable/collapsible rows
- Totals row at bottom
- Uses computeDeepDiveData()
```

---

## PROMPT 7: Routing, Polish & Responsive Design

```
Wire everything together and polish the SRH Dashboard.

FILE: src/App.tsx
Set up React Router:
  / → HomePage
  /overview → OverviewPage
  /service-delivery → ServiceDeliveryPage
  /demand-generation → DemandGenerationPage
  /facility-functionality → FacilityFunctionalityPage
  /governance → GovernancePage
  /trend-analysis → TrendAnalysisPage
  /facility-deepdive → FacilityDeepDivePage

Wrap in a DataProvider component that:
- Fetches ODK, governance, baseline data on mount using the hooks
- Provides data via React Context to all pages
- Shows a global loading skeleton while initial data loads
- Shows error state with retry button if any fetch fails

RESPONSIVE DESIGN:
- Desktop (1280px+): Full sidebar + content
- Tablet (768-1279px): Collapsible sidebar, toggle button
- Mobile (<768px): No sidebar. Filters in a slide-out drawer (hamburger button). Cards stack to 1-2 column grid. Charts go full-width. TreeTable scrolls horizontally.

STATE BREAKDOWN TOOLTIPS:
The original Power BI has ~40 tooltip pages showing "by state" breakdowns on hover. Convert these to:
- Clickable metric cards that open a StateBreakdownTooltip modal
- The modal shows a HBarChart with the metric broken down by State
- Implement for: ANC clients, Deliveries, Deaths, FP clients, IUCD, Implants, Injectables, GBV, PAC, Adolescents — all "by state" breakdowns
- Group the source data by State and compute the measure for each state

LOADING STATES:
- Skeleton placeholders (gray pulsing rectangles) for cards and charts while loading
- Subtle spinner in TopNav during refetch
- Error state with descriptive message and retry button

ANIMATIONS:
- Cards: staggered fade-in on page mount (using CSS animation-delay)
- Charts: Recharts built-in animation (isAnimationActive)
- Page transitions: subtle opacity fade
- Filter changes: brief opacity pulse on affected metric cards

FINAL POLISH:
- "Last updated: X minutes ago" in TopNav
- "Reporting period: [Month Year]" badge (matches Power BI)
- Number formatting: use toLocaleString() for comma separators
- Proper <title> meta tags per page
- Favicon: simple green medical cross
- Add aria-labels for accessibility on interactive elements
```

---

## PROMPT 8: Deployment & Testing

```
Prepare the SRH Dashboard for Netlify deployment.

FILE: .env.example
```
# ODK Central credentials
ODK_EMAIL=your-odk-email@example.com
ODK_PASSWORD=your-odk-password

# Google Sheets API
GOOGLE_API_KEY=your-google-api-key

# Google Sheet IDs
GOVERNANCE_SHEET_ID=your-governance-sheet-id
COMMODITY_SHEET_ID=your-commodity-mapping-sheet-id
BASELINE_SHEET_ID=your-facility-baseline-sheet-id
```

FILE: netlify.toml (verify/update):
- Build settings
- SPA fallback redirects for React Router
- Function configuration
- Headers for caching

FILE: README.md with:
- Project overview: SRH Program Implementation Dashboard
- Architecture diagram (text-based)
- Setup instructions for local development
- How to configure environment variables in Netlify
- How to obtain ODK Central credentials
- How to get a Google Sheets API key
- How to find Google Sheet IDs
- Deployment steps

FILE: .gitignore
- node_modules, dist, .env, .netlify, *.local

Pre-deployment checks:
1. Run `npm run build` — fix any TypeScript errors
2. Verify all imports resolve correctly
3. Test locally with `npx netlify dev` — verify API functions work
4. Test with different filter combinations
5. Test responsive layout at 375px, 768px, 1280px, 1920px widths
```

---

## Running Order & Tips

1. **Prompts 0–2**: Foundation. Run these first. Fix any compilation errors before moving on.
2. **Prompt 3**: The measures library. This is the biggest and most important. Test individual measure functions with sample data.
3. **Prompt 4**: UI components. Test each component in isolation.
4. **Prompts 5–6**: The actual pages. These will likely need iteration — some measure names may not match, some layouts need tweaking. Fix as you go.
5. **Prompt 7**: Polish pass. Run after the core pages are working.
6. **Prompt 8**: Deployment prep. Run last.

After each prompt, run `npm run dev` to test locally.

### Environment Variables Needed:
1. **ODK_EMAIL** and **ODK_PASSWORD** — ODK Central login credentials with API access
2. **GOOGLE_API_KEY** — Google Cloud API key with Sheets API enabled
3. **GOVERNANCE_SHEET_ID** — Google Sheet ID for governance data
4. **COMMODITY_SHEET_ID** — Google Sheet ID for commodity mapping
5. **BASELINE_SHEET_ID** — Google Sheet ID for facility baseline assessment

### ODK OData Endpoint:
`https://odk.mine.bz/v1/projects/1239/forms/SRH%20Routine%20tool.svc`
