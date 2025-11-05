// vite.config.js
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: {
      // CORREÇÃO: Removido `__dirname` e usando o `import.meta.url` do ES Modules
      "@": path.resolve(new URL('.', import.meta.url).pathname, "./src"),
    },
  },
  server: {
    host: true, 
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        // Seu proxy (sem mudanças)
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})