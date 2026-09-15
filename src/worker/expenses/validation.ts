import type { ApiErrorCode } from '../../shared/apiErrors'

export const MAX_AMOUNT = 99_999_999
export const MAX_NOTE_LENGTH = 100

export type ExpenseInput = {
  date: string
  amount: number
  note: string | null
}

export type ValidationResult = { ok: true; value: ExpenseInput } | { ok: false; errors: ApiErrorCode[] }

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
  if (typeof body !== 'object' || body === null) return { ok: false, errors: ['invalid_body'] }
  const { date, amount, note } = body as Record<string, unknown>
  const errors: ApiErrorCode[] = []

  if (typeof date !== 'string' || !isValidDate(date)) {
    errors.push('invalid_date')
  } else if (date < range.minDate) {
    errors.push('date_before_tracking_start')
  } else if (date > range.maxDate) {
    errors.push('date_in_future')
  }

  if (typeof amount !== 'number' || !Number.isInteger(amount) || amount < 1 || amount > MAX_AMOUNT) {
    errors.push('invalid_amount')
  }

  if (note !== undefined && note !== null && typeof note !== 'string') {
    errors.push('invalid_note')
  }
  const trimmedNote = typeof note === 'string' ? note.trim() : ''
  if (trimmedNote.length > MAX_NOTE_LENGTH) {
    errors.push('note_too_long')
  }

  if (errors.length > 0) return { ok: false, errors }
  return {
    ok: true,
    value: { date: date as string, amount: amount as number, note: trimmedNote === '' ? null : trimmedNote },
  }
}
