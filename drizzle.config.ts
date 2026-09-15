import { defineConfig } from 'drizzle-kit'

// マイグレーション SQL の生成のみに使う。適用は wrangler d1 migrations apply で行う
export default defineConfig({
  dialect: 'sqlite',
  schema: './src/worker/db/schema.ts',
  out: './drizzle',
})
