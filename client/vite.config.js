import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Modified config to support React Router deployment
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
