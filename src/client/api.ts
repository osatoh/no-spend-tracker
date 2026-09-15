export type Me = {
  name: string | null
  email: string
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

// API がバリデーションエラーなどを返したときのエラー
export class ApiError extends Error {
  constructor(readonly messages: string[]) {
    super(messages.join('\n'))
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json' } })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { errors?: string[] } | null
    throw new ApiError(body?.errors ?? [`通信に失敗しました(${res.status})`])
  }
  return res
}

export async function fetchMe(): Promise<Me | null> {
  const res = await send('/api/me')
  return ((await res.json()) as { user: Me | null }).user
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
