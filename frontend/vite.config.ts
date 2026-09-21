import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3') || id.includes('internmap')) return 'vendor-recharts';
            if (id.includes('lucide-react')) return 'vendor-lucide';
            if (id.includes('jspdf') || id.includes('dompurify') || id.includes('fflate')) return 'vendor-pdf';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';
            if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
            if (id.includes('@radix-ui') || id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) return 'vendor-ui';
            if (id.includes('date-fns')) return 'vendor-date';
            return 'vendor-core';
          }
        }
      }
    }
  }
})
