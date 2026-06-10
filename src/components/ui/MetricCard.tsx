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
export type MetricSize = 'sm' | 'md' | 'lg'
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
}

const RAIL_CLASS: Record<MetricTone, string> = {
  neutral: 'srh-rail srh-rail-neutral',
  primary: 'srh-rail srh-rail-primary',
  accent: 'srh-rail srh-rail-accent',
  warning: 'srh-rail srh-rail-warning',
  danger: 'srh-rail srh-rail-danger',
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
}: MetricCardProps) {
  const display =
    format === 'number' && typeof value === 'number' ? value.toLocaleString() : value

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
        'srh-fade-in srh-surface flex flex-col',
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

      <p className={`srh-kpi-value mt-2 ${VALUE_SIZE[size]}`}>{display}</p>

      {subtitle && (
        <p className={`mt-1.5 text-[13px] font-semibold ${SUBTITLE_CLASS[subtitleColor]}`}>
          {subtitle}
        </p>
      )}

      {interactive && (
        <p className="mt-3 text-[10px] font-medium uppercase tracking-label text-primary/70">
          Click to deep dive →
        </p>
      )}
    </div>
  )
}
