import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from "./package.json"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  define: {
    global: 'globalThis',
    __APP_VERSION__: JSON.stringify(pkg.version),

  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})