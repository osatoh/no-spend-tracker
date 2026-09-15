import { describe, expect, it } from 'vitest'
import { MAX_AMOUNT, MAX_NOTE_LENGTH, isValidDate, validateExpenseInput } from './validation'

const range = { minDate: '2026-09-01', maxDate: '2026-09-16' }

describe('isValidDate', () => {
  it('実在する日付を受け付ける', () => {
    expect(isValidDate('2026-09-16')).toBe(true)
    expect(isValidDate('2028-02-29')).toBe(true)
  })

  it('存在しない日付や形式違いを拒否する', () => {
    expect(isValidDate('2026-02-30')).toBe(false)
    expect(isValidDate('2026-9-16')).toBe(false)
    expect(isValidDate('')).toBe(false)
  })
})

describe('validateExpenseInput', () => {
  it('正しい入力を受け付け、内訳の前後の空白を除く', () => {
    expect(validateExpenseInput({ date: '2026-09-16', amount: 500, note: '  コーヒー ' }, range)).toEqual({
      ok: true,
      value: { date: '2026-09-16', amount: 500, note: 'コーヒー' },
    })
  })

  it('内訳は空・未指定なら null にする', () => {
    const empty = validateExpenseInput({ date: '2026-09-01', amount: 1, note: '   ' }, range)
    const missing = validateExpenseInput({ date: '2026-09-01', amount: 1 }, range)
    expect(empty).toEqual({ ok: true, value: { date: '2026-09-01', amount: 1, note: null } })
    expect(missing).toEqual({ ok: true, value: { date: '2026-09-01', amount: 1, note: null } })
  })

  it('記録開始日より前・未来の日付を拒否する', () => {
    expect(validateExpenseInput({ date: '2026-08-31', amount: 1 }, range).ok).toBe(false)
    expect(validateExpenseInput({ date: '2026-09-17', amount: 1 }, range).ok).toBe(false)
  })

  it('金額は1以上の整数で上限以下のみ受け付ける', () => {
    for (const amount of [0, -1, 1.5, '500', MAX_AMOUNT + 1]) {
      expect(validateExpenseInput({ date: '2026-09-16', amount }, range).ok).toBe(false)
    }
    expect(validateExpenseInput({ date: '2026-09-16', amount: MAX_AMOUNT }, range).ok).toBe(true)
  })

  it('長すぎる内訳を拒否する', () => {
    const note = 'あ'.repeat(MAX_NOTE_LENGTH + 1)
    expect(validateExpenseInput({ date: '2026-09-16', amount: 1, note }, range).ok).toBe(false)
  })

  it('オブジェクト以外を拒否する', () => {
    expect(validateExpenseInput(null, range)).toEqual({ ok: false, errors: ['invalid_body'] })
  })

  it('不正な項目ごとにエラーコードを返す', () => {
    expect(validateExpenseInput({ date: '2026-08-31', amount: 1.5, note: 1 }, range)).toEqual({
      ok: false,
      errors: ['date_before_tracking_start', 'invalid_amount', 'invalid_note'],
    })
  })
})
