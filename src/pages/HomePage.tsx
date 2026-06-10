/**
 * Home — landing page.
 *
 * Hero + navigation cards + partner credit strip. Premium-feel: spacious,
 * soft gradient surface, no clip-art / hexagons. The five primary cards
 * mirror the five top-level program areas; Trend Analysis + Facility
 * Deepdive sit beneath as secondary launchers.
 */

import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
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

interface NavCardConfig {
  path: string
  title: string
  description: string
  icon: LucideIcon
}

const PRIMARY: NavCardConfig[] = [
  {
    path: '/overview',
    title: 'Overview',
    description: 'Top-level KPIs across coverage, MNH, FP, ASRH, GBV, PAC.',
    icon: LayoutDashboard,
  },
  {
    path: '/service-delivery',
    title: 'Service Delivery',
    description: 'Delivery indicators, ANC waterfall, FP methods, stock-out risk.',
    icon: HeartPulse,
  },
  {
    path: '/facility-functionality',
    title: 'Facility Functionality',
    description: 'HR for health, infrastructure, equipment, emergency services.',
    icon: Building2,
  },
  {
    path: '/demand-generation',
    title: 'Demand Generation',
    description: 'Referrals, Big Sisters, line-listed clients.',
    icon: Megaphone,
  },
  {
    path: '/governance',
    title: 'Governance',
    description: 'TWG, policy adoption, BHCPF funding, insurance, VGF.',
    icon: ShieldCheck,
  },
]

const SECONDARY: NavCardConfig[] = [
  {
    path: '/trend-analysis',
    title: 'Trend Analysis',
    description: 'Indicator-by-indicator monthly trend.',
    icon: TrendingUp,
  },
  {
    path: '/facility-deepdive',
    title: 'Facility Deepdive',
    description: 'State → LGA → Facility drill-down matrix.',
    icon: Layers,
  },
]

export default function HomePage() {
  useDocumentTitle('Home')
  return (
    <div className="mx-auto max-w-6xl space-y-12 py-6">
      {/* Hero */}
      <header
        className="srh-fade-in rounded-2xl px-8 py-12 text-white shadow-card"
        style={{
          background:
            'linear-gradient(135deg, #006B3F 0%, #00874f 55%, #00A859 100%)',
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
          Progress Dashboard
        </p>
        <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
          SRH Program Implementation
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
          Monitor the program's reach, service delivery, commodity security, and
          governance commitments across the supported states.
        </p>
        <p className="mt-6 text-xs font-medium uppercase tracking-wider text-white/70">
          as @ {format(new Date(), 'd MMMM yyyy')}
        </p>
      </header>

      {/* Primary nav cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PRIMARY.map((card) => (
          <NavCard key={card.path} {...card} />
        ))}
      </section>

      {/* Secondary nav cards */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Analysis
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECONDARY.map((card) => (
            <NavCard key={card.path} {...card} compact />
          ))}
        </div>
      </section>

      {/* Partner credit */}
      <footer className="border-t border-black/5 pt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          In partnership with
        </p>
        <p className="mt-2 text-sm font-medium text-ink">
          SWAP · State Government · Federal Ministry of Health
        </p>
      </footer>
    </div>
  )
}

function NavCard({ path, title, description, icon: Icon, compact = false }: NavCardConfig & { compact?: boolean }) {
  return (
    <Link
      to={path}
      className="srh-fade-in group flex items-start gap-4 rounded-xl border border-gray-100 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-light-green text-primary transition-colors group-hover:bg-primary group-hover:text-white"
      >
        <Icon size={compact ? 18 : 20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm leading-snug text-muted">{description}</p>
      </div>
    </Link>
  )
}
