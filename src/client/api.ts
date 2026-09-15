import type { ApiErrorCode } from '../shared/apiErrors'

export type Me = {
  name: string | null
  email: string
  pictureUrl: string | null
  currency: string
  timezone: string
  trackingStartDate: string
}

export type Expense = {
  id: string
  date: string
  amount: number
  currency: string
  note: string | null
}

export type ExpenseInput = Pick<Expense, 'date' | 'amount' | 'note'>

// API がバリデーションエラーなどを返したときのエラー。文言は表示側でコードから翻訳する
export class ApiError extends Error {
  constructor(readonly codes: ApiErrorCode[]) {
    super(codes.join(', '))
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { errors?: ApiErrorCode[] } | null
    throw new ApiError(body?.errors ?? ['request_failed'])
  }
  return res
}

export async function fetchMe(): Promise<Me | null> {
  const res = await send('/api/me')
  return ((await res.json()) as { user: Me | null }).user
}

// 退会。アカウントとすべての支出を削除し、ログアウト状態にする
export async function deleteAccount(): Promise<void> {
  await send('/api/me', { method: 'DELETE' })
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await send('/api/expenses')
  return ((await res.json()) as { expenses: Expense[] }).expenses
}

export async function createExpense(input: ExpenseInput): Promise<Expense> {
  const res = await send('/api/expenses', { method: 'POST', body: JSON.stringify(input) })
  return ((await res.json()) as { expense: Expense }).expense
}

export async function updateExpense(id: string, input: ExpenseInput): Promise<Expense> {
  const res = await send(`/api/expenses/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(input) })
  return ((await res.json()) as { expense: Expense }).expense
}

export async function deleteExpense(id: string): Promise<void> {
  await send(`/api/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
