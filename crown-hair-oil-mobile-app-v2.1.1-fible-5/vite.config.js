import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps all asset URLs relative, so the same build works at
// the domain root and under a subpath (e.g. GitHub Pages project sites).
export default defineConfig({
  base: './',
  plugins: [react()],
})
