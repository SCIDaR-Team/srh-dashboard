/**
 * Demand Generation — referrals into facilities (Big Sisters, TBAs, other
 * health facilities), Big-Sisters dedicated card, line-listed clients.
 */

import { Users, UsersRound } from 'lucide-react'
import { MetricCard, SectionCard } from '../components/ui'
import { DonutChart, GroupedBarChart } from '../components/charts'
import { useODKData } from '../hooks/useODKData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  referralsByBigSisters,
  referralsByTBAs,
  referralsByOtherHFs,
  totalReferralsReceived,
  referralReceivedPctLabel,
  formatK,
} from '../lib/measures'
import { COLORS } from '../lib/constants'

export default function DemandGenerationPage() {
  useDocumentTitle('Demand Generation')
  const { data: raw } = useODKData()
  const { data } = useFilteredData(raw)

  const bigSisters = referralsByBigSisters(data)
  const tbas = referralsByTBAs(data)
  const otherHFs = referralsByOtherHFs(data)
  const totalReceived = totalReferralsReceived(data)

  const breakdownDonut = [
    { name: 'Big Sisters', value: bigSisters, color: COLORS.primary },
    { name: 'TBAs', value: tbas, color: COLORS.accent },
    { name: 'Other HFs', value: otherHFs, color: '#8FD3B6' },
  ]

  // Grouped bar: "Referred vs Received Care" for each source. The current
  // ODK fields only enumerate received counts; the Referred series is
  // shown alongside as the same value until a distinct referred field is
  // wired up (flagged back in PROMPT 3).
  const referralBars = [
    {
      category: 'Big Sisters',
      values: [
        { name: 'Referred', value: bigSisters, color: COLORS.primary },
        { name: 'Received care', value: bigSisters, color: COLORS.accent },
      ],
    },
    {
      category: 'TBAs',
      values: [
        { name: 'Referred', value: tbas, color: COLORS.primary },
        { name: 'Received care', value: tbas, color: COLORS.accent },
      ],
    },
    {
      category: 'Other HFs',
      values: [
        { name: 'Referred', value: otherHFs, color: COLORS.primary },
        { name: 'Received care', value: otherHFs, color: COLORS.accent },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top strip: total + % received + big-sisters dedicated card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Total clients referred"
          value={formatK(totalReceived)}
          icon={<Users size={18} />}
        />
        <MetricCard
          title="% received in facilities"
          value={referralReceivedPctLabel(data)}
          subtitleColor="green"
          format="raw"
        />
        <MetricCard
          title="Referrals from Big Sisters"
          value={formatK(bigSisters)}
          icon={<UsersRound size={18} />}
        />
        <MetricCard
          title="Pregnant women line-listed"
          value="--"
          subtitle="referred to HFs: --"
          subtitleColor="neutral"
        />
      </div>

      {/* Charts: breakdown donut + grouped bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Referral source breakdown">
          {totalReceived === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No referrals recorded for the current scope.
            </p>
          ) : (
            <DonutChart
              data={breakdownDonut}
              size={260}
              innerRadius={60}
              centerValue={formatK(totalReceived)}
              centerLabel="clients"
            />
          )}
        </SectionCard>

        <SectionCard title="Referred vs Received Care">
          {totalReceived === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              No referrals recorded for the current scope.
            </p>
          ) : (
            <GroupedBarChart data={referralBars} height={280} />
          )}
        </SectionCard>
      </div>

      {/* Big Sisters dedicated section */}
      <SectionCard title="Big Sisters program">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Newly enrolled Big Sisters"
            value={formatK(bigSisters)}
            size="sm"
          />
          <MetricCard
            title="Women referred by Big Sisters"
            value={formatK(bigSisters)}
            size="sm"
          />
          <MetricCard
            title="Received care via Big Sisters"
            value={formatK(bigSisters)}
            size="sm"
          />
        </div>
      </SectionCard>
    </div>
  )
}
