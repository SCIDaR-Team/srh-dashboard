/**
 * Service Delivery — MNH quality-of-care, ANC waterfall, FP method mix,
 * stock-out risk, GBV detail, PAC detail.
 *
 * Layout: a 2-column grid on desktop. Left column carries MNH + ANC +
 * MPCDSR; right column carries FP, stock-out risk, and the GBV/PAC
 * detail strips at the bottom.
 */

import { Link } from 'react-router-dom'
import { Stethoscope, Baby, PackageX } from 'lucide-react'
import { MetricCard, SectionCard } from '../components/ui'
import { DonutChart, HBarChart, StackedBarChart } from '../components/charts'
import { useODKData } from '../hooks/useODKData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  totalDeliveries,
  uterotonicsQoC,
  partographsQoC,
  calibratedDrapesQoC,
  ancByLiveBirth,
  facilitiesConductingMPCDSR,
  fpTotal,
  fpMethodMix,
  stockOutRisk,
  gbvTotal,
  gbvFirstTimePctLabel,
  gbvCounsellingPctLabel,
  gbvPepPctLabel,
  gbvHivTestingPctLabel,
  gbvMetronidazolePctLabel,
  gbvEmergencyContraceptivePctLabel,
  pacTotal,
  pacMedical,
  pacSurgical,
  pacAdolescentSurgicalPctLabel,
  pacContraceptivesPctLabel,
  pacAntibioticsPctLabel,
  pacCounsellingPctLabel,
  computeMoMForIndicator,
  formatK,
} from '../lib/measures'
import { COLORS } from '../lib/constants'

