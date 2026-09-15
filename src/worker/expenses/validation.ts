import type { ApiErrorCode } from '../../shared/apiErrors'
import { isValidDate } from '../../shared/calendar'
import { MAX_AMOUNT, MAX_NOTE_LENGTH } from '../../shared/limits'

export type ExpenseInput = {
  date: string
  amount: number
  note: string | null
}

export type ValidationResult = { ok: true; value: ExpenseInput } | { ok: false; errors: ApiErrorCode[] }

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
