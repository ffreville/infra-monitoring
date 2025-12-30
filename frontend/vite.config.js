import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/devapi': {
        //Replace the target by the backend development url
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/devapi/, '')
      }
    }
  }
})
