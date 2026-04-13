import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        afk: resolve(__dirname, 'afk/index.html'),
        shop: resolve(__dirname, 'shop/index.html'),
        learn: resolve(__dirname, 'learn/index.html'),
        play: resolve(__dirname, 'play/index.html')
      }
    }
  }
})
