/**
 * DonutChart — Recharts PieChart wrapper with the SRH look.
 *
 * Supports an optional centred summary (centerLabel + centerValue) for the
 * common "73% (1,204 clients)" pattern. External labels show count + %.
 */

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import { CHART_SERIES_COLORS } from '../../lib/constants'
import { CHART_LEGEND_STYLE, ChartEmpty } from '../../lib/chartTheme'

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

  // Per-slice value: drawn inside at the mid-radius when the arc is wide
  // enough; otherwise drawn outside with a short leader line so thin slices
  // (e.g. 4th visit, None) remain readable without distorting the donut.
  const renderSliceValue = (props: PieLabelRenderProps) => {
    const cx = Number(props.cx ?? 0)
    const cy = Number(props.cy ?? 0)
    const midAngle = Number(props.midAngle ?? 0)
    const ir = Number(props.innerRadius ?? 0)
    const or = Number(props.outerRadius ?? 0)
    const percent = Number(props.percent ?? 0)
    const value = Number(props.value ?? 0)
    const fill = (props.fill as string | undefined) ?? '#FFF'
    if (!percent) return null

    const text = value.toLocaleString()
    const fontSize = 12
    // Rough text-width estimate (avg glyph ~0.6em for digits/comma).
    const approxTextWidth = text.length * fontSize * 0.6
    const midR = ir + (or - ir) / 2
    const arcLen = 2 * Math.PI * midR * percent
    const cos = Math.cos(-midAngle * RADIAN)
    const sin = Math.sin(-midAngle * RADIAN)

    if (arcLen >= approxTextWidth + 4) {
      const x = cx + midR * cos
      const y = cy + midR * sin
      return (
        <text
          x={x}
          y={y}
          fill={readableOn(fill)}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize, fontWeight: 700 }}
        >
          {text}
        </text>
      )
    }

    // External label with a short leader line.
    const sx = cx + or * cos
    const sy = cy + or * sin
    const mx = cx + (or + 8) * cos
    const my = cy + (or + 8) * sin
    const horizDir = cos >= 0 ? 1 : -1
    const ex = mx + horizDir * 10
    const ey = my
    const textAnchor = horizDir === 1 ? 'start' : 'end'

    return (
      <g>
        <path
          d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
          stroke={fill}
          strokeWidth={1}
          fill="none"
        />
        <text
          x={ex + horizDir * 2}
          y={ey}
          fill="#1A1A1A"
          textAnchor={textAnchor}
          dominantBaseline="central"
          style={{ fontSize, fontWeight: 700 }}
        >
          {text}
        </text>
      </g>
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
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 px-2"
        >
          {centerValue && (
            <span className="srh-kpi-value text-center text-[26px] leading-[1.05]">
              {centerValue}
            </span>
          )}
          {centerLabel && <span className="srh-label text-center text-xs leading-tight">{centerLabel}</span>}
        </div>
      )}
    </div>
  )
}
