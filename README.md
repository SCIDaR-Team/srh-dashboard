# SRH Dashboard

> A comprehensive real-time monitoring dashboard for Sexual Reproductive Health (SRH) program performance across 8 Nigerian states. Built with React, TypeScript, and Recharts; deployed on Netlify with serverless functions.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Pages & Dashboards](#pages--dashboards)
6. [Getting Started](#getting-started)
7. [Development](#development)
8. [Deployment](#deployment)
9. [Data Sources](#data-sources)
10. [Project Structure](#project-structure)
11. [Key Concepts](#key-concepts)
12. [Common Tasks](#common-tasks)

---

## Project Overview

### What is the SRH Dashboard?

The SRH Dashboard is a real-time analytics platform designed to monitor and visualize sexual reproductive health program performance across 8 Nigerian states: **Akwa Ibom, Benue, Ekiti, Enugu, Kebbi, Ondo, Taraba, and Zamfara**.

The dashboard ingests data from multiple sources—ODK Central form submissions, Google Sheets, and local baseline data—and transforms them into actionable insights through interactive charts, trend analysis, and facility-level deep dives. Program managers and stakeholders use it to track delivery metrics, identify gaps, and make data-driven decisions.

### Core Purpose

The dashboard provides **monthly monitoring and performance tracking** across five key health domains:

- **Maternal & Newborn Health (MNH)**: ANC coverage, delivery quality of care (partographs, uterotonic use)
- **Family Planning (FP)**: Method mix distribution and uptake
- **Post-Abortion Care (PAC)**: Medical vs. surgical interventions, follow-up counseling
- **Gender-Based Violence (GBV)**: First-visit reporting, counseling, testing, and treatment services
- **Infrastructure & Governance**: Facility functionality, equipment availability, commodity stock-outs

Each data point flows through a rigorous computation pipeline that deduplicates submissions, applies domain-specific business logic, and surfaces results with month-on-month comparisons (MoM %) so users can spot trends immediately.

---

## Key Features

### 1. **Multi-Page Dashboard with Granular Filtering**
- **Global Filter Panel**: Filter by State, LGA, Facility Name, Facility Type, Reporting Month, and free-text facility search
- **Real-time Updates**: Filters propagate instantly across all charts and metrics
- **Persistent State**: Filter selections saved in browser URL for sharing and bookmarking

### 2. **Rich, Interactive Visualizations**
- **Donut Charts**: Categorical breakdowns (e.g., ANC visit frequency, PAC method mix) with inline labels to avoid hover dependency
- **Stacked Bar Charts**: Multi-series comparisons (e.g., equipment availability by facility type)
- **Horizontal Bar Charts**: Ranked facility/LGA performance
- **Area Charts**: Time-series trend analysis with monthly granularity
- **Gauge Charts**: Progress-to-target visualization
- **Tree Tables**: Hierarchical facility drill-downs (State → LGA → Facility)

### 3. **Responsive, Mobile-Optimized Design**
- Tailwind CSS utility-first layout adapts seamlessly from mobile to 4K desktop
- Charts resize responsively while maintaining readability
- Touch-friendly interface with appropriate spacing

### 4. **Performance & Code-Splitting**
- Page-level code splitting with React.lazy() keeps initial bundle small
- Recharts and vendor libraries split into separate chunks for independent caching
- Lazy-loaded routes ensure only the active page pulls in chart dependencies
- 15-minute data cache on ODK submissions to reduce API load

### 5. **Error Handling & Loading States**
- Global error boundary with user-friendly error messages
- Skeleton loaders for better perceived performance
- Empty state graphics for zero-data scenarios
- TypeScript strict mode catches type mismatches at compile time

---

## Technology Stack

### Frontend
- **React 19.2**: UI library with hooks, Suspense, and lazy loading
- **TypeScript 6.0**: Strict type checking across the entire codebase
- **Vite 8.0**: Lightning-fast dev server and optimized production builds
- **React Router 7.17**: SPA navigation with lazy route loading
- **Recharts 3.8**: Composable React charting library built on D3
- **Tailwind CSS 4.3**: Utility-first styling framework
- **Lucide React 1.17**: Icon library with consistent 24px sizing
- **Zustand 5.0**: Lightweight state management for filter state

### Backend & Hosting
- **Netlify Functions**: Serverless Node.js functions (AWS Lambda under the hood)
- **Netlify Dev**: Local development server with function emulation
- **API Gateway**: Automatic routing from `/api/*` to `/.netlify/functions/*`
- **SPA Fallback**: Netlify redirects non-asset paths to `index.html` for React Router routes

### Build & Dev Tools
- **TypeScript**: Strict compilation (`tsc -b` for incremental builds)
- **ESLint 10**: Enforces React Hook rules and code quality standards
- **Node 20**: LTS version pinned in netlify.toml for build consistency

### Data Sources
- **ODK Central**: Monthly routine health facility surveillance forms (432+ columns)
- **Google Sheets**: Commodity mapping, baseline facility data, governance indicators
- **CSV Exports**: Baseline and supplementary data feeds

---

## Architecture

### Data Flow Pipeline

```
ODK Central / Google Sheets
         ↓
  Netlify Functions (fetch & parse)
         ↓
  JSON API (/api/odk-data, /api/baseline-data, etc.)
         ↓
  DataProvider Context (singleton fetch per app session)
         ↓
  useODKData() / useFilteredData() Hooks
         ↓
  Computed Measures Library (business logic)
         ↓
  React Components & Charts
         ↓
  Browser Rendering
```

### Component Hierarchy

```
App (ErrorBoundary)
 └─ DataProvider (context for all data sources)
     └─ BrowserRouter (React Router)
         └─ PageShell (layout with TopNav + FilterPanel)
             └─ <Routes>
                 ├─ HomePage (landing page with key metrics)
                 ├─ OverviewPage (cross-cutting health domain summary)
                 ├─ ServiceDeliveryPage (MNH, FP, PAC, GBV detail)
                 ├─ DemandGenerationPage (RMNCH messaging & awareness)
                 ├─ FacilityFunctionalityPage (equipment & infrastructure)
                 ├─ GovernancePage (audits & supervision)
                 ├─ TrendAnalysisPage (indicator time-series explorer)
                 └─ FacilityDeepDivePage (single-facility drill-down)
```

### State Management

- **Filter State** (Zustand): Centralized filter store (`filterStore.ts`) tracks user selections and broadcasts updates to all pages
- **Data Context** (React Context): `DataProvider` fetches each data source once and exposes via context hooks, preventing redundant API calls
- **Computed State** (useMemo): Pages compute derived metrics on-demand from raw data + filters, ensuring fresh results on filter change

### Data Fetching

- **`DataProvider`** initializes four parallel fetches on app mount:
  - `odk-data`: Monthly facility submissions (15-min cache TTL)
  - `baseline-data`: Facility baseline attributes (static, no cache)
  - `governance-data`: Audit/supervision records (static, no cache)
  - `commodity-mapping`: Commodity category definitions (defaults to hardcoded list)
- Each hook (`useODKData`, useFilteredData, etc.) reads from context and applies transformations
- Netlify Functions proxy calls from the SPA to third-party APIs (ODK Central, Google Sheets) and apply data cleaning/deduplication

---

## Pages & Dashboards

### 1. **Home Page** (`/`)
Entry point with high-level KPIs and quick-access navigation.
- Displays aggregate counts (facilities reporting, total clients served)
- Month-on-month change indicators
- Quick navigation cards to other dashboards
- Call-to-action for facility managers to drill deeper

### 2. **Overview Page** (`/overview`)
Cross-cutting summary of all health domains; "one-stop-shop" for stakeholders.
- **Maternal & Newborn Health (MNH)**: ANC clients (categorized by visit number), deliveries with quality of care metrics (partographs, uterotonic use), facility-based maternal mortality
- **Family Planning (FP)**: Total FP clients and method mix (pills, injectables, IUDs, etc.)
- **Commodities**: Stock availability and stockout risk heatmap
- **Target Progress**: Gauge charts showing progress toward program targets

### 3. **Service Delivery Page** (`/service-delivery`)
Deep dive into quality of care and post-intervention care.
- **MNH Quality of Care**: Breakdown of partograph & uterotonic usage rates by facility
- **ANC by Live Birth Ratio**: Chart showing ANC coverage relative to delivery volume
- **Family Planning Method Mix**: Stacked/grouped bar chart
- **PAC Detail**: Medical vs. surgical intervention split with follow-up metrics (contraceptives, antibiotics, counseling)
- **GBV Services**: First-visit reporting, counseling uptake, PEP/HIV testing rates

### 4. **Demand Generation Page** (`/demand-generation`)
Tracks community mobilization and awareness activities.
- RMNCH messaging reach and frequency
- Community health volunteer (CHV) mobilization metrics
- Referral pathway effectiveness (facility → CHV → community)
- Awareness campaign milestones

### 5. **Facility Functionality Page** (`/facility-functionality`)
Infrastructure and resource availability.
- **Equipment Availability**: Checklist of essential obstetric equipment (delivery beds, partograph sets, emergency medications, etc.)
- **Infrastructure Status**: Power, water, sanitation, waste management
- **Commodity Distribution**: Stock levels of key contraceptives, antibiotics, and other consumables
- **Ranked Facility Performance**: Horizontal bar chart showing readiness index by facility

### 6. **Governance Page** (`/governance`)
Supervision, audits, and accountability metrics.
- **Audit Compliance**: Percentage of facilities with recent (e.g., last 3 months) supervision visit
- **Data Quality Indicators**: Completeness and timeliness of submissions
- **Policy Adherence**: Compliance with facility standard operating procedures
- **Performance Agreements**: Contractual milestones tracked

### 7. **Trend Analysis Page** (`/trend-analysis`)
Flexible time-series explorer for any indicator.
- **Indicator Dropdown**: User selects from 100+ indicators across all health domains
- **Monthly Area Chart**: Visualizes trend over time with data labels for small datasets
- **Quick Stats**: Category, months covered, period total, peak month
- **Export-Ready**: Chart dimensions and format suitable for reports

### 8. **Facility Deepdive Page** (`/facility-deepdive`)
Single-facility detailed view for performance coaching and accountability.
- **Facility Selector**: Dropdown to choose facility by name or state + LGA
- **Monthly Submission Timeline**: Which months has data been reported?
- **All Metrics for Selected Facility**: All domain KPIs contextualized against state/LGA/national averages
- **Trend Sparklines**: Individual indicator trends over time
- **Data Quality Flags**: Alerts for missing/suspect data

---

## Getting Started

### Prerequisites

- **Node.js 20.x or higher** (LTS recommended)
- **npm 10.x** (comes with Node)
- **Git** for version control
- **Netlify CLI** (optional, for local function testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SCIDaR-Team/srh-dashboard.git
   cd srh-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This installs all React, TypeScript, Recharts, Tailwind, and dev tools.

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory (next to `package.json`):
   ```env
   VITE_ODK_URL=https://odk.example.com
   VITE_BASELINE_CSV_URL=https://sheets.googleapis.com/...baseline.csv
   VITE_COMMODITY_CSV_URL=https://sheets.googleapis.com/...commodities.csv
   VITE_GOVERNANCE_CSV_URL=https://sheets.googleapis.com/...governance.csv
   ```
   These values are sourced by Netlify Functions during build. Check netlify.toml for the full list of environment variables.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser. The dev server uses Vite's HMR (hot module replacement) for instant feedback on code changes.

### Troubleshooting Installation

- **Port 5173 already in use?** Pass a custom port: `npm run dev -- --port 3000`
- **Netlify Functions not running?** Ensure you have `netlify-cli` installed: `npm install -g netlify-cli`
- **TypeScript errors in IDE?** Run `npm run build` to check—may be a VS Code ESLint/TS server cache issue

---

## Development

### Directory Structure

```
srh-dashboard/
├── src/
│   ├── pages/
│   │   ├── HomePage.tsx                 # Landing page with key metrics
│   │   ├── OverviewPage.tsx             # Cross-domain summary (MNH, FP, etc.)
│   │   ├── ServiceDeliveryPage.tsx      # Quality of care & post-intervention detail
│   │   ├── DemandGenerationPage.tsx     # Community mobilization metrics
│   │   ├── FacilityFunctionalityPage.tsx # Equipment & infrastructure readiness
│   │   ├── GovernancePage.tsx           # Supervision, audits, policy adherence
│   │   ├── TrendAnalysisPage.tsx        # Time-series explorer
│   │   └── FacilityDeepDivePage.tsx     # Single-facility drill-down
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PageShell.tsx            # Main layout wrapper (TopNav + Sidebar + Page)
│   │   │   ├── TopNav.tsx               # Header with logo, page title, user menu
│   │   │   └── FilterPanel.tsx          # State/LGA/Facility filters
│   │   │
│   │   ├── ui/
│   │   │   ├── MetricCard.tsx           # Single KPI display (value + subtitle)
│   │   │   ├── SectionCard.tsx          # Wrapper for grouped content
│   │   │   ├── BreakdownMetric.tsx      # KPI with icon, MoM %, and detail panel
│   │   │   ├── Skeleton.tsx             # Loading placeholder
│   │   │   ├── ErrorBoundary.tsx        # Global error handler
│   │   │   ├── GaugeChart.tsx           # Progress-to-target circular gauge
│   │   │   ├── StateBreakdownTooltip.tsx # Custom tooltip for state comparisons
│   │   │   └── index.ts                 # Exports of all UI components
│   │   │
│   │   └── charts/
│   │       ├── DonutChart.tsx           # Pie chart with center label & inline labels
│   │       ├── StackedBarChart.tsx      # Multi-series horizontal stacked bars
│   │       ├── GroupedBarChart.tsx      # Side-by-side bar groups
│   │       ├── HBarChart.tsx            # Ranked horizontal bars
│   │       ├── AreaChartComponent.tsx   # Time-series area chart
│   │       ├── TreeTable.tsx            # Hierarchical State → LGA → Facility table
│   │       └── index.ts                 # Exports of all chart components
│   │
│   ├── hooks/
│   │   ├── useODKData.ts                # Fetches raw ODK submissions from context
│   │   ├── useFilteredData.ts           # Applies filter state to data
│   │   ├── useFetchJSON.ts              # Generic JSON fetch with error handling
│   │   ├── useGovernanceData.ts         # Governance data hook
│   │   ├── useBaselineData.ts           # Baseline facility data hook
│   │   ├── useCommodityMapping.ts       # Commodity category mappings
│   │   └── useDocumentTitle.ts          # Sets page title in browser tab
│   │
│   ├── lib/
│   │   ├── types.ts                     # TypeScript interfaces for all domain types
│   │   ├── constants.ts                 # Color palette, state list, targets, indicators
│   │   ├── measures.ts                  # Computation engine (100+ measures)
│   │   ├── chartTheme.tsx               # Recharts styling (colors, fonts, tooltips)
│   │   └── helper functions (date, format, etc.)
│   │
│   ├── state/
│   │   ├── DataProvider.tsx             # React Context for data fetching
│   │   └── store/
│   │       └── filterStore.ts           # Zustand store for filter state
│   │
│   ├── App.tsx                          # Root component with ErrorBoundary, Router
│   ├── index.css                        # Global Tailwind CSS directives
│   └── main.tsx                         # React DOM render entry point
│
├── netlify/functions/
│   ├── _lib.ts                          # Shared utilities (auth, error handling)
│   ├── odk-data.ts                      # Fetches & deduplicates ODK submissions
│   ├── baseline-data.ts                 # Fetches baseline facility data
│   ├── governance-data.ts               # Fetches governance/audit records
│   └── commodity-mapping.ts             # Returns commodity category mappings
│
├── public/
│   └── [favicon, static assets]
│
├── vite.config.ts                       # Vite build config (dev server, optimizations)
├── tsconfig.json                        # TypeScript compiler options
├── tailwind.config.ts                   # Tailwind color palette & design tokens
├── netlify.toml                         # Netlify build & function deployment config
├── eslint.config.js                     # ESLint rules (React Hooks, code quality)
├── package.json                         # Dependencies & scripts
└── README.md                            # This file
```

### npm Scripts

```bash
npm run dev         # Start Vite dev server on localhost:5173
npm run build       # Compile TypeScript & build optimized dist/
npm run lint        # Run ESLint on all .ts/.tsx files
npm run preview     # Serve the production build locally for testing
```

### Development Workflow

1. **Start dev server:** `npm run dev` opens [http://localhost:5173](http://localhost:5173)
2. **Make code changes** in `src/` — HMR will refresh the browser
3. **Run linter** occasionally: `npm run lint` to catch issues
4. **Compile TypeScript** before committing: `npm run build` ensures no type errors
5. **Test in production mode** with `npm run preview` (serves optimized build)

### Adding a New Page

1. Create a new file in `src/pages/NewPage.tsx`:
   ```tsx
   import { useDocumentTitle } from '../hooks/useDocumentTitle'
   import { SectionCard } from '../components/ui'
   
   export default function NewPage() {
     useDocumentTitle('New Page')
     // Your component logic
     return <SectionCard title="Title">{/* content */}</SectionCard>
   }
   ```

2. Add route in `src/App.tsx`:
   ```tsx
   const NewPage = lazy(() => import('./pages/NewPage'))
   // In <Routes>:
   <Route path="/new-page" element={<Suspense fallback={<PageSkeleton />}><NewPage /></Suspense>} />
   ```

3. Add navigation entry in `src/lib/constants.ts` (PAGES array)

### Adding a New Chart

1. Create chart component in `src/components/charts/NewChart.tsx`
2. Import from `recharts` and style with `chartTheme.ts` constants
3. Export from `src/components/charts/index.ts`
4. Use in pages like:
   ```tsx
   import { NewChart } from '../components/charts'
   <NewChart data={data} />
   ```

### Adding a New Measure

Measures are computed functions in `src/lib/measures.ts`. Each measure:
- Takes `data: ODKSubmission[]` as input
- Returns a number or structured object
- Includes JSDoc comments explaining the calculation
- Is exported and typed

Example:
```typescript
/** Count total deliveries across all submissions. */
export function totalDeliveries(data: ODKSubmission[]): number {
  return data.reduce((sum, row) => sum + (row.delivery_count || 0), 0)
}
```

Then import and use in pages:
```tsx
import { totalDeliveries } from '../lib/measures'
const count = totalDeliveries(data)
```

### TypeScript Tips

- **Strict Mode**: `tsconfig.json` has `strict: true` — all types must be explicit
- **Domain Types**: Add new shapes to `src/lib/types.ts` (not scattered across files)
- **Avoid `any`**: Use `unknown` and type guards, or refactor to a proper interface
- **Build Check**: `npm run build` catches type errors before deployment

---

## Deployment

### Netlify Configuration

The app is configured for automatic deployment via `netlify.toml`:

- **Build Command**: `npm run build` compiles TypeScript and builds dist/
- **Publish Directory**: `dist/` (Vite output)
- **Functions Directory**: `netlify/functions/` (serverless Node functions)
- **Environment**: Node 20 (pinned for consistency)

### Deployment Process

1. **Push to main branch** on GitHub
   ```bash
   git add .
   git commit -m "Feature: add new dashboard"
   git push origin main
   ```

2. **Netlify automatically:**
   - Detects push
   - Installs dependencies (`npm install`)
   - Compiles TypeScript (`tsc -b`)
   - Builds optimized bundle (`vite build`)
   - Deploys functions to AWS Lambda
   - Publishes dist/ to Netlify CDN
   - Prints deployment URL

3. **View deploy logs:**
   - Netlify Dashboard: https://app.netlify.com/sites/[site-name]/deploys
   - Command line: `netlify deploy` (requires Netlify CLI)

### Environment Variables

Set in Netlify Dashboard under **Site Settings → Build & Deploy → Environment**:

```
BASELINE_CSV_URL           # Google Sheets export URL for baseline data
BASELINE_HEADER_ROW        # Header row number (usually 1)
COMMODITY_CSV_URL          # Google Sheets export URL for commodity list
GOVERNANCE_CSV_URL         # Google Sheets export URL for governance data
ODK_EMAIL                  # ODK Central service account email
ODK_PASSWORD               # ODK Central service account password
NODE_VERSION               # Pinned to 20 (set in netlify.toml, can override here)
```

### Local Testing Before Deployment

```bash
# Build locally to test
npm run build

# Serve optimized production build
npm run preview

# Test Netlify Functions locally
netlify dev    # Runs on localhost:8888 with function proxy
```

---

## Data Sources

### 1. **ODK Central** (Monthly Health Facility Submissions)

- **Endpoint**: ODK Central API (https://odk.example.com)
- **Form**: "Revised routine tool" with 432+ columns
- **Frequency**: Monthly submissions from ~250 health facilities
- **Content**:
  - Facility identifiers (name, state, LGA, type)
  - Indicator counts (deliveries, ANC clients, FP clients, PAC procedures, etc.)
  - Quality metrics (partographs used, uterotonic administered, etc.)
  - Infrastructure status (equipment availability, commodity stock levels)
  - Staff and supervision metrics
- **Processing**:
  - `netlify/functions/odk-data.ts` fetches via ODK API
  - Deduplicates submissions (newer submission replaces older for same facility + month)
  - Converts string numbers to integers
  - Returns cleaned JSON array to frontend

### 2. **Baseline Data** (Google Sheets)

- **Source**: Google Sheets exported as CSV
- **Content**:
  - Facility baseline attributes (name, state, LGA, type, catchment population)
  - Facility tier (primary health center, general hospital, etc.)
  - Geographic coordinates (latitude/longitude)
- **Processing**:
  - `netlify/functions/baseline-data.ts` fetches and parses CSV
  - Merged with ODK submissions by facility_name + state for enrichment

### 3. **Commodity Mapping** (Static or Sheets)

- **Source**: Hardcoded list in `src/lib/constants.ts` (fallback) or Google Sheets
- **Content**: Maps commodity names to categories (e.g., "Depo" → "Injectables")
- **Processing**: Used by measures to aggregate FP method mix and commodity stock

### 4. **Governance Data** (Google Sheets)

- **Source**: Google Sheets export
- **Content**:
  - Supervision visit dates per facility
  - Audit findings and compliance flags
  - Data quality indicators
  - Policy adherence assessments
- **Processing**: `netlify/functions/governance-data.ts` fetches and enriches dashboard

### Data Freshness & Caching

- **ODK Data**: 15-minute cache (FIFTEEN_MIN in DataProvider)
- **Baseline/Governance/Commodity**: No cache (static, or refreshed manually)
- **API Calls**: All proxied through Netlify Functions (reusable authentication, no CORS issues)

---

## Key Concepts

### Filtering & Reactivity

The **Global Filter** (`src/store/filterStore.ts`) is a Zustand store that tracks:
- `state`, `lga`, `facilityName`, `facilityType`, `reportingMonth`, `searchFacility`
- Defaults to `"All"` (wildcard match)
- Filters embedded in URL query params for shareable links

When a filter changes:
1. Zustand broadcasts update to all subscribers
2. `useFilteredData()` recomputes derived data in-memory
3. All charts/metrics re-render with new values
4. URL updates for bookmarking/sharing

### Deduplication & Business Logic

The **Measures Library** (`src/lib/measures.ts`) implements domain-specific calculations:
- **Deduplication**: When two submissions exist for the same facility + month, prefer the latest
- **Computed Fields**: Derive rates, percentages, MoM changes from raw counts
- **Aggregation**: Sum counts by state, LGA, facility type
- **Quality Checks**: Flag suspect data (e.g., negative counts)

### Component Organization

- **Pages**: Handle routing, data fetching, page-level layout
- **UI Components**: Reusable building blocks (MetricCard, SectionCard, etc.)
- **Chart Components**: Wrapped Recharts with SRH-specific styling
- **Hooks**: Data fetching, filtering, computed state
- **Lib Functions**: Pure functions (no side effects) for measures, types, constants

### Performance Optimizations

1. **Code Splitting**: Routes are lazy-loaded; chart libraries only load when needed
2. **Chunking**: Recharts split into separate vendor chunk (caches independently)
3. **Data Caching**: 15-min TTL on ODK submissions prevents redundant fetches
4. **Memoization**: `useMemo` prevents recomputing measures on every render
5. **Responsive Images**: Charts resize with viewport; no fixed widths

---

## Common Tasks

### Add a New Metric/Measure

1. Define in `src/lib/measures.ts`:
   ```typescript
   export function myNewMetric(data: ODKSubmission[]): number {
     return data.reduce((sum, row) => sum + (row.my_field || 0), 0)
   }
   ```

2. Use in a page:
   ```typescript
   import { myNewMetric } from '../lib/measures'
   const value = myNewMetric(data)
   <MetricCard title="My Metric" value={value.toLocaleString()} />
   ```

### Update Chart Colors

Edit `src/lib/constants.ts` (COLORS object) and `src/lib/chartTheme.tsx`. Then rebuild: `npm run build`.

### Change Filter Options

Edit `src/lib/constants.ts` (STATE_LIST, COMMODITY_LIST, etc.) and/or update the CSV source in Netlify environment variables.

### Add a New Data Source

1. Create a new Netlify Function in `netlify/functions/my-source.ts`
2. Call it from `DataProvider` in `src/state/DataProvider.tsx`
3. Export a hook: `useMySourceData()`
4. Use in pages: `const { data } = useMySourceData()`

### Fix a Data Bug

1. Check if it's a **calculation error** → fix in `src/lib/measures.ts` + rebuild
2. Check if it's a **data quality issue** → fix in the Netlify Function (`netlify/functions/*.ts`) + redeploy
3. Check if it's a **UI display issue** → fix in the page component or chart wrapper

### Deploy a Hotfix

```bash
git checkout -b hotfix/issue-name
# Make fixes
npm run build    # Ensure no compile errors
git add .
git commit -m "Fix: brief description"
git push origin hotfix/issue-name
# Open PR, merge to main → Netlify auto-deploys
```

---

## Support & Troubleshooting

### Build Errors

**TypeScript Error: "Type 'X' is not assignable to type 'Y'"**
- Check `src/lib/types.ts` for the expected type shape
- Ensure all required fields are provided
- Use `npm run build` to see full error message

**Cannot find module '@/...'**
- Path alias is set in `vite.config.ts`; restart dev server if still broken

**Netlify Deploy Fails**
- Check `netlify.toml` build command
- Ensure all environment variables are set in Netlify dashboard
- Run `npm run build` locally to reproduce

### Runtime Errors

**"useODKData() must be called inside DataProvider"**
- Ensure the component using the hook is a descendant of `<DataProvider>` in `src/App.tsx`

**No data displayed**
- Check browser Network tab → ensure API calls to `/api/odk-data` etc. succeed
- Check browser Console for JavaScript errors
- Verify environment variables are set (e.g., `VITE_ODK_URL`)

**Filters not working**
- Confirm `FilterPanel` is rendered in `PageShell`
- Check that page is using `useFilteredData()` hook (not raw `useODKData()`)
- Verify Zustand store is exporting the correct selectors

### Performance Issues

- Run `npm run build` and check bundle size: `npm run preview`
- Use React DevTools Profiler to find slow renders
- Check if a measure is recomputing unnecessarily (wrap in `useMemo`)

---

## Contributing

1. **Branch naming**: `feature/name`, `fix/name`, `docs/name`
2. **Commit messages**: Imperative mood, lowercase: "add new metric", "fix typo"
3. **Code style**: ESLint enforced via `npm run lint`
4. **Type safety**: Always run `npm run build` before pushing
5. **Tests**: Manual testing recommended; automated test suite planned

---

## License & Attribution

**SRH Dashboard** is developed by the SCIDaR Team. Data sources include ODK Central, Google Sheets, and baseline facility records across 8 Nigerian states.

For questions, contact the development team or open an issue on GitHub.

---

## Glossary

| Term | Definition |
|------|-----------|
| **MNH** | Maternal & Newborn Health |
| **FP** | Family Planning |
| **PAC** | Post-Abortion Care |
| **GBV** | Gender-Based Violence |
| **ODK** | Open Data Kit (data collection platform) |
| **LGA** | Local Government Area |
| **MoM** | Month-on-Month (year-over-year comparison) |
| **QoC** | Quality of Care |
| **ANC** | Antenatal Care |
| **Uterotonic** | Drug administered to prevent/treat postpartum hemorrhage |
| **Partograph** | Birth monitoring chart used during labor |
| **Commodity** | Essential medicines/supplies (contraceptives, antibiotics, etc.) |
| **Heatmap** | Color-coded grid showing intensity/risk (e.g., stockout risk) |

---

**Last Updated**: June 2026  
**Version**: 1.0  
**Repository**: https://github.com/SCIDaR-Team/srh-dashboard

