import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { deleteCookie } from 'hono/cookie'
import { SESSION_COOKIE, requireUser } from '../auth/session'
import { createDb } from '../db/client'
import { expenses, sessions, users } from '../db/schema'
import type { AppEnv } from '../types'

export const meRoutes = new Hono<AppEnv>()

// ログイン中のユーザー。未ログインなら user: null
meRoutes.get('/', (c) => {
  const user = c.get('user')
  return c.json({
    user: user && {
      name: user.name,
      email: user.email,
      pictureUrl: user.pictureUrl,
      currency: user.currency,
      timezone: user.timezone,
      trackingStartDate: user.trackingStartDate,
    },
  })
})

// 退会。支出・セッション・ユーザーをまとめて削除する。
// 外部キーの cascade にも頼れるが、削除対象を明示するため関連テーブルから順に消す
meRoutes.delete('/', async (c) => {
  const user = requireUser(c)
  const db = createDb(c.env)
  await db.batch([
    db.delete(expenses).where(eq(expenses.userId, user.id)),
    db.delete(sessions).where(eq(sessions.userId, user.id)),
    db.delete(users).where(eq(users.id, user.id)),
  ])
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.body(null, 204)
})
