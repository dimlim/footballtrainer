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
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'motion'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-date': ['date-fns'],
          
          // Feature chunks
          'feature-auth': [
            './src/stores/authStore.ts',
            './src/pages/AuthPage.tsx',
          ],
          'feature-coach': [
            './src/stores/coachProgramStore.ts',
            './src/stores/coachActivityStore.ts',
          ],
          'feature-subscription': [
            './src/stores/subscriptionStore.ts',
            './src/lib/stripe.ts',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
