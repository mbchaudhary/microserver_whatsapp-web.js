import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Main server
      '/api/main': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/main/, '')
      },
      // Second server
      '/api/second': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/second/, '/second-server')
      }
      ,
      // Second server products API
      '/api/products-second-server': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/products-second-server/, '/products-second-server')
      }
      ,
      // Cars API
      '/api/cars': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cars/, '/cars')
      }
      ,
      // WhatsApp Second Server Proxies
      '/api/wa-second-server': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wa-second-server/, '/wa-second-server')
      }
    }
  }
})
