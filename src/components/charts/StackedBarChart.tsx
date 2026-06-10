/**
 * StackedBarChart — 100% stacked column chart for commodity availability
 * and quality-of-care visuals.
 *
 * Each datum is `{ category, stocked, stockedOut }` per spec; the chart
 * draws one column per category with green ("stocked") on top of rose
 * ("stocked out"). Percentage labels are rendered inside each segment.
 */

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { COLORS } from '../../lib/constants'

export interface StackedDatum {
  category: string
  stocked: number
  stockedOut: number
}

interface StackedBarChartProps {
  data: StackedDatum[]
  height?: number
  colors?: { stocked: string; stockedOut: string }
  /** Override the legend labels for the two series. */
  labels?: { stocked: string; stockedOut: string }
  /**
   * `vertical` (default): bars rise from the X-axis. Best for short category
   *   names and few categories.
   * `horizontal`: bars extend right; categories sit on the Y-axis with room
   *   for long names (e.g. "Carbetocin (Heat Stable)").
   */
  orientation?: 'vertical' | 'horizontal'
  /**
   * Category order. Defaults to `"desc"` (biggest stack first / on top).
   * Pass `"none"` to keep `data`'s order — useful when categories follow
   * a fixed sequence the caller cares about.
   */
  sort?: 'desc' | 'asc' | 'none'
}

const axisStyle = { fontSize: 12, fill: COLORS.muted }

export function StackedBarChart({
  data,
  height = 260,
  colors = { stocked: COLORS.accent, stockedOut: COLORS.rose },
  labels = { stocked: 'Stocked', stockedOut: 'Stocked out' },
  orientation = 'vertical',
  sort = 'desc',
}: StackedBarChartProps) {
  const isHorizontal = orientation === 'horizontal'

  // Sort by total stack height — biggest stack first, regardless of orientation.
  const ordered =
    sort === 'none'
      ? data
      : [...data].sort((a, b) => {
          const sa = a.stocked + a.stockedOut
          const sb = b.stocked + b.stockedOut
          return sort === 'desc' ? sb - sa : sa - sb
        })

  // Pre-compute percentage strings for inside-bar labels.
  const withPct = ordered.map((d) => {
    const total = d.stocked + d.stockedOut
    return {
      ...d,
      stockedPct: total === 0 ? '' : `${Math.round((d.stocked / total) * 100)}%`,
      stockedOutPct: total === 0 ? '' : `${Math.round((d.stockedOut / total) * 100)}%`,
    }
  })

  // No data → show a calm empty state instead of a chart with zero-height bars.
  const grandTotal = withPct.reduce((acc, d) => acc + d.stocked + d.stockedOut, 0)
  if (grandTotal === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-black/10 bg-light-green/30 text-sm text-muted"
        style={{ height }}
      >
        No data for the selected scope.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={withPct}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{
          top: 8,
          right: isHorizontal ? 24 : 12,
          bottom: 4,
          left: isHorizontal ? 8 : 0,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E5E7EB"
          vertical={isHorizontal}
          horizontal={!isHorizontal}
        />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              width={150}
              interval={0}
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey="category"
              tick={axisStyle}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip
          cursor={{ fill: COLORS.lightGreen, opacity: 0.4 }}
          formatter={(value: unknown, name: unknown) => [
            Number(value).toLocaleString(),
            String(name),
          ]}
          contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.lightGreen}` }}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: COLORS.muted }} />
        <Bar dataKey="stocked" name={labels.stocked} stackId="a" fill={colors.stocked}>
          <LabelList
            dataKey="stockedPct"
            position="center"
            style={{ fontSize: 11, fill: '#fff', fontWeight: 600 }}
          />
        </Bar>
        <Bar
          dataKey="stockedOut"
          name={labels.stockedOut}
          stackId="a"
          fill={colors.stockedOut}
          radius={isHorizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]}
        >
          <LabelList
            dataKey="stockedOutPct"
            position="center"
            style={{ fontSize: 11, fill: COLORS.ink, fontWeight: 600 }}
          />
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
