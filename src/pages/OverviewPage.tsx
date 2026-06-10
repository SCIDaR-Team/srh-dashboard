/**
 * Overview — top-level KPIs across Coverage, MNH, FP, ASRH, GBV, PAC,
 * and commodity availability.
 *
 * Composition pattern (used by every page from here on):
 *   1. Fetch raw ODK via useODKData
 *   2. Apply global filters via useFilteredData
 *   3. Feed the filtered array into measure functions from lib/measures
 *   4. Render UI primitives + chart wrappers
 *
 * Layout: 12-column CSS grid that collapses to one column on small
 * screens. Sections are wrapped in SectionCard for the coloured-strip
 * grouping that matches the original Power BI dashboard.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, HeartPulse, Users, Stethoscope } from 'lucide-react'
import { MetricCard, BreakdownMetric, SectionCard, GaugeChart } from '../components/ui'
import { DonutChart, HBarChart, StackedBarChart } from '../components/charts'
import { useODKData } from '../hooks/useODKData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  totalAssessedFacilities,
  totalANCClients,
  totalDeliveries,
  vaginalPctLabel,
  cSectionPctLabel,
  totalInFacilityDeaths,
  maternalDeaths,
  neonatalDeaths,
  auditedMaternalDeaths,
  auditedNeonatalDeaths,
  ancByLiveBirth,
  fpTotal,
  totalIUCD,
  iucdFirstTime,
  iucdReturning,
  totalImplants,
  implantsFirstTime,
  implantsReturning,
  totalInjectables,
  injectablesFirstTime,
  injectablesReturning,
  totalAdolescents,
  adolescentsByCategory,
  gbvTotal,
  gbvFirstTimePctLabel,
  pacTotal,
  pacFirstTimePctLabel,
  overviewCommodityAvailability,
  commodityAvailabilityByCategory,
  computeMoMForIndicator,
  formatK,
  countWhere,
} from '../lib/measures'
import {
  TARGETS,
  COLORS,
  COMMODITY_CATEGORIES,
  type CommodityCategory,
} from '../lib/constants'

// Which FP method's first-time / returning donut to show.
type FPMethodView = 'IUCD' | 'Implants' | 'Injectables'

export default function OverviewPage() {
  useDocumentTitle('Overview')

  const { data: raw } = useODKData()
  const { data } = useFilteredData(raw)

  const [fpView, setFpView] = useState<FPMethodView>('IUCD')
  const [commodityView, setCommodityView] = useState<CommodityCategory | 'Default'>(
    'Default',
  )

  // --- Coverage -----------------------------------------------------------
  const assessed = totalAssessedFacilities(data)

  // Facility functionality gauges — spec says show 0 if data is blank.
  const cemoncEmpanelled = countWhere(data, 'facility_type', 'CEmONC') // proxy: distinct CEmONC submissions
  const bemoncL2 = 0 // dedicated "L2 BEmONC" field not in spec → placeholder

  // --- MNH ----------------------------------------------------------------
  const ancTotal = totalANCClients(data)
  const ancMom = computeMoMForIndicator(raw, totalANCClients)
  const ancBreakdown = ancByLiveBirth(data)
  // Slice order matches the 2x2 custom legend below the donut:
  //   1st visit  | 4th visit
  //   8th+ visit | None
  const ancDonut = [
    { name: '1st visit', value: ancBreakdown.visit1, color: COLORS.rose },
    { name: '4th visit', value: ancBreakdown.visit4, color: COLORS.accent },
    { name: '8th+ visit', value: ancBreakdown.visit8plus, color: COLORS.primary },
    { name: 'None', value: ancBreakdown.none, color: COLORS.muted },
  ]
  const ancDonutTotal = ancDonut.reduce((s, d) => s + d.value, 0)

  const deliveries = totalDeliveries(data)
  const deliveriesMom = computeMoMForIndicator(raw, totalDeliveries)
  const deaths = totalInFacilityDeaths(data)
  const maternal = maternalDeaths(data)
  const neonatal = neonatalDeaths(data)
  const auditedMaternal = auditedMaternalDeaths(data)
  const auditedNeonatal = auditedNeonatalDeaths(data)

  // --- FP -----------------------------------------------------------------
  const fpTotalValue = fpTotal(data)
  const fpMom = computeMoMForIndicator(raw, fpTotal)
  const iucd = totalIUCD(data)
  const iucdMom = computeMoMForIndicator(raw, totalIUCD)
  const implants = totalImplants(data)
  const implantsMom = computeMoMForIndicator(raw, totalImplants)
  const injectables = totalInjectables(data)
  const injectablesMom = computeMoMForIndicator(raw, totalInjectables)

  // Selected method's first-time vs returning split (for the FP donut).
  const fpMethodDonut =
    fpView === 'IUCD'
      ? [
          { name: 'First time', value: iucdFirstTime(data), color: COLORS.accent },
          { name: 'Returning', value: iucdReturning(data), color: COLORS.primary },
        ]
      : fpView === 'Implants'
        ? [
            { name: 'First time', value: implantsFirstTime(data), color: COLORS.accent },
            { name: 'Returning', value: implantsReturning(data), color: COLORS.primary },
          ]
        : [
            { name: 'First time', value: injectablesFirstTime(data), color: COLORS.accent },
            { name: 'Returning', value: injectablesReturning(data), color: COLORS.primary },
          ]

  // --- ASRH ---------------------------------------------------------------
  const adolescents = totalAdolescents(data)
  const adolescentsMom = computeMoMForIndicator(raw, totalAdolescents)
  const adolescentsCat = adolescentsByCategory(data)
  const asrhBars = [
    { name: 'MNH', value: adolescentsCat.MNH, color: COLORS.primary },
    { name: 'FP', value: adolescentsCat.FP, color: COLORS.accent },
    { name: 'PAC', value: adolescentsCat.PAC, color: '#4FB286' },
    { name: 'GBV', value: adolescentsCat.GBV, color: '#8FD3B6' },
  ]

  // --- GBV / PAC ----------------------------------------------------------
  const gbv = gbvTotal(data)
  const gbvMom = computeMoMForIndicator(raw, gbvTotal)
  const pac = pacTotal(data)
  const pacMom = computeMoMForIndicator(raw, pacTotal)

  // --- Commodities --------------------------------------------------------
  const commodityRows =
    commodityView === 'Default'
      ? overviewCommodityAvailability(data)
      : commodityAvailabilityByCategory(data, commodityView)

  // ------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ===== SECTION 1: Top row — Coverage + Functionality gauges ====== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Coverage">
          <div className="flex flex-col items-center gap-3">
            <GaugeChart
              value={assessed}
              max={TARGETS.totalFacilities}
              strokeWidth={26}
              caption={`of ${TARGETS.totalFacilities} facilities`}
            />
            <Link
              to="/facility-deepdive"
              className="text-xs font-semibold uppercase tracking-wider text-primary/80 hover:text-primary"
            >
              Click to deep dive →
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Facility functionality">
          <div className="grid grid-cols-2 justify-items-center gap-3">
            <GaugeChart
              value={cemoncEmpanelled}
              max={TARGETS.empanelledCEmONC}
              size={150}
              strokeWidth={26}
              label="CEmONC empanelled"
              caption={`of ${TARGETS.empanelledCEmONC}`}
            />
            <GaugeChart
              value={bemoncL2}
              max={TARGETS.revitalizationTarget}
              size={150}
              strokeWidth={26}
              label="L2 BEmONC"
              caption={`of ${TARGETS.revitalizationTarget}`}
            />
          </div>
        </SectionCard>

        <SectionCard title="Reach">
          <div className="grid grid-cols-1 gap-3">
            <MetricCard
              title="Total clients served"
              value={formatK(fpTotalValue + gbv + pac)}
              icon={<Users size={18} />}
            />
            <MetricCard
              title="Adolescents reached"
              value={formatK(adolescents)}
              subtitle={adolescentsMom.label}
              subtitleColor={adolescentsMom.pct >= 0 ? 'green' : 'red'}
            />
          </div>
        </SectionCard>
      </div>

      {/* ===== SECTION 2: MNH + FP + ASRH ================================ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* MNH */}
        <SectionCard title="Maternal and newborn health (MNH)">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <BreakdownMetric
                title="ANC clients"
                value={formatK(ancTotal)}
                size="lg"
                subtitle={ancMom.label}
                subtitleColor={ancMom.pct >= 0 ? 'green' : 'red'}
                icon={<HeartPulse size={18} />}
                allData={raw}
                measure={totalANCClients}
              />
              <div className="rounded-xl border border-gray-100 bg-card p-2 shadow-sm">
                <DonutChart
                  data={ancDonut}
                  size={170}
                  innerRadius={50}
                  showLegend={false}
                  centerValue={formatK(ancDonutTotal)}
                  centerLabel="ANC clients"
                />
                {/* Custom 2x2 legend — order matches `ancDonut`:
                       1st visit  | 4th visit
                       8th+ visit | None         */}
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 px-2 text-[11px] text-muted">
                  {ancDonut.map((d) => (
                    <li key={d.name} className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: d.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate">{d.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <BreakdownMetric
                title="Deliveries"
                value={formatK(deliveries)}
                subtitle={deliveriesMom.label}
                subtitleColor={deliveriesMom.pct >= 0 ? 'green' : 'red'}
                size="sm"
                allData={raw}
                measure={totalDeliveries}
              />
              <MetricCard
                title="Vaginal"
                value={vaginalPctLabel(data)}
                size="sm"
                format="raw"
                fractionBelow
              />
              <MetricCard
                title="C-section"
                value={cSectionPctLabel(data)}
                size="sm"
                format="raw"
                fractionBelow
              />
            </div>

            <SectionCard title="Deaths (in-facility)" tone="danger">
              <div className="grid grid-cols-3 gap-3">
                <BreakdownMetric
                  title="Total"
                  value={deaths}
                  format="number"
                  subtitleColor="red"
                  size="sm"
                  allData={raw}
                  measure={totalInFacilityDeaths}
                  breakdownTitle="Total in-facility deaths"
                />
                <BreakdownMetric
                  title="Maternal"
                  value={maternal}
                  format="number"
                  subtitle={`${auditedMaternal} audited`}
                  subtitleColor="red"
                  size="sm"
                  allData={raw}
                  measure={maternalDeaths}
                  breakdownTitle="Maternal deaths"
                />
                <BreakdownMetric
                  title="Neonatal"
                  value={neonatal}
                  format="number"
                  subtitle={`${auditedNeonatal} audited`}
                  subtitleColor="red"
                  size="sm"
                  allData={raw}
                  measure={neonatalDeaths}
                  breakdownTitle="Neonatal deaths"
                />
              </div>
            </SectionCard>
          </div>
        </SectionCard>

        {/* FP */}
        <SectionCard title="Family planning (FP)">
          <div className="space-y-4">
            <BreakdownMetric
              title="Total clients"
              value={formatK(fpTotalValue)}
              subtitle={fpMom.label}
              subtitleColor={fpMom.pct >= 0 ? 'green' : 'red'}
              icon={<Stethoscope size={18} />}
              allData={raw}
              measure={fpTotal}
              breakdownTitle="FP clients"
            />

            <div className="grid grid-cols-3 gap-3">
              <BreakdownMetric
                title="IUCD"
                value={formatK(iucd)}
                subtitle={iucdMom.label}
                subtitleColor={iucdMom.pct >= 0 ? 'green' : 'red'}
                size="sm"
                allData={raw}
                measure={totalIUCD}
              />
              <BreakdownMetric
                title="Implants"
                value={formatK(implants)}
                subtitle={implantsMom.label}
                subtitleColor={implantsMom.pct >= 0 ? 'green' : 'red'}
                size="sm"
                allData={raw}
                measure={totalImplants}
              />
              <BreakdownMetric
                title="Injectables"
                value={formatK(injectables)}
                subtitle={injectablesMom.label}
                subtitleColor={injectablesMom.pct >= 0 ? 'green' : 'red'}
                size="sm"
                allData={raw}
                measure={totalInjectables}
              />
            </div>

            {/* Method toggle + donut */}
            <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm">
              <div className="mb-2 flex gap-1 rounded-lg bg-light-green p-1">
                {(['IUCD', 'Implants', 'Injectables'] as FPMethodView[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFpView(m)}
                    className={[
                      'flex-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors',
                      fpView === m
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-primary/70 hover:text-primary',
                    ].join(' ')}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <DonutChart
                data={fpMethodDonut}
                size={260}
                innerRadius={64}
                centerLabel="clients"
                centerValue={formatK(
                  fpMethodDonut.reduce((a, b) => a + b.value, 0),
                )}
              />
            </div>
          </div>
        </SectionCard>

        {/* ASRH */}
        <SectionCard title="Adolescents (10–19)">
          <div className="space-y-4">
            <BreakdownMetric
              title="Total adolescent clients"
              value={formatK(adolescents)}
              subtitle={adolescentsMom.label}
              subtitleColor={adolescentsMom.pct >= 0 ? 'green' : 'red'}
              icon={<Users size={18} />}
              allData={raw}
              measure={totalAdolescents}
              breakdownTitle="Adolescent clients"
            />
            <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm">
              <HBarChart data={asrhBars} height={360} showValues />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ===== SECTION 3: GBV + PAC + Commodities ======================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Gender-based violence (GBV)">
          <div className="space-y-3">
            <BreakdownMetric
              title="Total clients"
              value={formatK(gbv)}
              subtitle={gbvMom.label}
              subtitleColor={gbvMom.pct >= 0 ? 'green' : 'red'}
              allData={raw}
              measure={gbvTotal}
              breakdownTitle="GBV clients"
            />
            <MetricCard
              title="First-time clients"
              value={gbvFirstTimePctLabel(data)}
              size="sm"
              format="raw"
            />
          </div>
        </SectionCard>

        <SectionCard title="Post-abortion care (PAC)">
          <div className="space-y-3">
            <BreakdownMetric
              title="Total clients"
              value={formatK(pac)}
              subtitle={pacMom.label}
              subtitleColor={pacMom.pct >= 0 ? 'green' : 'red'}
              icon={<Building2 size={18} />}
              allData={raw}
              measure={pacTotal}
              breakdownTitle="PAC clients"
            />
            <MetricCard
              title="First-time clients"
              value={pacFirstTimePctLabel(data)}
              size="sm"
              format="raw"
            />
          </div>
        </SectionCard>

        <SectionCard title="Commodity availability">
          {/* Category slicer — moved out of the cramped header action slot
              so all five options can wrap freely onto two rows on narrow cards. */}
          <div className="mb-3 flex flex-wrap gap-1.5 rounded-lg bg-light-green/60 p-1">
            {(['Default', ...COMMODITY_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCommodityView(c)}
                className={[
                  'rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors',
                  commodityView === c
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-primary/70 hover:bg-white hover:text-primary',
                ].join(' ')}
              >
                {c === 'Default' ? 'Top 4' : c}
              </button>
            ))}
          </div>

          {commodityRows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No commodity data for the current scope.
            </p>
          ) : (
            // Horizontal layout puts long commodity names on the Y axis where
            // they have room ("Carbetocin (Heat Stable)", "Oxy-Miso Combo Pack").
            <StackedBarChart
              data={commodityRows}
              height={Math.max(220, commodityRows.length * 44)}
              orientation="horizontal"
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
