// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },
  
  build: {
    target: 'es2022',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'utils': ['js-yaml', 'clsx']
        }
      },
      external: [
        // Exclude test utilities
        /.*\.test\.(ts|tsx)$/,
        /.*\.spec\.(ts|tsx)$/,
        /__tests__/,
        /__mocks__/,
      ],
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'js-yaml', 'lucide-react', 'clsx'],
    esbuildOptions: {
      target: 'es2022'
    }
  }
})