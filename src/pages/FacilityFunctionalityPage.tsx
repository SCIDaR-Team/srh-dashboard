/**
 * Facility Functionality — HR for health, infrastructure & equipment,
 * commodity/equipment distribution, emergency services, training.
 *
 * Combines two sources:
 *   - ODK (routine — staff counts, revitalization status, emergency cases)
 *   - Facility Baseline (static — infrastructure / equipment availability,
 *     SBA presence, baseline HR cadres)
 *
 * Uses the alternate filter set (Commodity / LGA / Facility / Type / Month)
 * configured in PageShell's ROUTE_CONFIG → filterVariant="facility".
 */

import { Users, Building2, Truck, Ambulance } from 'lucide-react'
import { MetricCard, SectionCard, GaugeChart } from '../components/ui'
import { DonutChart, HBarChart } from '../components/charts'
import { ChartEmpty } from '../lib/chartTheme'
import { useODKData } from '../hooks/useODKData'
import { useBaselineData } from '../hooks/useBaselineData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useFilterStore } from '../store/filterStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  computeFacilityFunctionalityMeasures,
  computeMoMForIndicator,
  formatK,
  sumField,
} from '../lib/measures'
import { TARGETS, COLORS } from '../lib/constants'

// CEmONC HW total (used for MoM) — matches the formula inside
// computeFacilityFunctionalityMeasures.
const cemoncHWTotal = (data: Parameters<typeof sumField>[0]) =>
  sumField(data, 'Anesthesiologists') +
  sumField(data, 'Obstetricians_Gynecologists') +
  sumField(data, 'Medical_Officers') +
  sumField(data, 'Nurses_Midwives')

