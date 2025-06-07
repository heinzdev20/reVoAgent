import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 12002,
    cors: true,
    allowedHosts: ['all'],
    proxy: {
      '/api': {
        target: 'http://localhost:12000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:12000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../src/revoagent/ui/web_dashboard/static/dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          d3: ['d3'],
        },
      },
    },
  },
})