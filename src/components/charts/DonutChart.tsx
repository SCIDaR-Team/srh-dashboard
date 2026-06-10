/**
 * DonutChart — Recharts PieChart wrapper with the SRH look.
 *
 * Supports an optional centred summary (centerLabel + centerValue) for the
 * common "73% (1,204 clients)" pattern. External labels show count + %.
 */

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CHART_SERIES_COLORS } from '../../lib/constants'
import { CHART_LEGEND_STYLE, ChartTooltip, ChartEmpty } from '../../lib/chartTheme'

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
  /** Draw each slice's value on the slice (default true) so users don't
   *  have to hover. Slivers under 4% are skipped to avoid clutter. */
  showLabels?: boolean
  centerLabel?: string
  centerValue?: string
  showLegend?: boolean
}

const RADIAN = Math.PI / 180

/** Pick ink or white text for legibility against a slice fill, by luminance. */
function readableOn(hex: string): string {
  const c = hex.replace('#', '')
  if (c.length < 6) return '#FFFFFF'
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.62 ? '#1A1A1A' : '#FFFFFF'
}

interface SliceLabelProps {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
  value: number
  fill: string
}

export function DonutChart({
  data,
  size = 220,
  innerRadius = 50,
  showLabels = true,
  centerLabel,
  centerValue,
  showLegend = true,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return <ChartEmpty height={size} variant="donut" />
  }

  // Per-slice value drawn at the mid-radius of the ring (no leader lines, so
  // it never overflows the container or collides with the legend/centre).
  const renderSliceValue = (props: SliceLabelProps) => {
    const { cx, cy, midAngle, innerRadius: ir, outerRadius: or, percent, value, fill } = props
    if (!percent || percent < 0.04) return null
    const r = ir + (or - ir) / 2
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        fill={readableOn(fill)}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: 12, fontWeight: 700 }}
      >
        {Number(value).toLocaleString()}
      </text>
    )
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
            label={showLabels ? renderSliceValue : false}
            labelLine={false}
            isAnimationActive
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.color ?? CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={CHART_LEGEND_STYLE}
            />
          )}
        </PieChart>
      </ResponsiveContainer>

      {(centerValue || centerLabel) && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1"
          style={{ top: showLegend ? '-12%' : 0 }}
        >
          {centerValue && (
            <span className="srh-kpi-value text-[26px] leading-[1.05]">
              {centerValue}
            </span>
          )}
          {centerLabel && <span className="srh-label">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
