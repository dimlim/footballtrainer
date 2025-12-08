import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
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
    // Optimize for production
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          
          // Recharts - load separately (heavy)
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3-') ||
              id.includes('node_modules/victory-vendor')) {
            return 'vendor-charts';
          }
          
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          
          // UI libraries
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          
          if (id.includes('node_modules/motion') || 
              id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          
          // Other smaller vendors
          if (id.includes('node_modules/zustand')) {
            return 'vendor-state';
          }
          
          if (id.includes('node_modules/canvas-confetti')) {
            return 'vendor-confetti';
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
    exclude: ['recharts'], // Don't pre-bundle recharts
  },
});
