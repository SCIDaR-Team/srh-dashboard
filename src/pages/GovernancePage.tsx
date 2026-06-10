/**
 * Governance — TWG, policy adoption, BHCPF funding, insurance, VGF.
 *
 * Pulls from BOTH data sources:
 *   - Google Sheets Governance (TWG / policy adoption flags per state)
 *   - ODK (BHCPF receipts, insurance counts, VGF service delivery)
 */

import { ShieldCheck, BadgeCheck, Wallet } from 'lucide-react'
import { MetricCard, SectionCard } from '../components/ui'
import { DonutChart, HBarChart } from '../components/charts'
import { useODKData } from '../hooks/useODKData'
import { useGovernanceData } from '../hooks/useGovernanceData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useFilterStore } from '../store/filterStore'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { computeGovernanceMeasures, formatK } from '../lib/measures'
import { COLORS } from '../lib/constants'

const yesNoDonut = ({ yes, no }: { yes: number; no: number }) => [
  { name: 'Yes', value: yes, color: COLORS.accent },
  { name: 'No', value: no, color: COLORS.rose },
]

export default function GovernancePage() {
  useDocumentTitle('Governance')
  const { data: raw } = useODKData()
  const { data: filteredODK } = useFilteredData(raw)
  const { data: govData } = useGovernanceData()
  const stateFilter = useFilterStore((s) => s.state)

  const m = computeGovernanceMeasures(govData, filteredODK, stateFilter)

  return (
    <div className="space-y-6">
      {/* Row 1: RMNCAH TWG (X/8 labels) ================================== */}
      <SectionCard title="RMNCAH TWG">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Inaugurated"
            value={m.twgInauguratedLabel}
            icon={<ShieldCheck size={18} />}
            format="raw"
          />
          <MetricCard
            title="Meetings conducted"
            value={m.twgMeetingsLabel}
            format="raw"
          />
          <MetricCard
            title="AOP activities completed"
            value={m.aopActivitiesLabel}
            format="raw"
          />
        </div>
      </SectionCard>

      {/* Row 2: BHCPF funding donuts + clients ============================ */}
      <SectionCard title="BHCPF Funding">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SubCard title="Received funds">
            <DonutChart
              data={yesNoDonut(m.bhcpfReceivedDonut)}
              size={180}
              innerRadius={50}
              showLegend
            />
          </SubCard>
          <SubCard title="In full amount">
            <DonutChart
              data={yesNoDonut(m.bhcpfFullDonut)}
              size={180}
              innerRadius={50}
              showLegend
            />
          </SubCard>
          <SubCard title="Within timeline">
            <DonutChart
              data={yesNoDonut(m.bhcpfOnTimeDonut)}
              size={180}
              innerRadius={50}
              showLegend
            />
          </SubCard>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="BHCPF clients"
            value={formatK(m.bhcpfClientsTotal)}
            icon={<Wallet size={18} />}
          />
          <MetricCard title="Female" value={m.bhcpfFemaleLabel} format="raw" />
          <MetricCard
            title="Adolescent"
            value={m.bhcpfAdolescentLabel}
            format="raw"
          />
        </div>
      </SectionCard>

      {/* Row 3: Policy adoption + Policy training ======================== */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Policy adoption">
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              title="RH policy"
              value={m.rhPolicyLabel}
              size="sm"
              format="raw"
              icon={<BadgeCheck size={16} />}
            />
            <MetricCard
              title="VAPP protocol"
              value={m.vappLabel}
              size="sm"
              format="raw"
            />
            <MetricCard title="VCAT training" value={m.vcatLabel} size="sm" format="raw" />
            <MetricCard title="STOP guideline" value={m.stopLabel} size="sm" format="raw" />
          </div>
        </SectionCard>

        <SectionCard title="Policy training">
          {/* Dedicated counts not enumerated in ODK type spec → placeholders. */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard title="Law enforcement trained" value="--" size="sm" />
            <MetricCard title="Religious leaders trained" value="--" size="sm" />
          </div>
        </SectionCard>
      </div>

      {/* Row 4: Insurance & VGF ========================================== */}
      <SectionCard title="Insurance & VGF">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard
            title="Women enrolled"
            value={formatK(m.womenEnrolled)}
            size="sm"
          />
          <MetricCard
            title="Total insured"
            value={m.insuredPctLabel}
            size="sm"
            format="raw"
          />
          <MetricCard
            title="VGF facilities"
            value={formatK(m.providesVGFCount)}
            size="sm"
          />
          <MetricCard
            title="VGF clients"
            value={formatK(m.vgfReceivedService)}
            size="sm"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SubCard title="Insurance type">
            <HBarChart
              data={[
                { name: 'NHIA', value: m.insuranceBreakdown.NHIA, color: COLORS.primary },
                { name: 'HMO', value: m.insuranceBreakdown.HMO, color: COLORS.accent },
                {
                  name: 'Community-based',
                  value: m.insuranceBreakdown.CommunityBased,
                  color: '#4FB286',
                },
                { name: 'Others', value: m.insuranceBreakdown.Others, color: '#8FD3B6' },
              ]}
              height={220}
              showValues
            />
          </SubCard>
          <SubCard title="Subsidized services">
            <HBarChart
              data={[
                { name: 'ANC', value: m.vgfServiceBreakdown.ANC, color: COLORS.primary },
                {
                  name: 'Delivery',
                  value: m.vgfServiceBreakdown.Delivery,
                  color: COLORS.accent,
                },
                { name: 'PNC', value: m.vgfServiceBreakdown.PNC, color: '#4FB286' },
                { name: 'FP', value: m.vgfServiceBreakdown.FP, color: '#8FD3B6' },
                { name: 'GBV', value: m.vgfServiceBreakdown.GBV, color: COLORS.rose },
                { name: 'PAC', value: m.vgfServiceBreakdown.PAC, color: COLORS.warning },
              ]}
              height={240}
              showValues
            />
          </SubCard>
        </div>
      </SectionCard>
    </div>
  )
}

/** Tiny labelled wrapper used inside SectionCards that contain multiple
 *  charts (BHCPF donuts, Insurance + Subsidized). */
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
