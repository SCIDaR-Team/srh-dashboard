/**
 * HBarChart — horizontal bar chart (Recharts BarChart with layout="vertical").
 *
 * Used for ranked-list visuals: FP methods, ASRH category split, state
 * breakdowns. Each bar can override its colour via `data[].color`.
 */

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { COLORS } from '../../lib/constants'
import {
  CHART_AXIS_TICK,
  CHART_GRID_STROKE,
  CHART_CURSOR_FILL,
  ChartTooltip,
} from '../../lib/chartTheme'

export interface HBarDatum {
  name: string
  value: number
  color?: string
}

interface HBarChartProps {
  data: HBarDatum[]
  height?: number
  /** Show value labels at the end of each bar */
  showValues?: boolean
  /** Suffix appended in the tooltip, e.g. "%" */
  unit?: string
  /** Default colour when a datum doesn't specify one */
  color?: string
  /**
   * Row order. Defaults to `"desc"` (largest bar at top) — pass `"none"`
   * to preserve the order of `data` (e.g. when categories follow a
   * natural sequence the caller cares about).
   */
  sort?: 'desc' | 'asc' | 'none'
}

export function HBarChart({
  data,
  height = 280,
  showValues = false,
  unit = '',
  color = COLORS.primary,
  sort = 'desc',
}: HBarChartProps) {
  const ordered =
    sort === 'none'
      ? data
      : [...data].sort((a, b) =>
          sort === 'desc' ? b.value - a.value : a.value - b.value,
        )

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReBarChart
        data={ordered}
        layout="vertical"
        margin={{ top: 8, right: showValues ? 44 : 12, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} horizontal />
        <XAxis type="number" tick={CHART_AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={CHART_AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          cursor={{ fill: CHART_CURSOR_FILL, opacity: 1 }}
          content={<ChartTooltip unit={unit} />}
        />
        <Bar dataKey="value" name="Value" radius={[0, 6, 6, 0]} isAnimationActive>
          {ordered.map((d) => (
            <Cell key={d.name} fill={d.color ?? color} />
          ))}
          {showValues && (
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 11, fill: COLORS.ink, fontWeight: 600 }}
              formatter={(v: unknown) => Number(v).toLocaleString()}
            />
          )}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
