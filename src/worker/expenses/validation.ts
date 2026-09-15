export const MAX_AMOUNT = 99_999_999
export const MAX_NOTE_LENGTH = 100

export type ExpenseInput = {
  date: string
  amount: number
  note: string | null
}

export type ValidationResult = { ok: true; value: ExpenseInput } | { ok: false; errors: string[] }

// 実在する YYYY-MM-DD かどうか
export function isValidDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

// 支出の登録・更新リクエストを検証する。日付は minDate(記録開始日)から maxDate(今日)まで
export function validateExpenseInput(
  body: unknown,
  range: { minDate: string; maxDate: string },
): ValidationResult {
  if (typeof body !== 'object' || body === null) return { ok: false, errors: ['リクエストの形式が不正です'] }
  const { date, amount, note } = body as Record<string, unknown>
  const errors: string[] = []

  if (typeof date !== 'string' || !isValidDate(date)) {
    errors.push('日付が不正です')
  } else if (date < range.minDate) {
    errors.push(`日付は記録開始日(${range.minDate})以降にしてください`)
  } else if (date > range.maxDate) {
    errors.push('未来の日付は入力できません')
  }

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) {
    errors.push('金額は1以上の整数で入力してください')
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    errors.push('内訳が不正です')
  }
  const trimmedNote = typeof note === 'string' ? note.trim() : ''
  if (trimmedNote.length > MAX_NOTE_LENGTH) {
    errors.push(`内訳は${MAX_NOTE_LENGTH}文字以内で入力してください`)
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: { date: date as string, amount: amount as number, note: trimmedNote === '' ? null : trimmedNote },
  }
}
