import type { users } from './db/schema'

export type User = typeof users.$inferSelect

export type AppEnv = {
  Bindings: CloudflareBindings
  Variables: {
    // 未ログインなら null
    user: User | null
  }
}
