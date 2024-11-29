import { defineConfig } from 'vite'
import reactSWC from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [reactSWC()],
  server: {
    port: 3000,
    open: true
  }
})
