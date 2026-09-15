import { Hono } from 'hono'
import { describe, expect, it, vi } from 'vitest'
import type { AppEnv, User } from '../types'
import { limitExpenseWrites } from './rateLimit'

const user: User = {
  id: 'user-1',
  googleSub: 'sub-1',
  email: 'user@example.com',
  name: 'User',
  pictureUrl: null,
  currency: 'JPY',
  timezone: 'Asia/Tokyo',
  trackingStartDate: '2026-09-01',
  createdAt: new Date('2026-09-01T00:00:00Z'),
}

function setup(options: { user: User | null; success: boolean }) {
  const limit = vi.fn().mockResolvedValue({ success: options.success })
  const app = new Hono<AppEnv>()
  app.use(async (c, next) => {
    c.set('user', options.user)
    await next()
  })
  app.post('/', limitExpenseWrites, (c) => c.text('ok'))
  // テストでは Rate Limiting バインディングの limit だけを差し替える
  const env = { EXPENSE_WRITE_LIMITER: { limit } } as unknown as CloudflareBindings
  return { request: () => app.request('/', { method: 'POST' }, env), limit }
}

describe('limitExpenseWrites', () => {
  it('上限内なら次の処理に進み、ユーザー ID をキーに数える', async () => {
    const { request, limit } = setup({ user, success: true })
    const res = await request()
    expect(res.status).toBe(200)
    expect(limit).toHaveBeenCalledWith({ key: 'user-1' })
  })

  it('上限を超えたら 429 と rate_limited を返す', async () => {
    const { request } = setup({ user, success: false })
    const res = await request()
    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ errors: ['rate_limited'] })
  })

  it('未ログインなら数えずに 401 を返す', async () => {
    const { request, limit } = setup({ user: null, success: true })
    const res = await request()
    expect(res.status).toBe(401)
    expect(limit).not.toHaveBeenCalled()
  })
})
