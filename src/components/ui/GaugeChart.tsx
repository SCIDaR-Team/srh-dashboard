/**
 * GaugeChart — single-value semi-circular SVG gauge.
 *
 * Pure SVG (no Recharts), so it animates the arc fill via a CSS transition
 * on `stroke-dasharray`. Place an optional target tick at `target/max`.
 *
 * Used for percentage-of-target style indicators (Coverage, BEmONCs
 * empanelled, ANC4+ coverage, etc.).
 */

import { useEffect, useState } from 'react'
import { COLORS } from '../../lib/constants'

interface GaugeChartProps {
  value: number
  max: number
  target?: number
  label?: string
  color?: string
  /** Caption under the value, e.g. "of 250 facilities" */
  caption?: string
  /** Show value as % of max instead of raw */
  asPercent?: boolean
  size?: number
}

const STROKE_WIDTH = 14
const RADIUS = 80
const VIEW_W = 200
const VIEW_H = 130

// Half-circle path from (10, 110) through top to (190, 110).
const ARC_PATH = `M 10 110 A ${RADIUS} ${RADIUS} 0 0 1 190 110`
const ARC_LENGTH = Math.PI * RADIUS

export function GaugeChart({
  value,
  max,
  target,
  label,
  color = COLORS.accent,
  caption,
  asPercent = false,
  size = 200,
}: GaugeChartProps) {
  // Animate from 0 → value on mount.
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 60)
    return () => clearTimeout(t)
  }, [value])

  const pct = max === 0 ? 0 : Math.min(1, Math.max(0, progress / max))
  const dash = pct * ARC_LENGTH

  // Target tick: angle along the arc (0 = left, π = right).
  let tick: { x: number; y: number } | null = null
  if (target !== undefined && max > 0) {
    const tpct = Math.min(1, Math.max(0, target / max))
    const angle = Math.PI * (1 - tpct) // π → 0
    tick = {
      x: 100 + RADIUS * Math.cos(angle),
      y: 110 - RADIUS * Math.sin(angle),
    }
  }

  const display = asPercent ? `${Math.round(pct * 100)}%` : Math.round(value).toLocaleString()

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height={(size * VIEW_H) / VIEW_W}
        role="img"
        aria-label={label ? `${label}: ${display}` : `Gauge: ${display}`}
      >
        {/* Track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke={COLORS.lightGreen}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${ARC_LENGTH}`}
          style={{ transition: 'stroke-dasharray 800ms ease-out' }}
        />
        {/* Target tick */}
        {tick && (
          <line
            x1={tick.x}
            y1={tick.y - 10}
            x2={tick.x}
            y2={tick.y + 10}
            stroke={COLORS.ink}
            strokeWidth={2}
            strokeLinecap="round"
          />
        )}
        {/* Centered value */}
        <text
          x={100}
          y={95}
          textAnchor="middle"
          className="font-heading"
          style={{ fontSize: 28, fontWeight: 700, fill: COLORS.ink }}
        >
          {display}
        </text>
      </svg>
      {(label || caption) && (
        <div className="mt-1 text-center">
          {label && <p className="text-sm font-semibold text-ink">{label}</p>}
          {caption && <p className="text-xs text-muted">{caption}</p>}
        </div>
      )}
    </div>
  )
}
