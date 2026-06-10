/**
 * MetricCard — KPI tile.
 *
 * Two visual variants:
 *  - `tile` (default): compact sub-metric. No rail, regular padding.
 *  - `kpi`: top-level summary. Colored top-rail keyed by `tone`, larger
 *    value, more breathing room. Use for the headline metrics on a page.
 *
 * `tone` controls the rail color on the `kpi` variant: `primary` for
 * positive program metrics, `accent` for live activity, `warning` for
 * watch-list metrics (stockout risk, low coverage), `danger` for true
 * deficits (deaths, hard stockouts), `neutral` for everything else.
 */

import type { ReactNode } from 'react'

export type SubtitleColor = 'green' | 'red' | 'neutral'
export type MetricSize = 'sm' | 'md' | 'lg' | 'xl'
export type MetricVariant = 'tile' | 'kpi'
export type MetricTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  subtitleColor?: SubtitleColor
  /** "raw" prints as-is; "number" formats with locale commas */
  format?: 'number' | 'raw'
  size?: MetricSize
  variant?: MetricVariant
  tone?: MetricTone
  onClick?: () => void
  /** Optional icon node rendered top-right */
  icon?: ReactNode
  /** Render the parenthesised fraction on its own line below the value
   *  (slightly larger than the inline superscript, still sub-headline). */
  fractionBelow?: boolean
}

const SUBTITLE_CLASS: Record<SubtitleColor, string> = {
  green: 'text-accent',
  red: 'text-danger',
  neutral: 'text-muted',
}

const VALUE_SIZE: Record<MetricSize, string> = {
  sm: 'text-xl',
  md: 'text-[26px] leading-[1.1]',
  lg: 'text-[34px] leading-[1.05]',
  xl: 'text-[48px] leading-[1]',
}

// Fraction size when `fractionBelow` puts it on its own line. Each is a
// slight bump over the inline 0.55em superscript yet stays comfortably
// smaller than the matching VALUE_SIZE percentage above it.
const FRACTION_BELOW_SIZE: Record<MetricSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
}

const RAIL_CLASS: Record<MetricTone, string> = {
  neutral: 'srh-rail srh-rail-neutral',
  primary: 'srh-rail srh-rail-primary',
  accent: 'srh-rail srh-rail-accent',
  warning: 'srh-rail srh-rail-warning',
  danger: 'srh-rail srh-rail-danger',
}

/**
 * Split a "67% (1,200/1,800)" style string into the headline and the
 * parenthesised fraction so the fraction can render smaller. Returns
 * `null` for the fraction when the value has no parenthesised suffix.
 */
function splitParenthesised(s: string): { head: string; tail: string | null } {
  const m = s.match(/^(.+?)\s*\(([^()]+)\)\s*$/)
  if (!m) return { head: s, tail: null }
  return { head: m[1].trim(), tail: m[2].trim() }
}

export function MetricCard({
  title,
  value,
  subtitle,
  subtitleColor = 'neutral',
  format = 'raw',
  size = 'md',
  variant = 'tile',
  tone = 'neutral',
  onClick,
  icon,
  fractionBelow = false,
}: MetricCardProps) {
  const raw =
    format === 'number' && typeof value === 'number' ? value.toLocaleString() : value
  const displayStr = typeof raw === 'string' ? raw : String(raw)
  const { head, tail } = splitParenthesised(displayStr)

  const interactive = typeof onClick === 'function'
  const isKpi = variant === 'kpi'

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      className={[
        // h-full so the card stretches to fill its grid/flex cell — keeps
        // neighbouring cards in the same row visually equal in length
        // even when their content has different vertical weight.
        'srh-fade-in srh-surface flex h-full flex-col',
        isKpi ? 'p-5 pt-[18px]' : 'p-4',
        isKpi ? RAIL_CLASS[tone] : '',
        interactive
          ? 'srh-surface-hover cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-page'
          : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="srh-label">{title}</p>
        {icon && <span className="text-primary/60">{icon}</span>}
      </div>

      {/* `key={displayStr}` remounts this element whenever the displayed
          value changes — pairs with the `srh-pulse` animation to give a
          soft visual cue when a filter narrows or widens the KPI. */}
      <p
        key={displayStr}
        className={`srh-kpi-value srh-pulse mt-2 ${VALUE_SIZE[size]}`}
      >
        {head}
        {tail && !fractionBelow && (
          <span className="ml-1.5 align-middle text-[0.55em] font-semibold text-muted">
            ({tail})
          </span>
        )}
      </p>
      {tail && fractionBelow && (
        <p className={`mt-1 font-semibold text-muted ${FRACTION_BELOW_SIZE[size]}`}>
          ({tail})
        </p>
      )}

      {subtitle && (
        <p className={`mt-1.5 text-[13px] font-semibold ${SUBTITLE_CLASS[subtitleColor]}`}>
          {subtitle}
        </p>
      )}

      {interactive && (
        <p className="mt-3 text-[10px] font-medium uppercase tracking-label text-primary/70">
          Hover to deep dive →
        </p>
      )}
    </div>
  )
}
