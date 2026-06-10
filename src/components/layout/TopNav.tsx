/**
 * TopNav — horizontal page navigation.
 *
 * Active tab gets a thick green underline accent. On the right of the bar
 * we surface the reporting-period badge and the live "last updated" stamp
 * coming from useODKData.
 *
 * On screens < 1024px the tabs collapse to a hamburger drawer trigger
 * (handled by the parent PageShell, since it also owns the FilterPanel
 * drawer state).
 */

import { NavLink } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Menu } from 'lucide-react'
import { PAGES } from '../../lib/constants'
import { useODKData } from '../../hooks/useODKData'
import { useFilterStore } from '../../store/filterStore'

interface TopNavProps {
  /** Mobile hamburger handler (opens the FilterPanel drawer). */
  onOpenFilters?: () => void
}

export function TopNav({ onOpenFilters }: TopNavProps) {
  const { lastUpdated, isLoading } = useODKData()
  const reportingMonth = useFilterStore((s) => s.reportingMonth)

  return (
    <header className="flex shrink-0 items-stretch border-b border-black/5 bg-card">
      {/* Brand region — matches the FilterPanel sidebar width on lg+ so the
          right edge of "Program Implementation" lines up with the sidebar's
          right border. On smaller screens it shrinks to fit content. */}
      <div className="flex items-center gap-2 px-4 py-2.5 lg:w-52 lg:shrink-0 lg:border-r lg:border-black/5">
        {/* Mobile hamburger lives here so it stays at the far left. */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-light-green hover:text-primary lg:hidden"
            aria-label="Open filters"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-white">
          S
        </div>
        <div className="hidden min-w-0 leading-tight sm:block">
          <p className="truncate font-heading text-sm font-bold text-ink">
            SRH Dashboard
          </p>
          <p className="truncate text-[10px] uppercase tracking-wider text-muted">
            Program Implementation
          </p>
        </div>
      </div>

      {/* Content region — mirrors the main scroll area; holds tabs + right rail. */}
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 lg:px-5">
        <nav className="hidden min-w-0 flex-1 items-stretch lg:flex">
          {PAGES.map((page) => (
            <NavLink
              key={page.path}
              to={page.path}
              end={page.path === '/'}
              className={({ isActive }) =>
                [
                  'srh-focus relative whitespace-nowrap rounded-sm px-2 py-3 text-[13px] font-medium transition-colors xl:px-2.5',
                  isActive ? 'text-primary' : 'text-muted hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {page.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-[3px] rounded-t-full bg-accent" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right rail. Compact: month-only badge + last-updated stamp that
            hides when there's nothing meaningful to display (no
            "Awaiting data" filler that overlaps the last tab). */}
        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          {reportingMonth !== 'All' && (
            <span className="hidden rounded-full bg-light-green px-2.5 py-1 text-[11px] font-semibold text-primary md:inline-flex">
              {reportingMonth}
            </span>
          )}
          {(isLoading || lastUpdated) && (
            <span className="hidden whitespace-nowrap text-[11px] text-muted xl:inline">
              {isLoading
                ? 'Refreshing…'
                : `Updated ${formatDistanceToNow(lastUpdated!, { addSuffix: true })}`}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