export default function ServiceDeliveryPage() {
  useDocumentTitle('Service Delivery')
  const { data: raw } = useODKData()
  const { data } = useFilteredData(raw)

  // --- MNH quality of care ------------------------------------------------
  const deliveries = totalDeliveries(data)
  const deliveriesMom = computeMoMForIndicator(raw, totalDeliveries)
  const utero = uterotonicsQoC(data)
  const partographs = partographsQoC(data)
  const drapes = calibratedDrapesQoC(data)

  // Each row of the stacked bar shows "Used %" vs "Gap %" — model each as
  // a StackedDatum where stocked=used count, stockedOut=gap count.
  const qocStack = [
    {
      category: 'Uterotonics',
      stocked: utero.used,
      stockedOut: Math.max(0, utero.total - utero.used),
    },
    {
      category: 'Partographs',
      stocked: partographs.used,
      stockedOut: Math.max(0, partographs.total - partographs.used),
    },
    {
      category: 'Calibrated drapes',
      stocked: drapes.used,
      stockedOut: Math.max(0, drapes.total - drapes.used),
    },
  ]

  // --- ANC by women who delivered (donut) ---------------------------------
  const anc = ancByLiveBirth(data)
  const ancTotal = anc.none + anc.visit1 + anc.visit4 + anc.visit8plus
  const ancDonut = [
    { name: '1st visit', value: anc.visit1, color: COLORS.rose },
    { name: '4th visit', value: anc.visit4, color: COLORS.accent },
    { name: '8th+ visit', value: anc.visit8plus, color: COLORS.primary },
    { name: 'None', value: anc.none, color: COLORS.muted },
  ]

  // --- MPCDSR -------------------------------------------------------------
  const mpcdsr = facilitiesConductingMPCDSR(data)

  // --- FP method mix ------------------------------------------------------
  const fpValue = fpTotal(data)
  const fpMom = computeMoMForIndicator(raw, fpTotal)
  const fpBars = fpMethodMix(data).map((d, i) => ({
    name: d.name,
    value: d.value,
    color: i % 2 === 0 ? COLORS.primary : COLORS.accent,
  }))

  // --- Stock-out risk -----------------------------------------------------
  const risk = stockOutRisk(data)

  // --- GBV detail ---------------------------------------------------------
  const gbv = gbvTotal(data)
  const gbvMom = computeMoMForIndicator(raw, gbvTotal)

  // --- PAC detail ---------------------------------------------------------
  const pac = pacTotal(data)
  const pacMom = computeMoMForIndicator(raw, pacTotal)
  const pacMedSurg = [
    { name: 'Medical', value: pacMedical(data), color: COLORS.primary },
    { name: 'Surgical (MVA)', value: pacSurgical(data), color: COLORS.accent },
  ]

  return (
    <div className="space-y-6">
      {/* TOP GRID: MNH (left) + FP + Stock-out risk (right) ============== */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* MNH — left, wide */}
        <div className="space-y-4 xl:col-span-7">
          <SectionCard title="MNH — quality of care">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <MetricCard
                  title="Deliveries"
                  value={formatK(deliveries)}
                  subtitle={deliveriesMom.label}
                  subtitleColor={deliveriesMom.pct >= 0 ? 'green' : 'red'}
                  icon={<Baby size={18} />}
                />
                <MetricCard
                  title="Uterotonics used"
                  value={utero.label}
                  size="sm"
                />
                <MetricCard
                  title="Partographs used"
                  value={partographs.label}
                  size="sm"
                />
              </div>
              <StackedBarChart
                data={qocStack}
                labels={{ stocked: 'Used', stockedOut: 'Not used' }}
                colors={{ stocked: COLORS.accent, stockedOut: COLORS.rose }}
                height={260}
              />
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionCard title="ANC by women who delivered">
              {ancTotal === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  No ANC-by-livebirth data in scope.
                </p>
              ) : (
                <DonutChart
                  data={ancDonut}
                  size={240}
                  innerRadius={50}
                  centerValue={formatK(ancTotal)}
                  centerLabel="women"
                  showHover={false}
                />
              )}
            </SectionCard>

            <SectionCard title="MPCDSR">
              <div className="flex h-full flex-col items-center justify-center gap-2 py-8">
                <p className="font-heading text-5xl font-bold text-primary">
                  {mpcdsr || '--'}
                </p>
                <p className="text-sm text-muted">
                  facilities conducting MPCDSR this period
                </p>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* FP + Stock-out risk — right column. Flex column so the stock-out
            card can stretch (flex-1) and bottom-align with the taller left
            column. */}
        <div className="flex flex-col gap-4 xl:col-span-5">
          <SectionCard title="Family planning — method mix">
            <div className="space-y-3">
              <MetricCard
                title="Total FP clients"
                value={formatK(fpValue)}
                subtitle={fpMom.label}
                subtitleColor={fpMom.pct >= 0 ? 'green' : 'red'}
                icon={<Stethoscope size={18} />}
              />
              <HBarChart data={fpBars} height={260} showValues />
            </div>
          </SectionCard>

          <SectionCard
            title="Facilities at risk of stock-out"
            tone="warning"
            className="flex-1"
          >
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                title="No stock"
                value={risk.noStock}
                format="number"
                size="sm"
                subtitleColor="red"
                icon={<PackageX size={16} />}
              />
              <MetricCard
                title="Critical < 30 days"
                value={risk.criticalStock || '--'}
                size="sm"
                subtitleColor="red"
              />
              <MetricCard
                title="Warning < 60 days"
                value={risk.warningStock || '--'}
                size="sm"
                subtitleColor="neutral"
              />
            </div>
            <Link
              to="/facility-deepdive"
              className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-primary/80 hover:text-primary"
            >
              Click to deep dive →
            </Link>
          </SectionCard>
        </div>
      </div>

      {/* BOTTOM GRID: GBV detail + PAC detail ============================ */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="GBV — service detail">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Total clients"
                value={formatK(gbv)}
                subtitle={gbvMom.label}
                subtitleColor={gbvMom.pct >= 0 ? 'green' : 'red'}
              />
              <MetricCard
                title="First-time"
                value={gbvFirstTimePctLabel(data)}
                size="sm"
                format="raw"
              />
            </div>
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-card p-3 sm:grid-cols-2">
              <ServiceLine label="Counselling" value={gbvCounsellingPctLabel(data)} />
              <ServiceLine label="PEP" value={gbvPepPctLabel(data)} />
              <ServiceLine label="HIV testing" value={gbvHivTestingPctLabel(data)} />
              <ServiceLine label="Metronidazole" value={gbvMetronidazolePctLabel(data)} />
              <ServiceLine
                label="Emergency contraceptives"
                value={gbvEmergencyContraceptivePctLabel(data)}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="PAC — service detail">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                title="Total clients"
                value={formatK(pac)}
                subtitle={pacMom.label}
                subtitleColor={pacMom.pct >= 0 ? 'green' : 'red'}
              />
              <div className="rounded-xl border border-gray-100 bg-card p-2 shadow-sm">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
                  Medical / Surgical
                </p>
                {pac === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted">
                    No PAC data
                  </p>
                ) : (
                  <DonutChart
                    data={pacMedSurg}
                    size={140}
                    innerRadius={30}
                    showLegend={false}
                    centerValue={formatK(pac)}
                    showHover={false}
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-card p-3 sm:grid-cols-2">
              <ServiceLine
                label="Adolescents (surgical)"
                value={pacAdolescentSurgicalPctLabel(data)}
              />
              <ServiceLine
                label="Contraceptives received"
                value={pacContraceptivesPctLabel(data)}
              />
              <ServiceLine label="Antibiotics" value={pacAntibioticsPctLabel(data)} />
              <ServiceLine label="Counselling" value={pacCounsellingPctLabel(data)} />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

/** Small inline metric used inside the GBV/PAC service-detail panels. */
function ServiceLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-gray-100 py-1.5 last:border-b-0">
      <span className="text-xs font-medium text-muted">{label}</span>
      <span className="text-sm font-semibold text-ink tabular-nums">{value}</span>
    </div>
  )
}
