/**
 * DonutChart — Recharts PieChart wrapper with the SRH look.
 *
 * Supports an optional centred summary (centerLabel + centerValue) for the
 * common "73% (1,204 clients)" pattern. External labels show count + %.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_SERIES_COLORS, COLORS } from '../../lib/constants'

export interface DonutDatum {
  name: string
  value: number
  color?: string
}

interface DonutChartProps {
  data: DonutDatum[]
  size?: number
  /** inner radius in pixels (default 50, controls thickness) */
  innerRadius?: number
  showLabels?: boolean
  centerLabel?: string
  centerValue?: string
  showLegend?: boolean
}

export function DonutChart({
  data,
  size = 220,
  innerRadius = 50,
  showLabels = false,
  centerLabel,
  centerValue,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  // Recharts' PieLabelRenderProps types `name`/`value` as optional; coerce.
  const renderLabel = (props: { name?: string | number; value?: number }) => {
    const name = String(props.name ?? '')
    const value = Number(props.value ?? 0)
    const pct = total === 0 ? 0 : Math.round((value / total) * 100)
    return `${name}: ${value.toLocaleString()} (${pct}%)`
  }

  return (
    <div className="relative w-full" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={Math.max(innerRadius + 20, size / 2 - 20)}
            paddingAngle={2}
            stroke="none"
            label={showLabels ? renderLabel : false}
            labelLine={showLabels}
            isAnimationActive
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              Number(value).toLocaleString(),
              String(name),
            ]}
            contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.lightGreen}` }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: COLORS.muted }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {(centerValue || centerLabel) && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          style={{ top: showLegend ? '-12%' : 0 }}
        >
          {centerValue && (
            <span className="font-heading text-2xl font-bold text-ink">{centerValue}</span>
          )}
          {centerLabel && <span className="text-xs text-muted">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
