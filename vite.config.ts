import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // Proxy /api/* to the Netlify dev functions server during local dev.
    proxy: {
      '/api': {
        target: 'http://localhost:9999',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, '/.netlify/functions'),
      },
    },
  },
  build: {
    // Recharts alone is ~300 kB — split it (and other heavy vendors) into
    // dedicated chunks so they cache independently between deploys and
    // don't all need to load on first paint.
    rollupOptions: {
      output: {
        // Rolldown (Vite 8's bundler) takes the function form, not an
        // object literal. We inspect each module id and assign it to a
        // named chunk so heavy vendors get their own cacheable files.
        manualChunks: (id: string) => {
          if (id.includes('node_modules/recharts')) return 'recharts'
          if (id.includes('node_modules/lucide-react')) return 'icons'
          if (
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
    // Recharts chunk is unavoidably large; bump the warning slightly so we
    // don't get noise on every build.
    chunkSizeWarningLimit: 600,
  },
})
