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
    <header className="flex shrink-0 items-stretch border-b border-slate-200 bg-card">
      {/* Brand region — matches the FilterPanel sidebar width on lg+ so the
          right edge of "Program Implementation" lines up with the sidebar's
          right border. On smaller screens it shrinks to fit content. */}
      <div className="flex items-center gap-2 px-4 py-2.5 lg:w-52 lg:shrink-0 lg:border-r lg:border-slate-200">
        {/* Mobile hamburger lives here so it stays at the far left. */}
        {onOpenFilters && (
          <button
            type="button"
            onClick={onOpenFilters}
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-slate-100 hover:text-ink lg:hidden"
            aria-label="Open filters"
          >
            <Menu size={18} />
          </button>
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary font-heading text-sm font-bold text-white shadow-card">
          S
        </div>
        <div className="hidden min-w-0 leading-tight sm:block">
          <p className="truncate font-heading text-sm font-bold tracking-tight text-ink">
            SRH Dashboard
          </p>
          <p className="truncate text-[10px] uppercase tracking-label text-muted">
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
                  'relative whitespace-nowrap px-2.5 py-3 text-[13px] font-medium transition-colors xl:px-3',
                  isActive
                    ? 'font-semibold text-primary'
                    : 'text-muted hover:text-ink',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  {page.label}
                  {isActive && (
                    <span
                      className="absolute inset-x-2.5 -bottom-px h-[2px] rounded-full bg-primary xl:inset-x-3"
                      aria-hidden="true"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right rail. Compact: month-only badge + last-updated stamp that
            hides when there's nothing meaningful to display. */}
        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2">
          {reportingMonth !== 'All' && (
            <span className="hidden items-center gap-1 rounded-full border border-slate-200 bg-card px-2.5 py-1 text-[11px] font-semibold text-ink md:inline-flex">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-primary"
                aria-hidden="true"
              />
              {reportingMonth}
            </span>
          )}
          {(isLoading || lastUpdated) && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap text-[11px] text-muted xl:inline-flex">
              {isLoading ? (
                <>
                  <span
                    className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber"
                    aria-hidden="true"
                  />
                  Refreshing…
                </>
              ) : (
                <>
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                  Updated {formatDistanceToNow(lastUpdated!, { addSuffix: true })}
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
