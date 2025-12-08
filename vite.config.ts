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
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - must be first
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Animation
          'vendor-motion': ['framer-motion'],
          
          // Icons
          'vendor-icons': ['lucide-react'],
          
          // Date utilities
          'vendor-date': ['date-fns'],
          
          // State management
          'vendor-state': ['zustand'],
          
          // Confetti
          'vendor-confetti': ['canvas-confetti'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
