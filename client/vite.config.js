import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  //proxy to port 3000 for all request
  plugins: [react(), tailwindcss()],
  // preview.allowedHosts
  preview: {
    allowedHosts: ['localhost', '127.0.0.1', '0.0.0.0', "bytejudge.sidhere.tech"],
  },
})
