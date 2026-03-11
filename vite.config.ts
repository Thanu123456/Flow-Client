import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:8090',
        target: 'http://localhost:7560',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
