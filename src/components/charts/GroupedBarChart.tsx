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
import { CHART_SERIES_COLORS } from '../../lib/constants'
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_CURSOR_FILL,
  CHART_LEGEND_STYLE,
  ChartTooltip,
  ChartEmpty,
} from '../../lib/chartTheme'

export interface GroupedBarGroup {
  category: string
  values: { name: string; value: number; color?: string }[]
}

interface GroupedBarChartProps {
  data: GroupedBarGroup[]
  height?: number
  /**
   * Category order. Defaults to `"desc"` (groups with the largest combined
   * total appear first). Pass `"none"` to preserve `data`'s order.
   */
  sort?: 'desc' | 'asc' | 'none'
}

export function GroupedBarChart({
  data,
  height = 280,
  sort = 'desc',
}: GroupedBarChartProps) {
  const ordered =
    sort === 'none'
      ? data
      : [...data].sort((a, b) => {
          const sa = a.values.reduce((s, v) => s + v.value, 0)
          const sb = b.values.reduce((s, v) => s + v.value, 0)
          return sort === 'desc' ? sb - sa : sa - sb
        })

  const seriesNames: string[] = []
  const seenColors: Record<string, string> = {}
  for (const group of ordered) {
    for (const v of group.values) {
      if (!seriesNames.includes(v.name)) seriesNames.push(v.name)
      if (v.color && !seenColors[v.name]) seenColors[v.name] = v.color
    }
  }

  const grandTotal = ordered.reduce(
    (acc, g) => acc + g.values.reduce((s, v) => s + v.value, 0),
    0,
  )
  if (grandTotal === 0) {
    return <ChartEmpty height={height} variant="bar" />
  }

  const flat = ordered.map((g) => {
    const row: Record<string, string | number> = { category: g.category }
    for (const v of g.values) row[v.name] = v.value
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart data={flat} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} vertical={false} />
        <XAxis
          dataKey="category"
          tick={CHART_AXIS_TICK}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: CHART_CURSOR_FILL, opacity: 1 }}
          content={<ChartTooltip />}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="circle"
          wrapperStyle={CHART_LEGEND_STYLE}
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
