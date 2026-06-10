/**
 * SectionCard — titled container used to group related metrics/charts
 * (e.g. "Family Planning", "Maternal and Newborn Health").
 *
 * Visual style follows the original Power BI dashboard: a coloured strip
 * across the top carrying the section title, then a clean white body.
 */

import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  /** Header strip background colour. Defaults to the light-green band. */
  headerColor?: string
  children: ReactNode
  onClick?: () => void
  /** Optional element rendered on the right of the header (e.g. a slicer). */
  action?: ReactNode
}

export function SectionCard({
  title,
  headerColor = '#E8F5E9',
  children,
  onClick,
  action,
}: SectionCardProps) {
  const interactive = typeof onClick === 'function'

  return (
    <section
      className={[
        'srh-fade-in overflow-hidden rounded-xl border border-gray-100 bg-card shadow-sm transition-shadow',
        interactive ? 'cursor-pointer hover:shadow-md' : '',
      ].join(' ')}
      onClick={onClick}
    >
      <header
        className="flex items-center justify-between gap-3 px-5 py-2.5"
        style={{ backgroundColor: headerColor }}
      >
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary/80">
          {title}
        </h3>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
