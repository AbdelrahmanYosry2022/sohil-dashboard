import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Map features/drawing to the correct path
      'features/drawing': fileURLToPath(new URL('./src/features/drawing', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5174,
    strictPort: false,
  },
})
