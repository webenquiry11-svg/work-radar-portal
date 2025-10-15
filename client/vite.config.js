import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // THIS IS THE CRITICAL FIX:
  // It tells Vite to build all asset paths relative to /workradar/
  base: '/workradar/',

  plugins: [react()],
})