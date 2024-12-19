// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false
    }
  },
  base: mode === 'production' ? '/bps-gude/' : '/',
  build: {
    outDir: 'docs', // Si estás usando 'docs' para GitHub Pages
  },
}))
