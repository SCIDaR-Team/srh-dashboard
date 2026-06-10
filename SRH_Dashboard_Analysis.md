# SRH Program Dashboard → Web App: Complete Analysis

## 1. Project Summary

**What:** Convert an 8-page Power BI dashboard ("Progress Dashboard for SRH Program Implementation") into a modern, aesthetically improved web application deployed on Netlify.

**Who built the original:** Dennis Agbo (based on file paths in the .bim)

**Data sources:**
- **ODK Central** (daily updates, live connection) — OData endpoint: `https://odk.mine.bz/v1/projects/1239/forms/SRH%20Routine%20tool.svc`
- **Google Sheets** (less frequent, manual updates) — Governance data + Commodity mapping table  

**Partner logos:** SWAP, a state government seal, Federal Ministry of Health

---

## 2. Data Model Summary

### 2.1 Core Tables

| Table | Source | Columns | Role |
|-------|--------|---------|------|
| **Revised routine tool** | ODK (OData/M query) | 432 | Main fact table — all facility-level monthly submissions |
| **Governance data** | Excel → Google Sheets | 9 | TWG, policy adoption, AOP by state |
| **Mapping** | Excel → Google Sheets | 5 | Commodity name ↔ backend field mapping |
| **Dim_Calendar** | DAX calculated | 9 | Date dimension (Mar–Dec 2026) |
| **Monthly Commodity Analysis** | DAX calculated | 67 | Pivoted commodity status per facility |
| **Facility Risk Summary Table** | DAX calculated | 4 | Stock risk per facility/commodity |
| **Month Table** | DAX calculated | 2 | Reporting month lookup |
| **States slicer** | DAX calculated | 1 | Distinct state list |

Plus ~15 small lookup/slicer tables for UI elements (CEmONC staff types, referral types, insurance types, commodity groups, indicator selectors, etc.)

### 2.2 Phantom Tables (referenced in measures but missing from model)

- **'Routine data_clean'** — Referenced in ~30 measures. Likely an earlier name for 'Revised routine tool' or a hidden intermediate M query step. Column names overlap with 'Revised routine tool'.
- **'Magic happened here'** — Referenced in commodity stocking measures. Likely a hidden calculated table for commodity status pivoting.
- **'Dataset'** — Referenced only in commented-out/old measures. Safe to ignore.

**Action needed:** When building the web app, all measures referencing these phantom tables need to be mapped to their actual source columns in 'Revised routine tool'.

### 2.3 Key Relationships

- `Revised routine tool[State]` → `States slicer[State]` (filter panel)
- `Revised routine tool[Reporting month]` → `Month Table[Reporting Month]` (month filter)
- `Revised routine tool[State]` → `Governance data[State]` (**INACTIVE** — used with USERELATIONSHIP)
- `Monthly Commodity Analysis[Commodity]` → `Unique commodities[Commodity]`
- `Commodity Status Table[Category]` ↔ `Mapping[Category]` (bidirectional)

### 2.4 The Main Fact Table ('Revised routine tool')

432 columns organized into these domains:

**Metadata (cols 1–20):** Submission ID, dates, collector name, state, LGA, facility name, facility type, reporting month

**Enrollment & Insurance (cols 21–29):** Women enrolled, Big Sisters referrals, insured clients, insurance type breakdown (NHIA, HMO, community, other)

**Family Planning (cols 30–43):** FP total, adolescent, first-time, PPFP, contraceptive methods (oral, IUCD, injectables SA/FA, implants, emergency, permanent)

**Post-Abortion Care (cols 44–54):** PAC total, adolescent, first-time, MVA, medical evac, counseling, antibiotics, contraceptives

**Gender-Based Violence (cols 55–68):** GBV total, types (physical, rape, psychological), services (PEP, HIV testing, emergency contraception, metronidazole, counseling, referral)

**ANC & MNH (cols 69–104):** ANC visits (1st, 4th, 8th), deliveries (expected, total, adolescent, vaginal, C-section), partograph use, uterotonic drugs, ANC by live birth, maternal deaths by cause, neonatal deaths by cause

