import { describe, expect, it } from 'vitest'
import { DEFAULT_TIMEZONE, isValidTimezone, normalizeTimezone, todayIn } from './timezone'

describe('isValidTimezone', () => {
  it('IANA 名を受け付け、不正な値・空・文字列以外を拒否する', () => {
    expect(isValidTimezone('Europe/London')).toBe(true)
    expect(isValidTimezone('Not/AZone')).toBe(false)
    expect(isValidTimezone('')).toBe(false)
    expect(isValidTimezone(1)).toBe(false)
  })
})

describe('normalizeTimezone', () => {
  it('有効な IANA 名はそのまま返す', () => {
    expect(normalizeTimezone('Europe/London')).toBe('Europe/London')
  })

  it('不正な値は既定値にする', () => {
    expect(normalizeTimezone('Not/AZone')).toBe(DEFAULT_TIMEZONE)
  })

  it('未指定・空文字は既定値にする', () => {
    expect(normalizeTimezone(undefined)).toBe(DEFAULT_TIMEZONE)
    expect(normalizeTimezone('')).toBe(DEFAULT_TIMEZONE)
  })
})

describe('todayIn', () => {
  // UTC では 9/14 だが、東京とロンドン(BST)ではすでに 9/15
  const now = new Date('2026-09-14T23:30:00Z')

  it('タイムゾーンごとの日付を YYYY-MM-DD で返す', () => {
    expect(todayIn('UTC', now)).toBe('2026-09-14')
    expect(todayIn('Asia/Tokyo', now)).toBe('2026-09-15')
    expect(todayIn('Europe/London', now)).toBe('2026-09-15')
  })
})
