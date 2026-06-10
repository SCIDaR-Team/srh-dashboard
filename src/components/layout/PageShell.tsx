/**
 * PageShell — fixed-viewport app frame.
 *
 *   ┌────────────────────────────────────────────────────────┐
 *   │ TopNav  (fixed)                                        │
 *   ├──────────────┬─────────────────────────────────────────┤
 *   │ FilterPanel  │ <main> — the only scrollable region     │
 *   │ (fixed left) │                                         │
 *   │              │                                         │
 *   └──────────────┴─────────────────────────────────────────┘
 *
 * Per-route configuration (filter visibility + variant) lives in the
 * `ROUTE_CONFIG` map at the bottom of this file. Pages that don't appear
 * use the default (sidebar visible, default variant).
 *
 * On screens < 1024px the FilterPanel becomes a drawer triggered by a
 * hamburger button in TopNav.
 */

import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { TopNav } from './TopNav'
import { FilterPanel } from './FilterPanel'

interface RouteConfig {
  showFilters?: boolean
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  '/': { showFilters: false },
}

export function PageShell() {
  const { pathname } = useLocation()
  const config = ROUTE_CONFIG[pathname] ?? {}
  const showFilters = config.showFilters !== false

  // Mobile drawer state for FilterPanel.
  const [drawerOpen, setDrawerOpen] = useState(false)
  // Close the drawer whenever the route changes.
  useEffect(() => setDrawerOpen(false), [pathname])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-page">
      <TopNav onOpenFilters={showFilters ? () => setDrawerOpen(true) : undefined} />

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        {showFilters && (
          <div className="hidden lg:block">
            <FilterPanel />
          </div>
        )}

        {/* Mobile drawer */}
        {showFilters && drawerOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
              role="presentation"
            />
            <div className="lg:hidden">
              <FilterPanel
                isDrawer
                onDismiss={() => setDrawerOpen(false)}
              />
            </div>
          </>
        )}

        {/* Scrollable content */}
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/** Convenience wrapper for grouping a page section under a heading. */
export function Section({
  title,
  description,
  children,
}: {
  title?: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-4">
      {title && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">{title}</h2>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
