/**
 * GroupedBarChart — side-by-side grouped bars.
 *
 * Data shape: an array of categories, each with an array of named values.
 * Example: referrals "Referred vs Received Care" by source:
 *   [
 *     { category: 'Big Sisters',  values: [{name:'Referred',value:1200}, {name:'Received',value:580}] },
 *     { category: 'TBAs',         values: [...] },
 *   ]
 *
 * The chart auto-detects the union of value names and renders one Bar
 * per series.
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
} from 'recharts'
import { CHART_SERIES_COLORS, COLORS } from '../../lib/constants'

export interface GroupedBarGroup {
  category: string
  values: { name: string; value: number; color?: string }[]
}

interface GroupedBarChartProps {
  data: GroupedBarGroup[]
  height?: number
}

const axisStyle = { fontSize: 12, fill: COLORS.muted }

export function GroupedBarChart({ data, height = 280 }: GroupedBarChartProps) {
  // Flatten to Recharts' "wide" shape: { category, <seriesName>: <value>, ... }
  const seriesNames: string[] = []
  const seenColors: Record<string, string> = {}
  for (const group of data) {
    for (const v of group.values) {
      if (!seriesNames.includes(v.name)) seriesNames.push(v.name)
      if (v.color && !seenColors[v.name]) seenColors[v.name] = v.color
    }
  }

  const flat = data.map((g) => {
    const row: Record<string, string | number> = { category: g.category }
    for (const v of g.values) row[v.name] = v.value
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={flat} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
        <XAxis
          dataKey="category"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: COLORS.lightGreen, opacity: 0.3 }}
          formatter={(value: unknown, name: unknown) => [
            Number(value).toLocaleString(),
            String(name),
          ]}
          contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.lightGreen}` }}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: 12, color: COLORS.muted }}
        />
        {seriesNames.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            fill={seenColors[name] ?? CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
            radius={[6, 6, 0, 0]}
            isAnimationActive
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  )
}
