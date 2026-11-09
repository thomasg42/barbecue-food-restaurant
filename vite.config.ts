import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/barbecue-food-restaurant/' : '/',
  plugins: [react()],
  server: {
    host: true,
    port: 8791,
  },
})
