import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { authRoutes } from './auth/routes'
import { loadSessionUser } from './auth/session'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 更新系リクエストの Origin を検証する
app.use(csrf())
app.use(loadSessionUser)

app.route('/auth', authRoutes)

// ログイン中のユーザー。未ログインなら user: null
app.get('/api/me', (c) => {
  const user = c.get('user')
  return c.json({
    user: user && {
      name: user.name,
      email: user.email,
      currency: user.currency,
      timezone: user.timezone,
      trackingStartDate: user.trackingStartDate,
    },
  })
})

export default app
