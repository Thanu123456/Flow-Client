import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  // Precaches the app shell so a kiosk device that refreshes (or crashes and
  // restarts) while offline still loads the UI — the offline sales queue
  // (src/utils/offline) handles data resilience once it's up. API calls are
  // deliberately left uncached (NetworkOnly): a stale product/price response
  // served from cache would be worse than a visible request failure.
  VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      // The main bundle is a few MB unminified-JS-worth over Workbox's 2 MiB
      // default (see the "chunks larger than 500 kB" build warning — a
      // separate code-splitting opportunity, not addressed here). Raised so
      // it still gets precached; without it the app shell wouldn't load at
      // all on an offline refresh, which defeats the point of this plugin.
      maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: /^\/api\//,
          handler: 'NetworkOnly',
        },
      ],
    },
    manifest: {
      name: 'Flow POS',
      short_name: 'Flow POS',
      start_url: '/kiosk/login',
      display: 'standalone',
      theme_color: '#1677ff',
      background_color: '#f5f7fa',
      icons: [],
    },
  }),
  ],
  server: {
    //Frontend
    port: 7718,
    //Backend
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    force: false, // set to true temporarily if ERR_CACHE_READ_FAILURE recurs after clearing cache
  },
})