**Maternal & Neonatal Deaths (cols 105–131):** Death counts, causes, audits, MPCDSR

**VGF (cols 132–144):** VGF provision, enrollment, services received

**Emergency & Referrals (cols 145–172):** Transport type, ambulance use, referral breakdowns by case type, referral outcomes

**Commodities (cols 173–402):** For each of 19 commodities: status, ever stocked, stockout reason, AMC, daily consumption rate, current quantity, days of stock. Commodities: Oxytocin, Carbetocin, Misoprostol, Mifepristone, Magnesium Sulfate, Tranexamic Acid, Injectables, Implants, IUCD, Oral contraceptives, Ceftriaxone, Azithromycin, Ibuprofen, HIV PEP, Emergency contraceptive pills, HIV test kits, Metronidazole, Calibrated drapes, Oxy-Miso combo

**Facility Infrastructure (cols 403–426):** Revitalization status, empanelment, equipment receipt, BHCPF funding, SBA counts by type, data review

**Geolocation (cols 427–429):** Longitude, Latitude, Altitude

**Computed (cols 430–432):** Month Sort, Reporting Month Date, Facility Stock Status

---

## 3. Measures Analysis (290 Total)

### 3.1 Measure Complexity Breakdown

**Simple SUMs (~80 measures):** Direct column aggregations
- `FP = SUM('Revised routine tool'[fp_total])`
- `GBV = SUM('Revised routine tool'[gbv_total])`
- `Total IUCD clients = SUM('Revised routine tool'[Intra_Uterine_Contraceptive_Device_IUCD])`

**Formatted Labels (~30 measures):** Return "X% (N/D)" strings
- Pattern: `FORMAT(pct, "0%") & " (" & Numerator & "/" & Denominator & ")"`

**CALCULATE with Filters (~40 measures):** Conditional counting
- `Received BHCPF Funds = CALCULATE([Total assessed facilities], ...[bhcpf_received] = "yes")`

**SWITCH dispatchers (~15 measures):** Dynamic values based on slicer selection
- `CEmONC staff Count`, `FP commodity Count`, `Insurance type Count`, `BEmONC SBA count`

**Month-over-Month (~24 measures):** DATEADD-based comparisons
- Pattern: Calculate current, calculate previous month using DATEADD, compute % change, format with arrow

**Complex commodity measures (~30 measures):** SWITCH over 19 commodities for stocking status
- `Stocked %`, `Stocked Facilities`, `Stocked Out Facilities`
- These are the most complex — long SWITCH statements with 19 branches

**SVG-generating measures (3 measures):** Generate inline SVG for visual elements
- `Master_Alert_Row_SVG`, `Neonatal_Death_Action_SVG`, `Maternal_Death_Action_SVG`

**BLANK/hardcoded (~15 measures):** Placeholder or static values
- `Total clients referred to facilities = {4200}` (hardcoded)
- `# Referred (Dummy)` uses hardcoded values per referral source

**Indicator Selectors (2 large measures):** `Selected Indicator Value` and `Deep Dive Facility Value` — large SWITCH statements mapping indicator names to their respective measures. These power the Trend Analysis and Facility Deepdive pages.

### 3.2 Measures by Dashboard Page

**Overview page:** ~50 measures (coverage, MNH summary, FP totals, IUCD breakdown, ASRH, GBV, PAC, commodity availability, all MoM labels)

**Service Delivery:** ~30 measures (delivery indicators, ANC waterfall, FP methods detail, stock-out risk, GBV services, PAC types)

**Demand Generation:** ~10 measures (referral counts, Big Sisters, received care, line-listed)

**Facility Functionality:** ~25 measures (BEmONC counts by SBA, CEmONC staff, revitalization status, equipment distribution, emergency services, training)

**Governance:** ~20 measures (TWG/AOP/policy labels, BHCPF metrics, insurance types, VGF)

**Trend Analysis:** 2 core measures (`Selected Indicator Value`, `Trend Title`) + all the base measures they reference

