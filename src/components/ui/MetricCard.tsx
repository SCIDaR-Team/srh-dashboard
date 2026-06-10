/**
 * MetricCard — compact KPI tile.
 *
 * Title on top (small, muted, uppercase tracking-wide), big value centred,
 * optional sub-line (MoM delta, percentage label, etc.) under the value.
 * Optional click handler turns the card into a deep-dive launcher and
 * surfaces a "Click to deep dive" hint at the bottom.
 *
 * The subtle on-mount fade-in is done with a CSS-only utility class rather
 * than a library, to keep the bundle lean.
 */

import type { ReactNode } from 'react'

export type SubtitleColor = 'green' | 'red' | 'neutral'

export type MetricSize = 'sm' | 'md' | 'lg'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  subtitleColor?: SubtitleColor
  /** "raw" prints as-is; "number" formats with locale commas */
  format?: 'number' | 'raw'
  size?: MetricSize
  onClick?: () => void
  /** Optional icon node rendered top-right */
  icon?: ReactNode
}

const SUBTITLE_CLASS: Record<SubtitleColor, string> = {
  green: 'text-accent',
  red: 'text-danger',
  neutral: 'text-muted',
}

const VALUE_CLASS: Record<MetricSize, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export function MetricCard({
  title,
  value,
  subtitle,
  subtitleColor = 'neutral',
  format = 'raw',
  size = 'md',
  onClick,
  icon,
}: MetricCardProps) {
  const display =
    format === 'number' && typeof value === 'number' ? value.toLocaleString() : value

  const interactive = typeof onClick === 'function'

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
        'srh-fade-in flex flex-col rounded-xl border border-gray-100 bg-card p-4 shadow-sm transition-shadow',
        interactive ? 'cursor-pointer hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
        {icon && <span className="text-primary/60">{icon}</span>}
      </div>

      <p
        className={`mt-2 font-heading font-bold text-ink tabular-nums ${VALUE_CLASS[size]}`}
      >
        {display}
      </p>

      {subtitle && (
        <p className={`mt-1 text-sm font-semibold ${SUBTITLE_CLASS[subtitleColor]}`}>
          {subtitle}
        </p>
      )}

      {interactive && (
        <p className="mt-3 text-[11px] uppercase tracking-wider text-primary/70">
          Click to deep dive →
        </p>
      )}
    </div>
  )
}
