/**
 * AreaChartComponent — Recharts AreaChart with a soft green gradient fill.
 *
 * Used primarily by the Trend Analysis page (monthly indicator values).
 * Data shape `{ month, value }` is what `computeTrendData` returns.
 */

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts'
import { format, parse } from 'date-fns'
import { COLORS } from '../../lib/constants'

export interface AreaPoint {
  month: string // ISO "YYYY-MM"
  value: number
}

interface AreaChartProps {
  data: AreaPoint[]
  height?: number
  color?: string
  showDataLabels?: boolean
  title?: string
  /** Suffix appended in tooltip + labels, e.g. "%" */
  unit?: string
}

const axisStyle = { fontSize: 12, fill: COLORS.muted }

const fmtMonth = (iso: string): string => {
  try {
    return format(parse(iso, 'yyyy-MM', new Date()), 'MMM yy')
  } catch {
    return iso
  }
}

export function AreaChartComponent({
  data,
  height = 300,
  color = COLORS.accent,
  showDataLabels = false,
  title,
  unit = '',
}: AreaChartProps) {
  return (
    <div className="w-full">
      {title && (
        <h3 className="mb-2 font-heading text-base font-semibold text-ink">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ReAreaChart data={data} margin={{ top: 16, right: 16, bottom: 4, left: 0 }}>
          <defs>
            <linearGradient id="srh-area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={fmtMonth}
            tick={axisStyle}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
          <Tooltip
            labelFormatter={(label: unknown) => fmtMonth(String(label))}
            formatter={(value: unknown) => [
              `${Number(value).toLocaleString()}${unit}`,
              'Value',
            ]}
            contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.lightGreen}` }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#srh-area-fill)"
            isAnimationActive
          >
            {showDataLabels && (
              <LabelList
                dataKey="value"
                position="top"
                style={{ fontSize: 11, fill: COLORS.ink, fontWeight: 600 }}
                formatter={(v: unknown) => `${Number(v).toLocaleString()}${unit}`}
              />
            )}
          </Area>
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
