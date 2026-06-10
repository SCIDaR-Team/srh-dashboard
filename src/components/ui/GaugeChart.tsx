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
  /** Arc stroke thickness in viewBox units (default 26). */
  strokeWidth?: number
  /** Value text size in viewBox units (default 28). */
  valueFontSize?: number
}

// RADIUS must equal CHORD / 2 so the arc is a true semicircle: the path
// connects two points CHORD apart, and SVG scales the radius up to half
// that distance regardless. Keeping them in sync makes ARC_LENGTH exact, so
// a value at 100% of max fills the whole track (previously RADIUS=80 vs a
// real 90 left a ~11% gap at the end).
const CHORD = 180 // horizontal span of the half-circle arc
const RADIUS = CHORD / 2
const VIEW_H = 130
const CENTER_Y = 110
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
  strokeWidth = 26,
  valueFontSize = 28,
}: GaugeChartProps) {
  // Horizontal padding so the round stroke caps at the arc ends never clip.
  // 10 reproduces the original layout for the old 14px stroke; thicker
  // strokes widen the viewBox and the rendered SVG in lock-step, which keeps
  // the unit→pixel scale (and therefore the arc diameter, value font, and
  // spacing) identical — only the arc gets visually thicker.
  const sidePad = Math.max(10, Math.ceil(strokeWidth / 2) + 4)
  const VIEW_W = CHORD + 2 * sidePad
  const cx = sidePad + CHORD / 2
  const ARC_PATH = `M ${sidePad} ${CENTER_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${
    sidePad + CHORD
  } ${CENTER_Y}`
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
      x: cx + (CHORD / 2) * Math.cos(angle),
      y: CENTER_Y - (CHORD / 2) * Math.sin(angle),
    }
  }

  const display = asPercent ? `${Math.round(pct * 100)}%` : Math.round(value).toLocaleString()

  return (
    <div
      className="flex flex-col items-center"
      style={{ width: (size * VIEW_W) / 200 }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        height={(size * VIEW_H) / 200}
        role="img"
        aria-label={label ? `${label}: ${display}` : `Gauge: ${display}`}
      >
        {/* Track */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke={COLORS.lightGreen}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={ARC_PATH}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
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
          x={cx}
          y={95}
          textAnchor="middle"
          className="font-heading"
          style={{ fontSize: valueFontSize, fontWeight: 700, fill: COLORS.ink }}
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
