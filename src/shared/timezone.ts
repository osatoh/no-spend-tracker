export const DEFAULT_TIMEZONE = 'Asia/Tokyo'

// 有効なタイムゾーン名なら IANA 名に正規化して返す。不正なら null
function resolveTimezone(value: string): string | null {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: value }).resolvedOptions().timeZone
  } catch {
    return null
  }
}

// クライアントから受け取ったタイムゾーンを検証し、IANA 名に正規化する。不正・未指定なら既定値
export function normalizeTimezone(value: string | undefined): string {
  return (value && resolveTimezone(value)) || DEFAULT_TIMEZONE
}

// 設定の変更時は既定値に置き換えず、不正な値として扱う
export function isValidTimezone(value: unknown): value is string {
  return typeof value === 'string' && value !== '' && resolveTimezone(value) !== null
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
