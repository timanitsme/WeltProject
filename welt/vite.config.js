import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: true,
    historyApiFallback: true,
    proxy:{
      '/api': {
        target: "http://localhost:8000/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/sockets': {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true
      }
    }
  }
})
