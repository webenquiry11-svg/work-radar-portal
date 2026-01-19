import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to the backend server
      '/workradar/api': {
        target: 'http://127.0.0.1:2000', // Your backend server's address
        changeOrigin: true, // Recommended for virtual-hosted sites
      },
    },
  },
});