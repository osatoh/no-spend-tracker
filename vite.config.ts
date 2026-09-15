import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), cloudflare()],
  // Google OAuth のリダイレクト URI(http://localhost:8787/auth/google)に合わせてポートを固定する
  server: { port: 8787, strictPort: true },
})