**Facility Deepdive:** 2 core measures (`Deep Dive Selected Indicator`, `Deep Dive Facility Value`) driving a matrix

---

## 4. The 8 Pages — Visual Inventory

### Page 1: Home
- Title banner with illustration
- 5 navigation buttons (Overview, Service delivery, Facility functionality, Demand generation, Governance)
- Partner logos (SWAP, state govt, Federal Ministry of Health)
- Date stamp: "as @ [today]"
- Hexagonal decorative elements

### Page 2: Overview
- **Left sidebar:** Navigation + filters (State, LGA, Facility name, Search, Facility type, Reporting month)
- **Coverage section:** Assessed facilities gauge (224), "Click to deep dive"
- **Facility functionality:** CEmONC empanelled, L2 BEmONC (both showing Blank)
- **MNH section:** ANC clients (14K), Deliveries (7K), Vaginal/C-section split, Deaths (20 total — Maternal 1, Neonatal 19), Audited counts
- **FP section:** Total clients (13K), IUCD/Implants/Injectables with MoM arrows
- **IUCD breakdown:** Donut chart (first-time vs returning)
- **ASRH section:** Total adolescent clients (3K), horizontal bar (MNH/FP/PAC/GBV)
- **GBV section:** Total clients, first-time %
- **PAC section:** Total clients, first-time %
- **Commodity availability:** Stacked bar (Stocked vs Stocked out) for Carbetocin, Misoprostol, Oxy-Miso Combo, Oxytocin

### Page 3: Service Delivery
- **MNH:** Deliveries count, uterotonics/partographs/calibrated drapes usage (stacked bars showing Used vs Not used)
- **ANC attendance:** Donut chart (1st/4th/8th visit/None)
- **MPCDSR:** Facilities conducting MPCDSR
- **FP:** Total clients, horizontal bar of all modern contraceptive methods
- **Stock-out risk:** No stock (224), Critical <30 days (149), Warning <60 days (124)
- **GBV detail:** Total clients, first-time %, counseling %, PEP %, HIV testing %, metronidazole %, emergency contraceptives %
- **PAC detail:** Total clients, medical/surgical donut, adolescent surgical %, contraceptives received %, antibiotics %, counseling %

### Page 4: Demand Generation
- **Referrals:** Clients referred to facilities (4K), % received (48%)
- **Breakdown by type:** Donut (Big Sisters 68%, TBAs 15%, Other HFs 18%)
- **Referred vs Received Care:** Grouped bar chart by source
- **Big Sisters section:** (appears partially populated)
- **Line-listed clients:** Pregnant women line-listed, referred to HFs

### Page 5: Facility Functionality
- **HR for Health:** Total assessed BEmONCs (gauge to 230), Total CEmONC HWs (698)
- **BEmONCs by SBA count:** Donut (0/1/2/3/4+)
- **CEmONC staff distribution:** Bar chart (Nurses/Midwives, Medical Officers, Anaesthesiologists, Gynecologists)
- **Infrastructure:** BEmONC revitalization status donut, Commodity distribution status donut, Equipment distribution status donut
- **Emergency services:** Transport type bar chart, Ambulance referrals (28), Referral breakdown by case type
- **Training:** Total health workers trained, NPHCDA eLearning
- **Different filter set:** Commodity, LGA, Facility, Facility Type, Month Year

### Page 6: Governance
- **RMNCAH TWG:** Inaugurated, Meetings conducted, AOP activities completed (all 100%)
- **BHCPF Funding:** Received funds donut, Received in full donut, Within timeline donut
- **BHCPF clients:** Total (5K), Female (48%), Adolescent (6%)
- **Policy adoption:** RH policy (0%), VAPP protocol (100%), VCAT protocol (100%), STOP guideline (100%)
- **Policy training:** Law enforcement, Religious leaders (both blank)
- **Insurance & VGF:** Women enrolled (23K), Total insured (21%), VGF facilities (35), VGF clients (952)
- **Insurance type:** Horizontal bar (NHIA, HMO, Community-based, Others)
- **Subsidized services:** Horizontal bar (ANC, Delivery, PNC, FP, GBV, PAC, Other)
- **WIP label visible**

