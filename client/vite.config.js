import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    historyApiFallback: true, // for dev server
  },
  // ⬇️ Needed for production on static hosts like Render
  resolve: {
    alias: {
      '@': '/src',
    },
  }
});