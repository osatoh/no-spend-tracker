import { describe, expect, it } from 'vitest'
import { formatMonthShort, formatMonthTitle, weekdayNames } from './dateFormat'

describe('formatMonthShort', () => {
  it('表示言語に合わせた月の短い名前を返す', () => {
    expect(formatMonthShort(9, 'en')).toBe('Sep')
    expect(formatMonthShort(9, 'ja')).toBe('9月')
  })
})

describe('formatMonthTitle', () => {
  it('表示言語に合わせた年月を返す', () => {
    expect(formatMonthTitle('2026-09', 'en')).toBe('September 2026')
    expect(formatMonthTitle('2026-09', 'ja')).toBe('2026年9月')
  })
})

describe('weekdayNames', () => {
  it('日曜始まりの曜日名を返す', () => {
    expect(weekdayNames('en')).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
    expect(weekdayNames('ja')).toEqual(['日', '月', '火', '水', '木', '金', '土'])
  })
})
