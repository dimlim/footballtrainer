import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import { VitePWA } from 'vite-plugin-pwa'; // Temporarily disabled due to babel compatibility issue
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // PWA temporarily disabled - workbox has babel compatibility issues
    // TODO: Re-enable when workbox-build is updated
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
