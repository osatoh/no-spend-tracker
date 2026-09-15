import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { authRoutes } from './auth/routes'
import { loadSessionUser } from './auth/session'
import { expenseRoutes } from './expenses/routes'
import { meRoutes } from './me/routes'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 更新系リクエストの Origin を検証する
app.use(csrf())
app.use(loadSessionUser)

app.route('/auth', authRoutes)
app.route('/api/me', meRoutes)
app.route('/api/expenses', expenseRoutes)

export default app
