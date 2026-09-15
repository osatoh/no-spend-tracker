// YYYY-MM-DD の日付を表示言語に合わせて整形する。日付自体はタイムゾーン変換済みなので UTC として扱う

function utcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`)
}

// 例: 2026-09-16 → "16 Sept 2026" / "2026/09/16"
export function formatDate(date: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(utcDate(date))
}

// 例: 9 → "Sep" / "9月"
export function formatMonthShort(month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, month - 1, 1)))
}

// 例: 2026-09 → "September 2026" / "2026年9月"
export function formatMonthTitle(month: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(
    utcDate(`${month}-01`),
  )
}

// 日曜始まりの曜日名。例: ["Sun", "Mon", ...] / ["日", "月", ...]
export function weekdayNames(locale: string): string[] {
  const format = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
  // 2000-01-02 は日曜
  return Array.from({ length: 7 }, (_, i) => format.format(new Date(Date.UTC(2000, 0, 2 + i))))
}
