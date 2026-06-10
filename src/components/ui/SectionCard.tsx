/**
 * SectionCard — titled container that groups related metrics/charts.
 *
 * Header is a clean title with a 3px vertical accent rail on its left,
 * keyed by `tone`. Replaces the original Power BI-style coloured strip
 * with a lighter treatment that lets the contained metrics carry the
 * visual weight.
 *
 * `tone="primary"` (default) marks ordinary sections; `"warning"` flags
 * watch-list content (stockout risk); `"danger"` flags deficit content
 * (deaths). The rail color is the only chrome change between tones —
 * the body stays neutral so cautionary sections don't feel alarming.
 */

import type { ReactNode } from 'react'

type SectionTone = 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'

interface SectionCardProps {
  title: string
  tone?: SectionTone
  children: ReactNode
  onClick?: () => void
  /** Optional element rendered on the right of the header (e.g. a slicer). */
  action?: ReactNode
  /** Extra classes on the root <section> (e.g. `flex-1` to stretch in a
   *  flex column so the card aligns its bottom edge with a taller sibling). */
  className?: string
}

const RAIL_COLOR: Record<SectionTone, string> = {
  primary: 'border-primary',
  accent: 'border-accent',
  warning: 'border-amber-500',
  danger: 'border-danger',
  neutral: 'border-slate-300',
}

export function SectionCard({
  title,
  tone = 'primary',
  children,
  onClick,
  action,
  className = '',
}: SectionCardProps) {
  const interactive = typeof onClick === 'function'

  return (
    <section
      className={[
        'srh-fade-in srh-surface overflow-hidden',
        interactive ? 'srh-surface-hover cursor-pointer' : '',
        className,
      ].join(' ')}
      onClick={onClick}
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
        <h3
          className={`srh-section-title border-l-[3px] pl-3 ${RAIL_COLOR[tone]}`}
        >
          {title}
        </h3>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
