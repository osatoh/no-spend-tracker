import { googleAuth } from '@hono/oauth-providers/google'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { createDb, type Db } from '../db/client'
import { users } from '../db/schema'
import { normalizeTimezone, todayIn } from '../lib/timezone'
import type { AppEnv, User } from '../types'
import { SESSION_COOKIE, createSession, deleteSession } from './session'

// サインアップ時のタイムゾーンを Google へのリダイレクト中だけ保持する Cookie
const SIGNUP_TZ_COOKIE = 'signup_tz'

export const authRoutes = new Hono<AppEnv>()

authRoutes.get(
  '/google',
  async (c, next) => {
    // Google の同意画面でキャンセルされた場合
    if (c.req.query('error')) return c.redirect('/')
    // ログイン開始時(code なし)にブラウザから渡されたタイムゾーンを退避する
    if (!c.req.query('code')) {
      setCookie(c, SIGNUP_TZ_COOKIE, normalizeTimezone(c.req.query('tz')), {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
        path: '/auth',
        maxAge: 600,
      })
    }
    await next()
  },
  (c, next) =>
    googleAuth({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      scope: ['openid', 'email', 'profile'],
    })(c, next),
  async (c) => {
    const googleUser = c.get('user-google')
    if (!googleUser?.id || !googleUser.email || !googleUser.verified_email) {
      throw new HTTPException(401)
    }

    const timezone = normalizeTimezone(getCookie(c, SIGNUP_TZ_COOKIE))
    deleteCookie(c, SIGNUP_TZ_COOKIE, { path: '/auth' })

    const db = createDb(c.env)
    const user = await upsertGoogleUser(db, {
      googleSub: googleUser.id,
      email: googleUser.email,
      name: googleUser.name ?? null,
      timezone,
    })
    const { token, expiresAt } = await createSession(db, user.id)
    setCookie(c, SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      expires: expiresAt,
    })
    return c.redirect('/')
  },
)

authRoutes.post('/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (token) await deleteSession(createDb(c.env), token)
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.redirect('/')
})

// 初回ログインならユーザーを作る。既存ユーザーはメールと名前だけ更新し、タイムゾーンと記録開始日は変えない
async function upsertGoogleUser(
  db: Db,
  params: { googleSub: string; email: string; name: string | null; timezone: string },
): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      googleSub: params.googleSub,
      email: params.email,
      name: params.name,
      timezone: params.timezone,
      trackingStartDate: todayIn(params.timezone),
    })
    .onConflictDoUpdate({
      target: users.googleSub,
      set: { email: params.email, name: params.name },
    })
    .returning()
  return user
}
