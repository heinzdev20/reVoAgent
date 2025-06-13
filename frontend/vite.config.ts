import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 12000,
    host: '0.0.0.0',
    strictPort: true, // Fail if port is in use instead of trying alternatives
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'work-1-nqxcgeonuommqqgu.prod-runtime.all-hands.dev',
      'work-2-nqxcgeonuommqqgu.prod-runtime.all-hands.dev'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:12001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': process.env,
  },
})
