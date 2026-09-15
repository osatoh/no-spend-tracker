import { and, eq, gt } from 'drizzle-orm'
import type { Context } from 'hono'
import { createMiddleware } from 'hono/factory'
import { deleteCookie, getCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { createDb, type Db } from '../db/client'
import { sessions, users } from '../db/schema'
import type { AppEnv, User } from '../types'

export const SESSION_COOKIE = 'session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

// Cookie に入れる推測不能なトークン(256bit)
function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// DB にはトークンのハッシュだけを保存し、DB が漏れてもセッションを乗っ取れないようにする
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession(db: Db, userId: string, now: Date = new Date()) {
  const token = generateToken()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  await db.insert(sessions).values({ id: await hashToken(token), userId, expiresAt })
  return { token, expiresAt }
}

export async function findUserBySessionToken(db: Db, token: string, now: Date = new Date()): Promise<User | null> {
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, await hashToken(token)), gt(sessions.expiresAt, now)))
    .limit(1)
  return rows[0]?.user ?? null
}

export async function deleteSession(db: Db, token: string) {
  await db.delete(sessions).where(eq(sessions.id, await hashToken(token)))
}

// セッション Cookie からログイン中のユーザーを c.var.user に載せる
export const loadSessionUser = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  const user = token ? await findUserBySessionToken(createDb(c.env), token) : null
  if (token && !user) deleteCookie(c, SESSION_COOKIE, { path: '/' })
  c.set('user', user)
  await next()
})

// ログイン必須の API で使う。未ログインなら 401
export function requireUser(c: Context<AppEnv>): User {
  const user = c.get('user')
  if (!user) throw new HTTPException(401)
  return user
}
