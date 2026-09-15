import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { Hono } from 'hono'
import type { ApiErrorCode } from '../../shared/apiErrors'
import { isValidDate } from '../../shared/calendar'
import { todayIn } from '../../shared/timezone'
import { requireUser } from '../auth/session'
import { createDb } from '../db/client'
import { expenses } from '../db/schema'
import { readJson } from '../lib/http'
import type { AppEnv, User } from '../types'
import { limitExpenseWrites } from './rateLimit'
import { validateExpenseInput } from './validation'

const NOT_FOUND: ApiErrorCode[] = ['not_found']

const expenseColumns = {
  id: expenses.id,
  date: expenses.date,
  amount: expenses.amount,
  currency: expenses.currency,
  note: expenses.note,
}

// 入力できる日付の範囲は記録開始日から、ユーザーのタイムゾーンでの今日まで
function dateRangeFor(user: User) {
  return { minDate: user.trackingStartDate, maxDate: todayIn(user.timezone) }
}

// どの操作も必ずログイン中のユーザーの支出だけに絞る
export const expenseRoutes = new Hono<AppEnv>()

// 支出の一覧。from / to(YYYY-MM-DD)で期間を絞れる
expenseRoutes.get('/', async (c) => {
  const user = requireUser(c)
  const from = c.req.query('from')
  const to = c.req.query('to')
  const conditions = [eq(expenses.userId, user.id)]
  if (from && isValidDate(from)) conditions.push(gte(expenses.date, from))
  if (to && isValidDate(to)) conditions.push(lte(expenses.date, to))

  const rows = await createDb(c.env)
    .select(expenseColumns)
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date), desc(expenses.createdAt))
  return c.json({ expenses: rows })
})

expenseRoutes.post('/', limitExpenseWrites, async (c) => {
  const user = requireUser(c)
  const result = validateExpenseInput(await readJson(c.req.raw), dateRangeFor(user))
  if (!result.ok) return c.json({ errors: result.errors }, 400)

  const [expense] = await createDb(c.env)
    .insert(expenses)
    .values({ id: crypto.randomUUID(), userId: user.id, currency: user.currency, ...result.value })
    .returning(expenseColumns)
  return c.json({ expense }, 201)
})

// 通貨は登録時のものを維持し、日付・金額・内訳だけ更新する
expenseRoutes.put('/:id', limitExpenseWrites, async (c) => {
  const user = requireUser(c)
  const result = validateExpenseInput(await readJson(c.req.raw), dateRangeFor(user))
  if (!result.ok) return c.json({ errors: result.errors }, 400)

  const [expense] = await createDb(c.env)
    .update(expenses)
    .set(result.value)
    .where(and(eq(expenses.id, c.req.param('id')), eq(expenses.userId, user.id)))
    .returning(expenseColumns)
  if (!expense) return c.json({ errors: NOT_FOUND }, 404)
  return c.json({ expense })
})

expenseRoutes.delete('/:id', limitExpenseWrites, async (c) => {
  const user = requireUser(c)
  const [deleted] = await createDb(c.env)
    .delete(expenses)
    .where(and(eq(expenses.id, c.req.param('id')), eq(expenses.userId, user.id)))
    .returning({ id: expenses.id })
  if (!deleted) return c.json({ errors: NOT_FOUND }, 404)
  return c.body(null, 204)
})
