import type { Config } from 'tailwindcss'

/**
 * SRH Program Dashboard — Tailwind theme.
 *
 * Loaded by Tailwind v4 through the `@config` directive in `src/index.css`.
 * The palette below is the single source of truth for brand colours; use the
 * semantic names (e.g. `bg-primary`, `text-danger`) throughout the app rather
 * than raw hex values.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Greens — used meaningfully (brand mark, active nav, positive accents).
        primary: {
          DEFAULT: '#006B3F',
          50: '#E8F5E9',
          600: '#006B3F',
          700: '#00543192',
        },
        accent: {
          DEFAULT: '#00A859',
          green: '#00A859',
        },
        'light-green': '#E8F5E9',

        // Alerts — three-step severity scale. Amber sits between neutral and
        // danger so stockout-risk / low-coverage can read as cautionary
        // without competing with true deficits in red.
        danger: '#DC2626', // deficits, deaths, hard stockouts (slightly desaturated from #E52834)
        amber: {
          DEFAULT: '#E0950B',
          50: '#FFFBEB',
          500: '#E0950B',
          600: '#C57F08',
        },
        rose: '#F2536D', // strengthened from pale #FFC0CB for legibility
        warning: '#E0950B', // deepened amber — visible on white, still calm

        // Text
        ink: '#1A1A1A',
        muted: '#6B7280',

        // Neutral chrome ramp — chart axes, borders, secondary chrome.
        // Standard slate-aligned scale; pairs with greens without competing.
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Surfaces
        card: '#FFFFFF',
        page: '#F6F7F9', // neutral slate-tinted near-white (was sage-green #F0F4F0)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"DM Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        // Three-step elevation. L0 has no shadow (flat against page bg);
        // L1 is the resting card; L2 is hover / popover / focused state.
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 1px 0 rgb(15 23 42 / 0.03)',
        'card-hover':
          '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.05)',
        rail: 'inset 0 3px 0 0 currentColor',
      },
      borderRadius: {
        card: '0.875rem',
      },
      letterSpacing: {
        label: '0.08em',
      },
    },
  },
  plugins: [],
}

export default config
