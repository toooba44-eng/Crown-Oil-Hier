import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps asset URLs relative, so the same build works at the
// domain root and under a subpath (served at /Crown-Oil-Hier/v1.2/ on Pages).
export default defineConfig({
  base: './',
  plugins: [react()],
})
