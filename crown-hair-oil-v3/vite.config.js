import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/Crown-Oil-Hier/',
  build: {
    rollupOptions: {
      input: {
        storefront: resolve(__dirname, 'index.html'),
        shop: resolve(__dirname, 'shop/index.html'),
        product: resolve(__dirname, 'product/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})
