/**
 * Trend Analysis — indicator dropdown + monthly area chart.
 *
 * Wires INDICATOR_LIST → INDICATOR_MEASURES dispatch in measures.ts.
 */

import { useMemo, useState } from 'react'
import { ChevronDown, TrendingUp } from 'lucide-react'
import { SectionCard } from '../components/ui'
import { AreaChartComponent } from '../components/charts'
import { ChartEmpty } from '../lib/chartTheme'
import { useODKData } from '../hooks/useODKData'
import { useFilteredData } from '../hooks/useFilteredData'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { computeTrendData } from '../lib/measures'
import { INDICATOR_LIST, type IndicatorLabel } from '../lib/constants'

export default function TrendAnalysisPage() {
  useDocumentTitle('Trend Analysis')
  const { data: raw } = useODKData()
  const { data } = useFilteredData(raw)

  const [indicator, setIndicator] = useState<IndicatorLabel>(INDICATOR_LIST[0].label)

  const trend = useMemo(() => computeTrendData(data, indicator), [data, indicator])
  const category = INDICATOR_LIST.find((i) => i.label === indicator)?.category ?? ''

  // Quick stats from the trend (avoid re-summing in JSX).
  const total = trend.reduce((acc, p) => acc + p.value, 0)
  const peak = trend.reduce(
    (best, p) => (p.value > best.value ? p : best),
    { month: '—', value: 0 },
  )

  return (
    <div className="space-y-6">
      {/* Indicator picker */}
      <div className="srh-card flex flex-wrap items-center gap-4 p-5">
        <div className="flex items-center gap-2 text-primary">
          <TrendingUp size={20} />
          <p className="font-heading text-sm font-semibold uppercase tracking-wider">
            Select an indicator
          </p>
        </div>

        <div className="relative ml-auto w-full sm:w-72">
          <select
            value={indicator}
            onChange={(e) => setIndicator(e.target.value as IndicatorLabel)}
            className="w-full appearance-none rounded-lg border border-black/10 bg-card px-3 py-2 pr-9 text-sm font-medium text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {INDICATOR_LIST.map((i) => (
              <option key={i.label} value={i.label}>
                {i.category} · {i.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Category" value={category} />
        <StatTile label="Months covered" value={String(trend.length)} />
        <StatTile label="Period total" value={total.toLocaleString()} />
        <StatTile
          label="Peak month"
          value={
            peak.month === '—'
              ? '—'
              : `${peak.month} (${peak.value.toLocaleString()})`
          }
        />
      </div>

      {/* Area chart */}
      <SectionCard title={`Trend — ${indicator}`}>
        {trend.length === 0 ? (
          <ChartEmpty
            height={560}
            variant="area"
            label={`No data for ${indicator} in the current scope.`}
          />
        ) : (
          <AreaChartComponent
            data={trend}
            height={560}
            showDataLabels={trend.length <= 12}
            title={`${indicator} · monthly`}
          />
        )}
      </SectionCard>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-card p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 truncate font-heading text-lg font-bold text-ink">{value}</p>
    </div>
  )
}