### Page 7: Trend Analysis
- **Indicator dropdown:** Selects from ~30 indicators across all categories
- **Area chart:** Shows selected indicator over time (monthly)
- **Same filter sidebar**

### Page 8: Facility Deepdive
- **Hierarchical matrix:** State → LGA → Facility (expandable tree)
- **Columns:** Assessed Facilities, BEmONCs with 4+ SBAs, Clients Accessing BEmONC Care, Clients Accessing CEmONC Care
- **Total row** at bottom
- **Same filter sidebar**

---

## 5. Architecture Recommendation

### 5.1 Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Recharts (charting)
- **Backend:** Netlify Functions (serverless Node.js)
- **Data flow:** Netlify Functions → ODK Central OData API + Google Sheets API → JSON → React
- **Deployment:** Netlify (single project: frontend + functions)

### 5.2 Data Architecture

```
ODK Central (OData) ──→ Netlify Function (/api/odk-data) ──→ React App
                           ↓ (caches for 15 min)
Google Sheets API ──────→ Netlify Function (/api/sheets-data) ──→ React App
                           ↓ (caches for 1 hour)
```

**Why this works:**
- ODK credentials stay server-side (env vars)
- Caching prevents hammering ODK on every page load
- Netlify Functions deploy alongside the frontend
- No separate server to manage

### 5.3 How Measures Translate

All 290 DAX measures become JavaScript computation functions. Since data arrives as JSON arrays of row objects, the measures translate to:
- `SUM(column)` → `data.reduce((sum, row) => sum + (row[column] || 0), 0)`
- `CALCULATE(measure, filter)` → `measure(data.filter(filterFn))`
- `DISTINCTCOUNT(column)` → `new Set(data.map(r => r[column])).size`
- `DIVIDE(a, b)` → `b !== 0 ? a / b : 0`
- MoM measures → compare current filtered data vs previous month filtered data
- SWITCH dispatchers → JavaScript switch/object lookups

### 5.4 Filter Architecture

The Power BI dashboard uses these filters on most pages:
- **State** (dropdown, multi-select)
- **LGA** (dropdown, cascading from State)
- **Facility name** (dropdown, cascading from LGA)
- **Search facility name** (text input)
- **Facility type** (dropdown: BEmONC, CEmONC)
- **Reporting month** (dropdown)

In the web app, these become a shared filter context (React Context or Zustand store) that all components subscribe to. Changing a filter re-computes all visible measures on the current page.

---

## 6. Key Risks & Gotchas

1. **Phantom tables:** 'Routine data_clean' and 'Magic happened here' are referenced in ~40 measures but don't exist in the model. Need to inspect the .pbix to find what they actually point to, or map their columns to 'Revised routine tool'.

2. **Hardcoded values:** Several measures use hardcoded numbers (`{250}`, `{4200}`, `{64}`, `{230}`, `{20}`). These are targets/benchmarks. Should be configurable in the web app.

3. **Dummy data:** The Demand Generation page has "Dummy" labels on referral counts — `# Referred (Dummy)` returns hardcoded numbers per source. This needs clarification: are real referral counts available?

4. **WIP page:** Governance page has a "WIP" label — may have incomplete data or layout.

5. **432-column ODK response:** The OData endpoint returns all 432 columns per submission. The web app should select only needed columns to reduce payload. Alternatively, use OData `$select` to request only relevant fields.

6. **SVG measures:** Three measures generate inline SVG strings (death cause indicators, commodity alerts). These should be rebuilt as proper React components.

7. **Commodity complexity:** The 19-commodity SWITCH pattern appears in many measures. Should be refactored into a data-driven lookup rather than 19-branch switch statements.

8. **Local file references:** The Mapping and Governance data currently load from `C:\Users\Dennis Agbo\Documents\...`. These need to become Google Sheets with known sheet IDs.
