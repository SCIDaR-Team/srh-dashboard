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
        // Greens
        primary: {
          DEFAULT: '#006B3F', // dark green — headers, sidebar, nav buttons
          50: '#E8F5E9',
          600: '#006B3F',
          700: '#00543192',
        },
        accent: {
          DEFAULT: '#00A859', // positive values, stocked, "yes"
          green: '#00A859',
        },
        'light-green': '#E8F5E9', // section backgrounds, light fills

        // Alerts
        danger: '#E52834', // negative values, deaths, stockouts, warnings
        rose: '#FFC0CB', // stockout indicators (pink/rose)
        warning: '#FFE4B5', // critical stock indicators (orange)

        // Text
        ink: '#1A1A1A', // dark text
        muted: '#6B7280', // muted text

        // Surfaces
        card: '#FFFFFF', // card background
        page: '#F0F4F0', // page background (light sage-green tint)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"DM Sans"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
      },
      borderRadius: {
        card: '0.875rem',
      },
    },
  },
  plugins: [],
}

export default config
