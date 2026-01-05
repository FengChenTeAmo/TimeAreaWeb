import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'TimeArea - 长途出行天气查询',
        short_name: 'TimeArea',
        description: '长途出行天气查询系统',
        theme_color: '#1890ff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    proxy: {
      '/api/weather': {
        target: 'https://nu3yfrjy6b.re.qweatherapi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
        secure: true
      },
      '/api/geocode': {
        target: 'https://api.map.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geocode/, ''),
        secure: true
      }
    }
  }
})
