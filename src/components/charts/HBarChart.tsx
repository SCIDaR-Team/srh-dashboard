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

const axisStyle = { fontSize: 12, fill: COLORS.muted }

export function HBarChart({
  data,
  height = 280,
  showValues = false,
  unit = '',
  color = COLORS.primary,
  sort = 'desc',
}: HBarChartProps) {
  // Recharts plots Y-axis data top-to-bottom in array order, so descending
  // sort puts the largest bar at the top — the natural read order.
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
        margin={{ top: 8, right: showValues ? 40 : 12, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal />
        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          tick={axisStyle}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          cursor={{ fill: COLORS.lightGreen, opacity: 0.4 }}
          formatter={(value: unknown) => [
            `${Number(value).toLocaleString()}${unit}`,
            'Value',
          ]}
          contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.lightGreen}` }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive>
          {ordered.map((d) => (
            <Cell key={d.name} fill={d.color ?? color} />
          ))}
          {showValues && (
            <LabelList
              dataKey="value"
              position="right"
              style={{ fontSize: 12, fill: COLORS.ink, fontWeight: 600 }}
              formatter={(v: unknown) => Number(v).toLocaleString()}
            />
          )}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
