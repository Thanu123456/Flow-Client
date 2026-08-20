import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
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