export default function FacilityFunctionalityPage() {
  useDocumentTitle('Facility Functionality')
  const { data: raw } = useODKData()
  const { data: filtered } = useFilteredData(raw)
  const { data: baseline } = useBaselineData()
  const stateFilter = useFilterStore((s) => s.state)

  const m = computeFacilityFunctionalityMeasures(filtered, baseline, stateFilter)
  const hwMom = computeMoMForIndicator(raw, cemoncHWTotal)

  // --- Donut sources ------------------------------------------------------
  const sbaDonut = [
    { name: '0', value: m.bemoncBySBACount['0'], color: COLORS.danger },
    { name: '1', value: m.bemoncBySBACount['1'], color: COLORS.warning },
    { name: '2', value: m.bemoncBySBACount['2'], color: '#FFD27F' },
    { name: '3', value: m.bemoncBySBACount['3'], color: '#8FD3B6' },
    { name: '4+', value: m.bemoncBySBACount['4+'], color: COLORS.accent },
  ]
  const revitalDonut = [
    { name: 'Completed', value: m.revitalizationStatus.Completed, color: COLORS.accent },
    { name: 'Ongoing', value: m.revitalizationStatus.Ongoing, color: COLORS.warning },
    { name: 'Not started', value: m.revitalizationStatus.NotStarted, color: COLORS.rose },
  ]
  const commodityDistDonut = [
    { name: 'Yes', value: m.commodityDistributionStatus.yes, color: COLORS.accent },
    { name: 'No', value: m.commodityDistributionStatus.no, color: COLORS.rose },
  ]
  const equipmentDistDonut = [
    { name: 'Fully received', value: m.equipmentDistributionStatus.FullyReceived, color: COLORS.accent },
    { name: 'Partially', value: m.equipmentDistributionStatus.PartiallyReceived, color: COLORS.warning },
    { name: 'Not received', value: m.equipmentDistributionStatus.NotReceived, color: COLORS.rose },
  ]

  // --- HBar sources -------------------------------------------------------
  const staffBars = [
    { name: 'Nurses/Midwives', value: m.cEmONCStaffByType.NursesMidwives, color: COLORS.primary },
    { name: 'Medical Officers', value: m.cEmONCStaffByType.MedicalOfficers, color: COLORS.accent },
    { name: 'Gynecologists', value: m.cEmONCStaffByType.Gynecologists, color: '#4FB286' },
    { name: 'Anaesthesiologists', value: m.cEmONCStaffByType.Anaesthesiologists, color: '#8FD3B6' },
  ]
  const transportBars = m.transportTypes.map((t, i) => ({
    name: t.name,
    value: t.value,
    color: i % 2 === 0 ? COLORS.primary : COLORS.accent,
  }))
  const caseBars = [
    { name: 'Obstetric', value: m.referralsByCase.Obstetric, color: COLORS.primary },
    { name: 'Newborn', value: m.referralsByCase.Newborn, color: COLORS.accent },
    { name: 'GBV', value: m.referralsByCase.GBV, color: COLORS.rose },
    { name: 'PAC', value: m.referralsByCase.PAC, color: '#4FB286' },
    { name: 'ASRH', value: m.referralsByCase.ASRH, color: '#8FD3B6' },
  ]

  return (
    <div className="space-y-6">
      {/* ===== HR for Health =========================================== */}
      <SectionCard title="Human resource for health">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <GaugeChart
              value={m.totalAssessedBEmONC}
              max={TARGETS.assessedBEmONC}
              target={TARGETS.assessedBEmONC}
              label="Assessed BEmONCs"
              caption={`of ${TARGETS.assessedBEmONC}`}
            />
          </div>
          <div className="lg:col-span-3">
            <MetricCard
              title="Total CEmONC HWs"
              value={formatK(m.totalCEmONCHWs)}
              subtitle={hwMom.label}
              subtitleColor={hwMom.pct >= 0 ? 'green' : 'red'}
              icon={<Users size={18} />}
            />
          </div>
          <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm lg:col-span-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              BEmONCs by SBA count
            </p>
            <DonutChart data={sbaDonut} size={180} innerRadius={42} showLegend />
          </div>
          <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm lg:col-span-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              CEmONC staff by type
            </p>
            <HBarChart data={staffBars} height={200} showValues />
          </div>
        </div>
      </SectionCard>

      {/* ===== Infrastructure, equipment & commodities ================== */}
      <SectionCard title="Infrastructure, equipment & commodities">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MetricCard
            title="BEmONC prioritized for revitalization"
            value={formatK(TARGETS.revitalizationTarget)}
            size="sm"
            icon={<Building2 size={16} />}
          />
          <MetricCard
            title="Commodity distribution target"
            value={formatK(TARGETS.commodityDistribution)}
            size="sm"
          />
          <MetricCard
            title="Equipment distribution target"
            value={formatK(TARGETS.equipmentTarget)}
            size="sm"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SubCard title="Revitalization status">
            <DonutChart data={revitalDonut} size={200} innerRadius={48} showLegend />
          </SubCard>
          <SubCard title="Commodity distribution">
            <DonutChart data={commodityDistDonut} size={200} innerRadius={48} showLegend />
          </SubCard>
          <SubCard title="Equipment distribution">
            <DonutChart data={equipmentDistDonut} size={200} innerRadius={48} showLegend />
          </SubCard>
        </div>

        {/* Baseline-derived infrastructure availability */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SubCard title="Power supply (baseline)">
            <SupplySplit value={m.powerSupplyByFacility} />
          </SubCard>
          <SubCard title="Water supply (baseline)">
            <SupplySplit value={m.waterSupplyByFacility} />
          </SubCard>
        </div>

        <div className="mt-4">
          <SubCard title="Infrastructure availability across facilities">
            <HBarChart
              data={m.infrastructureAvailability.map((row) => ({
                name: row.item,
                value: row.available,
                color: COLORS.primary,
              }))}
              height={260}
              showValues
            />
          </SubCard>
        </div>
      </SectionCard>

      {/* ===== Emergency services ====================================== */}
      <SectionCard title="Emergency services">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <MetricCard
              title="Ambulance referrals"
              value={formatK(m.ambulanceReferrals)}
              icon={<Ambulance size={18} />}
            />
          </div>
          <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm lg:col-span-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Transport type
            </p>
            {transportBars.length === 0 ? (
              <ChartEmpty height={220} variant="bar" />
            ) : (
              <HBarChart data={transportBars} height={220} showValues />
            )}
          </div>
          <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm lg:col-span-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              Referrals by case type
            </p>
            <HBarChart data={caseBars} height={220} showValues />
          </div>
        </div>
      </SectionCard>

      {/* ===== Training ================================================ */}
      <SectionCard title="Training">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Dedicated training counts are not enumerated in the ODK type
              spec, so we surface placeholders that respect the spec's
              "show '--' if blank" rule. */}
          <MetricCard title="Health workers trained" value="--" icon={<Truck size={18} />} />
          <MetricCard title="NPHCDA eLearning" value="--" />
        </div>
      </SectionCard>
    </div>
  )
}

function SubCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-card p-3 shadow-sm">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </p>
      {children}
    </div>
  )
}

function SupplySplit({
  value,
}: {
  value: { hasReliable: number; hasOccasional: number; hasNone: number }
}) {
  const total = value.hasReliable + value.hasOccasional + value.hasNone
  if (total === 0)
    return <p className="py-6 text-center text-sm text-muted">No baseline data.</p>
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`
  return (
    <div className="grid grid-cols-3 gap-2 py-2">
      <SupplyTile label="Reliable" value={value.hasReliable} pct={pct(value.hasReliable)} color={COLORS.accent} />
      <SupplyTile
        label="Occasional"
        value={value.hasOccasional}
        pct={pct(value.hasOccasional)}
        color={COLORS.warning}
      />
      <SupplyTile label="None" value={value.hasNone} pct={pct(value.hasNone)} color={COLORS.rose} />
    </div>
  )
}

function SupplyTile({
  label,
  value,
  pct,
  color,
}: {
  label: string
  value: number
  pct: string
  color: string
}) {
  return (
    <div className="rounded-lg p-3 text-center" style={{ backgroundColor: `${color}33` }}>
      <p className="font-heading text-xl font-bold text-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted">{label}</p>
      <p className="text-xs font-semibold" style={{ color }}>{pct}</p>
    </div>
  )
}
