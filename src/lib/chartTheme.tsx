/**
 * chartTheme — single source of truth for Recharts chrome.
 *
 * Every chart wrapper in `components/charts/` pulls its axis / grid /
 * tooltip / legend / margin props from here so the look stays consistent
 * across the dashboard and a future restyle is a one-file edit.
 *
 * Also exports `ChartTooltip` (a custom Recharts tooltip body) and
 * `ChartEmpty` (a skeleton-shaped placeholder for "no data" states).
 */

import type { CSSProperties } from 'react'
import { COLORS } from './constants'

/* ───── Static chrome ──────────────────────────────────────────────── */

/** Tick label style, applied via the `tick` prop on XAxis / YAxis. */
export const CHART_AXIS_TICK = {
  fontSize: 11,
  fill: COLORS.slate500,
  fontWeight: 500,
} as const

/** Grid line stroke color (slate-200). Paired with `strokeDasharray="3 3"`. */
export const CHART_GRID_STROKE = COLORS.slate200

/** Bar-hover cursor fill (slate-100, fully opaque — reads as a subtle wash). */
export const CHART_CURSOR_FILL = COLORS.slate100

/** Legend text style, applied via Recharts' `wrapperStyle`. */
export const CHART_LEGEND_STYLE: CSSProperties = {
  fontSize: 12,
  color: COLORS.slate500,
  paddingTop: 6,
}

/** Default chart margins. Override per-chart where needed (e.g. extra
 *  right padding for value labels on horizontal bars). */
export const CHART_MARGIN = { top: 8, right: 16, bottom: 4, left: 0 } as const

/* ───── Custom tooltip ─────────────────────────────────────────────── */

interface ChartTooltipProps {
  /** Suffix appended to numeric values (e.g. "%"). */
  unit?: string
  /** Format the X-axis label shown above the series rows. */
  labelFormatter?: (label: unknown) => string
  // Props injected by Recharts when used as a `<Tooltip content={...} />`.
  active?: boolean
  payload?: Array<{
    name?: string | number
    value?: number | string
    color?: string
    dataKey?: string | number
  }>
  label?: string | number
}

/**
 * Compact tooltip card — slate-200 border, no shadow, tabular-nums values,
 * coloured dot per series. Designed to disappear into the page rather than
 * compete with the chart for attention.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  unit = '',
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  const displayLabel =
    label != null
      ? labelFormatter
        ? labelFormatter(label)
        : String(label)
      : null

  return (
    <div className="rounded-md border border-slate-200 bg-card px-3 py-2 text-[12px] shadow-card">
      {displayLabel && (
        <p className="mb-1 text-[11px] font-medium uppercase tracking-label text-muted">
          {displayLabel}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((p, i) => {
          const v = Number(p.value ?? 0)
          return (
            <li
              key={`${p.dataKey ?? p.name ?? i}`}
              className="flex items-center gap-2"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
                aria-hidden="true"
              />
              <span className="text-ink">{String(p.name ?? '')}</span>
              <span className="ml-auto pl-3 font-semibold tabular-nums text-ink">
                {v.toLocaleString()}
                {unit}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ───── Empty state ────────────────────────────────────────────────── */

interface ChartEmptyProps {
  height?: number
  /** Custom message; defaults to a friendly placeholder line. */
  label?: string
  /** Visual hint — `bar` shows stub bars, `area` shows a stub area,
   *  `donut` shows a stub ring. Defaults to `bar`. */
  variant?: 'bar' | 'area' | 'donut'
}

/**
 * Skeleton-shaped placeholder for charts with no data in scope. Mirrors
 * the visual footprint of the chart it replaces so the layout doesn't
 * jump between empty / populated states.
 */
export function ChartEmpty({
  height = 260,
  label = 'No data for the selected scope.',
  variant = 'bar',
}: ChartEmptyProps) {
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50/60"
      style={{ height }}
      role="status"
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-end justify-around px-8 pb-8 opacity-40"
        aria-hidden="true"
      >
        {variant === 'bar' &&
          [0.55, 0.8, 0.35, 0.65, 0.45].map((h, i) => (
            <span
              key={i}
              className="w-6 rounded-t-sm bg-slate-200"
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          ))}
        {variant === 'area' && (
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <path
              d="M0,32 L20,22 L40,28 L60,16 L80,22 L100,12 L100,40 L0,40 Z"
              fill={COLORS.slate200}
            />
          </svg>
        )}
        {variant === 'donut' && (
          <div className="my-auto h-32 w-32 rounded-full border-[14px] border-slate-200" />
        )}
      </div>
      <p className="relative z-10 text-sm text-muted">{label}</p>
    </div>
  )
}
