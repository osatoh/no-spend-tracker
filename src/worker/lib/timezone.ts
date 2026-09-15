export const DEFAULT_TIMEZONE = 'Asia/Tokyo'

// クライアントから受け取ったタイムゾーンを検証し、IANA 名に正規化する。不正・未指定なら既定値
export function normalizeTimezone(value: string | undefined): string {
  if (!value) return DEFAULT_TIMEZONE
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: value }).resolvedOptions().timeZone
  } catch {
    return DEFAULT_TIMEZONE
  }
}

// 指定タイムゾーンでの日付を YYYY-MM-DD で返す
export function todayIn(timezone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value
  return `${get('year')}-${get('month')}-${get('day')}`
}
