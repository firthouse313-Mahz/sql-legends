import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this as a project site under /sql-legends/, not the
  // domain root — every absolute asset path (including the sql.js wasm file,
  // see sqlEngine.ts) has to respect this.
  base: '/sql-legends/',
  plugins: [react()],
})
