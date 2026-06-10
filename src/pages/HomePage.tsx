/**
 * Home — landing page.
 *
 * Single-viewport layout: the page sits in a flex column that fills the
 * height of <main> exactly. Hero, primary nav grid, and secondary nav
 * row are sized to fit standard desktop viewports without scrolling.
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useODKData } from '../hooks/useODKData'
import {
  LayoutDashboard,
  HeartPulse,
  Building2,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  Layers,
  type LucideIcon,
} from 'lucide-react'

type Tone = 'primary' | 'accent' | 'warning' | 'neutral'

interface NavCardConfig {
  path: string
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
}

const PRIMARY: NavCardConfig[] = [
  {
    path: '/overview',
    title: 'Overview',
    description: 'Top-level KPIs across coverage, MNH, FP, ASRH, GBV, PAC.',
    icon: LayoutDashboard,
    tone: 'primary',
  },
  {
    path: '/service-delivery',
    title: 'Service Delivery',
    description: 'Delivery indicators, ANC waterfall, FP methods, stock-out risk.',
    icon: HeartPulse,
    tone: 'accent',
  },
  {
    path: '/facility-functionality',
    title: 'Facility Functionality',
    description: 'HR for health, infrastructure, equipment, emergency services.',
    icon: Building2,
    tone: 'primary',
  },
  {
    path: '/demand-generation',
    title: 'Demand Generation',
    description: 'Referrals, Big Sisters, line-listed clients.',
    icon: Megaphone,
    tone: 'accent',
  },
  {
    path: '/governance',
    title: 'Governance',
    description: 'TWG, policy adoption, BHCPF funding, insurance, VGF.',
    icon: ShieldCheck,
    tone: 'primary',
  },
]

const SECONDARY: NavCardConfig[] = [
  {
    path: '/trend-analysis',
    title: 'Trend Analysis',
    description: 'Indicator-by-indicator monthly trend.',
    icon: TrendingUp,
    tone: 'neutral',
  },
  {
    path: '/facility-deepdive',
    title: 'Facility Deepdive',
    description: 'State → LGA → Facility drill-down matrix.',
    icon: Layers,
    tone: 'neutral',
  },
]

const RAIL_BY_TONE: Record<Tone, string> = {
  primary: 'srh-rail srh-rail-primary',
  accent: 'srh-rail srh-rail-accent',
  warning: 'srh-rail srh-rail-warning',
  neutral: 'srh-rail srh-rail-neutral',
}

const ICON_BG_BY_TONE: Record<Tone, string> = {
  primary: 'bg-light-green text-primary group-hover:bg-primary group-hover:text-white',
  accent: 'bg-light-green text-accent group-hover:bg-accent group-hover:text-white',
  warning: 'bg-amber/10 text-amber-600 group-hover:bg-amber group-hover:text-white',
  neutral: 'bg-slate-100 text-slate-600 group-hover:bg-slate-700 group-hover:text-white',
}

export default function HomePage() {
  useDocumentTitle('Home')
  const { data: raw } = useODKData()

  // Live program coverage strip. Pulled from the raw corpus so the
  // numbers reflect what the dashboard currently has loaded.
  const stats = useMemo(() => {
    if (!raw || raw.length === 0) return null
    const states = new Set<string>()
    const facilities = new Set<string>()
    const months = new Set<string>()
    for (const r of raw) {
      if (r.State) states.add(r.State)
      if (r.facility_name) facilities.add(r.facility_name)
      if (r.Reporting_month) months.add(r.Reporting_month)
    }
    return {
      states: states.size,
      facilities: facilities.size,
      months: months.size,
    }
  }, [raw])

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
      {/* Hero — fixed-size editorial slab. Sized so the entire page fits
          without scrolling on standard desktop viewports. */}
      <header
        className="srh-fade-in relative shrink-0 overflow-hidden rounded-2xl px-6 py-7 text-white shadow-card sm:px-10 sm:py-9"
        style={{
          background:
            'linear-gradient(135deg, #02331E 0%, #006B3F 65%, #028049 100%)',
        }}
      >
        {/* Subtle ambient highlight in the top-right — adds depth without
            tipping the surface into marketing territory. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl"
        />

        <div className="relative">
          <h1 className="font-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
            Sexual and Reproductive Health (SRH) Program Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-light-green/90 sm:text-[15px]">
            Provides a comprehensive view of program implementation, service
            delivery performance, commodity security, and governance commitments
            across participating states.
          </p>

          {/* Stats strip — appears only once the ODK corpus has loaded. */}
          {stats && (
            <dl className="mt-5 flex flex-wrap items-baseline gap-x-7 gap-y-2 text-white">
              <Stat label="states" value={stats.states} />
              <span
                aria-hidden
                className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block"
              />
              <Stat label="facilities" value={stats.facilities} />
              <span
                aria-hidden
                className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-block"
              />
              <Stat
                label={stats.months === 1 ? 'month reported' : 'months reported'}
                value={stats.months}
              />
            </dl>
          )}
        </div>
      </header>

      {/* Primary nav — fills remaining vertical space; cards stretch to
          a uniform height inside the row. */}
      <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRIMARY.map((card) => (
          <NavCard key={card.path} {...card} />
        ))}
      </section>

      {/* Secondary nav — compact row above the partner footer. */}
      <section className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {SECONDARY.map((card) => (
          <NavCard key={card.path} {...card} compact />
        ))}
      </section>

      {/* Partner credit — slim strip at the very bottom. */}
      <footer className="shrink-0 border-t border-slate-200 pb-1 pt-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          In partnership with
          <span className="ml-2 normal-case tracking-normal text-ink">
            SWAP · State Government · Federal Ministry of Health
          </span>
        </p>
      </footer>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="srh-pulse font-heading text-2xl font-bold tabular-nums text-white sm:text-[26px]">
        {value.toLocaleString()}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
        {label}
      </span>
    </div>
  )
}

function NavCard({
  path,
  title,
  description,
  icon: Icon,
  tone,
  compact = false,
}: NavCardConfig & { compact?: boolean }) {
  return (
    <Link
      to={path}
      className={[
        'srh-fade-in srh-surface srh-surface-hover srh-focus group flex h-full items-start gap-4 p-5',
        RAIL_BY_TONE[tone],
      ].join(' ')}
    >
      <span
        className={[
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors',
          ICON_BG_BY_TONE[tone],
        ].join(' ')}
      >
        <Icon size={compact ? 18 : 20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base font-semibold tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-snug text-muted">{description}</p>
      </div>
    </Link>
  )
}
