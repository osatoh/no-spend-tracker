import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  buildDayCell,
  computeStreak,
  dayOfWeek,
  isValidDate,
  monthBoundary,
  monthGridDates,
  monthStartInWeek,
  sumByDateAndCurrency,
  yearGridWeeks,
} from './calendar'

describe('monthBoundary', () => {
  it('月初の日は、日曜でなければ上に境目がある', () => {
    // 2026-09-01 は火曜。前日 8/31 は同じ週の月曜
    expect(monthBoundary('2026-09-01', false)).toEqual({ left: true, top: true })
  })

  it('前の週の同じ曜日が前月なら左に境目がある', () => {
    // 2026-09-07(月)の左隣は 8/31
    expect(monthBoundary('2026-09-07', false)).toEqual({ left: true, top: false })
  })

  it('日曜の月初は上に境目を引かない', () => {
    // 2026-11-01 は日曜
    expect(monthBoundary('2026-11-01', false)).toEqual({ left: true, top: false })
  })

  it('同じ月の中や最初の週には境目がない', () => {
    expect(monthBoundary('2026-09-16', false)).toEqual({ left: false, top: false })
    expect(monthBoundary('2026-09-01', true)).toEqual({ left: false, top: true })
  })
})

describe('monthStartInWeek', () => {
  it('週に月初が含まれていればその月を返す', () => {
    // 2026-09-27(日)〜2026-10-03(土)
    expect(monthStartInWeek(yearGridWeeks('2026-10-03').at(-1)!)).toBe(10)
  })

  it('月初を含まない週は null', () => {
    expect(monthStartInWeek(yearGridWeeks('2026-09-16').at(-1)!)).toBeNull()
  })
})

describe('isValidDate', () => {
  it('実在する日付を受け付ける', () => {
    expect(isValidDate('2026-09-16')).toBe(true)
    expect(isValidDate('2028-02-29')).toBe(true)
  })

  it('存在しない日付や形式違いを拒否する', () => {
    expect(isValidDate('2026-02-30')).toBe(false)
    expect(isValidDate('2027-02-29')).toBe(false)
    expect(isValidDate('2026-9-16')).toBe(false)
    expect(isValidDate('')).toBe(false)
  })
})

describe('addDays / dayOfWeek', () => {
  it('月・年をまたいで日付を足し引きする', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2027-01-01', -1)).toBe('2026-12-31')
  })

  it('曜日を返す', () => {
    // 2026-09-16 は水曜
    expect(dayOfWeek('2026-09-16')).toBe(3)
  })
})

describe('computeStreak', () => {
  const start = '2026-09-01'

  it('今日も支出がなければ今日を含めて数える', () => {
    expect(computeStreak(new Set(['2026-09-13']), start, '2026-09-16')).toBe(3)
  })

  it('今日支出していれば 0', () => {
    expect(computeStreak(new Set(['2026-09-16']), start, '2026-09-16')).toBe(0)
  })

  it('支出が一度もなければ記録開始日から数える', () => {
    expect(computeStreak(new Set(), start, '2026-09-16')).toBe(16)
  })
})

describe('sumByDateAndCurrency', () => {
  it('日付ごとに、通貨が違う金額は足さずに合計する', () => {
    const totals = sumByDateAndCurrency([
      { date: '2026-09-12', currency: 'JPY', amount: 500 },
      { date: '2026-09-12', currency: 'GBP', amount: 350 },
      { date: '2026-09-12', currency: 'JPY', amount: 200 },
      { date: '2026-09-13', currency: 'JPY', amount: 100 },
    ])
    expect(totals.get('2026-09-12')).toEqual([
      { currency: 'JPY', amount: 700 },
      { currency: 'GBP', amount: 350 },
    ])
    expect(totals.get('2026-09-13')).toEqual([{ currency: 'JPY', amount: 100 }])
  })
})

describe('buildDayCell', () => {
  const range = { trackingStartDate: '2026-09-10', today: '2026-09-16' }
  const totals = new Map([['2026-09-12', [{ currency: 'JPY', amount: 500 }]]])

  it('記録開始日より前と未来は範囲外', () => {
    expect(buildDayCell('2026-09-09', totals, range).status).toBe('outside')
    expect(buildDayCell('2026-09-17', totals, range).status).toBe('outside')
  })

  it('支出がある日は spend、ない日は no-spend', () => {
    expect(buildDayCell('2026-09-12', totals, range)).toEqual({
      date: '2026-09-12',
      status: 'spend',
      totals: [{ currency: 'JPY', amount: 500 }],
    })
    expect(buildDayCell('2026-09-13', totals, range)).toEqual({ date: '2026-09-13', status: 'no-spend', totals: [] })
  })
})

describe('yearGridWeeks', () => {
  it('今日を含む週を最後にした日曜始まりの 53 週を返す', () => {
    const weeks = yearGridWeeks('2026-09-16')
    expect(weeks).toHaveLength(53)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(dayOfWeek(weeks[0][0])).toBe(0)
    expect(weeks[52]).toContain('2026-09-16')
  })
})

describe('monthGridDates', () => {
  it('1日の曜日まで null で埋め、月末までの日付を並べる', () => {
    // 2026-09-01 は火曜
    const cells = monthGridDates('2026-09')
    expect(cells.slice(0, 3)).toEqual([null, null, '2026-09-01'])
    expect(cells.at(-1)).toBe('2026-09-30')
    expect(cells).toHaveLength(2 + 30)
  })
})

describe('addMonths', () => {
  it('年をまたいで月を足し引きする', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
})
