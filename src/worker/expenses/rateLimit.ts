import { createMiddleware } from 'hono/factory'
import type { ApiErrorCode } from '../../shared/apiErrors'
import { requireUser } from '../auth/session'
import type { AppEnv } from '../types'

const RATE_LIMITED: ApiErrorCode[] = ['rate_limited']

// 支出の書き込みをログイン中のユーザーごとに制限する。上限は wrangler.jsonc の EXPENSE_WRITE_LIMITER で設定
export const limitExpenseWrites = createMiddleware<AppEnv>(async (c, next) => {
  const user = requireUser(c)
  const { success } = await c.env.EXPENSE_WRITE_LIMITER.limit({ key: user.id })
  if (!success) return c.json({ errors: RATE_LIMITED }, 429)
  await next()
})
