/**
 * StackedBarChart — 100% stacked column chart for commodity availability
 * and quality-of-care visuals.
 *
 * Each datum is `{ category, stocked, stockedOut }` per spec; the chart
 * draws one column per category with green ("stocked") on top of rose
 * ("stocked out"). Percentage labels are rendered inside each segment
 * — hidden when the segment is too narrow to fit them legibly.
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
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_CURSOR_FILL,
  CHART_LEGEND_STYLE,
  ChartTooltip,
  ChartEmpty,
} from '../../lib/chartTheme'

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

/** Hide inline percent labels when a segment is too thin to fit them. */
const MIN_PCT_FOR_LABEL = 12

export function StackedBarChart({
  data,
  height = 260,
  colors = { stocked: COLORS.accent, stockedOut: COLORS.rose },
  labels = { stocked: 'Stocked', stockedOut: 'Stocked out' },
  orientation = 'vertical',
  sort = 'desc',
}: StackedBarChartProps) {
  const isHorizontal = orientation === 'horizontal'

  const ordered =
    sort === 'none'
      ? data
      : [...data].sort((a, b) => {
          const sa = a.stocked + a.stockedOut
          const sb = b.stocked + b.stockedOut
          return sort === 'desc' ? sb - sa : sa - sb
        })

  const withPct = ordered.map((d) => {
    const total = d.stocked + d.stockedOut
    const stockedPct = total === 0 ? 0 : Math.round((d.stocked / total) * 100)
    const stockedOutPct = total === 0 ? 0 : Math.round((d.stockedOut / total) * 100)
    return {
      ...d,
      stockedPctLabel: total === 0 || stockedPct < MIN_PCT_FOR_LABEL ? '' : `${stockedPct}%`,
      stockedOutPctLabel:
        total === 0 || stockedOutPct < MIN_PCT_FOR_LABEL ? '' : `${stockedOutPct}%`,
    }
  })

  const grandTotal = withPct.reduce((acc, d) => acc + d.stocked + d.stockedOut, 0)
  if (grandTotal === 0) {
    return <ChartEmpty height={height} variant="bar" />
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
          stroke={CHART_GRID_STROKE}
          vertical={isHorizontal}
          horizontal={!isHorizontal}
        />
        {isHorizontal ? (
          <>
            <XAxis type="number" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              tick={CHART_AXIS_TICK}
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
              tick={CHART_AXIS_TICK}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis type="number" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
          </>
        )}
        <Tooltip
          cursor={{ fill: CHART_CURSOR_FILL, opacity: 1 }}
          content={<ChartTooltip />}
        />
        <Legend iconType="circle" wrapperStyle={CHART_LEGEND_STYLE} />
        <Bar dataKey="stocked" name={labels.stocked} stackId="a" fill={colors.stocked}>
          <LabelList
            dataKey="stockedPctLabel"
            position="center"
            style={{ fontSize: 11, fill: '#fff', fontWeight: 700 }}
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
            dataKey="stockedOutPctLabel"
            position="center"
            style={{ fontSize: 11, fill: COLORS.ink, fontWeight: 700 }}
          />
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
