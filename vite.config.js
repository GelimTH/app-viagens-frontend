// vite.config.js
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url' // <-- 1. Importe o fileURLToPath

// --- CORREÇÃO ---
// 2. Defina __filename e __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- FIM DA CORREÇÃO ---

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { 
    alias: {
      "@": path.resolve(__dirname, "./src"), // <-- 3. Agora __dirname está definido
    },
  },
  server: {
    host: true, 
    allowedHosts: ['.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})