import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 12000,
    strictPort: true,
    cors: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        secure: false
      },
      '/ws': {
        target: 'ws://localhost:12001',
        ws: true,
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
