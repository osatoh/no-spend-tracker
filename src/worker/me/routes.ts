import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { deleteCookie } from 'hono/cookie'
import { SESSION_COOKIE, requireUser } from '../auth/session'
import { createDb } from '../db/client'
import { expenses, sessions, users } from '../db/schema'
import { readJson } from '../lib/http'
import type { AppEnv, User } from '../types'
import { validateSettingsInput } from './validation'

// クライアントに返すユーザー情報。Google の ID などの内部情報は含めない
function toMe(user: User) {
  return {
    name: user.name,
    email: user.email,
    pictureUrl: user.pictureUrl,
    currency: user.currency,
    dailyBudget: user.dailyBudget,
    timezone: user.timezone,
    trackingStartDate: user.trackingStartDate,
  }
}

export const meRoutes = new Hono<AppEnv>()

// ログイン中のユーザー。未ログインなら user: null
meRoutes.get('/', (c) => {
  const user = c.get('user')
  return c.json({ user: user && toMe(user) })
})

// タイムゾーン・通貨・目安額の変更。記録開始日は変えない
meRoutes.patch('/', async (c) => {
  const user = requireUser(c)
  const result = validateSettingsInput(await readJson(c.req.raw))
  if (!result.ok) return c.json({ errors: result.errors }, 400)

  // 目安額は表示通貨の金額なので、通貨を変えたら(同時に指定されない限り)未設定に戻して入れ直してもらう
  const changes = { ...result.value }
  if (changes.currency && changes.currency !== user.currency && changes.dailyBudget === undefined) {
    changes.dailyBudget = null
  }

  const [updated] = await createDb(c.env).update(users).set(changes).where(eq(users.id, user.id)).returning()
  return c.json({ user: toMe(updated) })
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
