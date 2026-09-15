import { describe, expect, it } from 'vitest'
import { computeStats, noSpendRate } from './stats'

const base = {
  trackingStartDate: '2026-08-30',
  today: '2026-09-02',
  dailyBudget: 1000,
  currency: 'JPY',
  rates: null,
}

describe('computeStats', () => {
  it('月ごとと累計の記録日数・no-spend 日数を数え、新しい月から並べる', () => {
    const stats = computeStats({
      ...base,
      expenses: [
        { date: '2026-08-31', currency: 'JPY', amount: 300 },
        { date: '2026-09-02', currency: 'JPY', amount: 1500 },
      ],
    })
    expect(stats.months.map((m) => [m.month, m.trackedDays, m.noSpendDays])).toEqual([
      ['2026-09', 2, 1],
      ['2026-08', 2, 1],
    ])
    expect(stats.total).toMatchObject({ trackedDays: 4, noSpendDays: 2 })
  })

  it('節約額は日ごとの「目安額 − 支出」の合計で、目安額を超えた日は差し引く', () => {
    const stats = computeStats({
      ...base,
      expenses: [
        { date: '2026-08-31', currency: 'JPY', amount: 300 },
        { date: '2026-09-02', currency: 'JPY', amount: 1500 },
      ],
    })
    // 8月: 1000 + 700 / 9月: 1000 + (-500)
    expect(stats.months.map((m) => m.saved)).toEqual([500, 1700])
    expect(stats.total.saved).toBe(2200)
  })

  it('表示通貨以外の支出はレートで換算して差し引く', () => {
    const stats = computeStats({
      ...base,
      rates: { base: 'JPY', date: '2026-09-01', rates: { GBP: 0.005 } },
      expenses: [{ date: '2026-09-01', currency: 'GBP', amount: 350 }],
    })
    // 4日 × 1000 − ¥700
    expect(stats.total.saved).toBe(3300)
  })

  it('目安額が未設定、または換算できない支出があれば節約額は null', () => {
    expect(computeStats({ ...base, dailyBudget: null, expenses: [] }).total.saved).toBeNull()
    const unconvertible = computeStats({
      ...base,
      expenses: [{ date: '2026-09-01', currency: 'GBP', amount: 350 }],
    })
    expect(unconvertible.total.saved).toBeNull()
    // 日数の集計は換算できなくても出す
    expect(unconvertible.total.noSpendDays).toBe(3)
  })

  it('記録開始日より前・未来の支出は集計しない', () => {
    const stats = computeStats({
      ...base,
      expenses: [
        { date: '2026-08-29', currency: 'JPY', amount: 100 },
        { date: '2026-09-03', currency: 'JPY', amount: 100 },
      ],
    })
    expect(stats.total).toEqual({ trackedDays: 4, noSpendDays: 4, saved: 4000 })
  })
})

describe('noSpendRate', () => {
  it('no-spend 日数 ÷ 記録日数。記録日がなければ null', () => {
    expect(noSpendRate({ trackedDays: 4, noSpendDays: 3, saved: null })).toBe(0.75)
    expect(noSpendRate({ trackedDays: 0, noSpendDays: 0, saved: null })).toBeNull()
  })
})
