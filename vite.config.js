import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
      },
      manifest: {
        name: 'Zumma Coffee Ordering',
        short_name: 'Zumma',
        description: 'QR Code Ordering System for Zumma Coffee',
        theme_color: '#F8ECDD',
        display: 'standalone',
        background_color: '#F8ECDD'
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Membuka akses jaringan lokal
    port: 5173       // Pastikan port sesuai
  }
})
