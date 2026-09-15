import { describe, expect, it } from 'vitest'
import { formatMoney, toMajorUnits, toMinorUnits } from './money'

describe('formatMoney', () => {
  it('JPY は整数のまま、GBP はペンスをポンドにして表示する', () => {
    expect(formatMoney(1500, 'JPY', 'ja')).toContain('1,500')
    expect(formatMoney(350, 'GBP', 'en-GB')).toBe('£3.50')
  })
})

describe('toMinorUnits', () => {
  it('通常の単位を最小単位の整数にする', () => {
    expect(toMinorUnits('1500', 'JPY')).toBe(1500)
    expect(toMinorUnits('3.5', 'GBP')).toBe(350)
  })

  it('数値でない・空の入力は null', () => {
    expect(toMinorUnits('abc', 'JPY')).toBeNull()
    expect(toMinorUnits('', 'JPY')).toBeNull()
  })
})

describe('toMajorUnits', () => {
  it('最小単位の整数を入力欄の値にする', () => {
    expect(toMajorUnits(1500, 'JPY')).toBe('1500')
    expect(toMajorUnits(350, 'GBP')).toBe('3.50')
  })
})
