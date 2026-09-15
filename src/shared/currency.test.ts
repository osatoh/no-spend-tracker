import { describe, expect, it } from 'vitest'
import { convertMinor, fractionDigits, isSupportedCurrency } from './currency'

const jpyRates = { base: 'JPY', date: '2026-09-15', rates: { GBP: 0.005 } }

describe('isSupportedCurrency', () => {
  it('JPY と GBP だけを受け付ける', () => {
    expect(isSupportedCurrency('JPY')).toBe(true)
    expect(isSupportedCurrency('GBP')).toBe(true)
    expect(isSupportedCurrency('USD')).toBe(false)
    expect(isSupportedCurrency(1)).toBe(false)
  })
})

describe('fractionDigits', () => {
  it('通貨の小数桁数を返す', () => {
    expect(fractionDigits('JPY')).toBe(0)
    expect(fractionDigits('GBP')).toBe(2)
  })
})

describe('convertMinor', () => {
  it('同じ通貨ならそのまま返す', () => {
    expect(convertMinor(500, 'JPY', 'JPY', null)).toBe(500)
  })

  it('小数桁数の違いを考慮して換算する', () => {
    // £3.50 (350 ペンス) ÷ 0.005 = ¥700
    expect(convertMinor(350, 'GBP', 'JPY', jpyRates)).toBe(700)
  })

  it('レートがない・base が換算先と違う場合は null', () => {
    expect(convertMinor(350, 'GBP', 'JPY', null)).toBeNull()
    expect(convertMinor(350, 'GBP', 'JPY', { ...jpyRates, base: 'GBP' })).toBeNull()
    expect(convertMinor(350, 'USD', 'JPY', jpyRates)).toBeNull()
  })
})
