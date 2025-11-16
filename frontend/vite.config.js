import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        cart: resolve(__dirname, 'cart.html'),
        contact: resolve(__dirname, 'contact.html'),
        flowers: resolve(__dirname, 'flowers.html'),
        'event-florals': resolve(__dirname, 'event-florals.html'),
        'fresh-picks': resolve(__dirname, 'fresh-picks.html')
      }
    }
  }
})
