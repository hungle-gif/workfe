import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_SOCKET_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT) || 3033,
      allowedHosts: env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',').map(s => s.trim()) : []
    },
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': apiUrl,
        '/socket.io': {
          target: apiUrl,
          ws: true
        }
      }
    }
  }
})
