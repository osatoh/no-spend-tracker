import { describe, expect, it } from 'vitest'
import { validateSettingsInput } from './validation'

describe('validateSettingsInput', () => {
  it('タイムゾーンと通貨の片方・両方を受け付ける', () => {
    expect(validateSettingsInput({ timezone: 'Europe/London' })).toEqual({
      ok: true,
      value: { timezone: 'Europe/London' },
    })
    expect(validateSettingsInput({ timezone: 'Asia/Tokyo', currency: 'GBP' })).toEqual({
      ok: true,
      value: { timezone: 'Asia/Tokyo', currency: 'GBP' },
    })
  })

  it('不正なタイムゾーン・未対応の通貨を拒否する', () => {
    expect(validateSettingsInput({ timezone: 'Not/AZone', currency: 'USD' })).toEqual({
      ok: false,
      errors: ['invalid_timezone', 'invalid_currency'],
    })
  })

  it('目安額は1以上の整数か null(未設定に戻す)を受け付ける', () => {
    expect(validateSettingsInput({ dailyBudget: 1500 })).toEqual({ ok: true, value: { dailyBudget: 1500 } })
    expect(validateSettingsInput({ dailyBudget: null })).toEqual({ ok: true, value: { dailyBudget: null } })
    for (const dailyBudget of [0, -1, 1.5, '1500']) {
      expect(validateSettingsInput({ dailyBudget })).toEqual({ ok: false, errors: ['invalid_budget'] })
    }
  })

  it('変更する項目がない・オブジェクト以外は拒否する', () => {
    expect(validateSettingsInput({})).toEqual({ ok: false, errors: ['invalid_body'] })
    expect(validateSettingsInput(null)).toEqual({ ok: false, errors: ['invalid_body'] })
  })
})
