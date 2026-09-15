// 日付はすべて YYYY-MM-DD の文字列で扱い、タイムゾーンの影響を受けないよう UTC で計算する

export function toUtc(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10)
}

// 実在する YYYY-MM-DD かどうか。2026-02-30 のような日付は Date が繰り上げるので、往復して一致するかで判定する
export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value
}

export function addDays(date: string, days: number): string {
  const d = toUtc(date)
  d.setUTCDate(d.getUTCDate() + days)
  return fromUtc(d)
}

// 0: 日曜 〜 6: 土曜
export function dayOfWeek(date: string): number {
  return toUtc(date).getUTCDay()
}

// 今日から遡って、支出のない日が何日続いているか。今日も支出がなければ数える。記録開始日より前は数えない
export function computeStreak(spendDates: ReadonlySet<string>, trackingStartDate: string, today: string): number {
  let streak = 0
  for (let date = today; date >= trackingStartDate && !spendDates.has(date); date = addDays(date, -1)) {
    streak++
  }
  return streak
}

export type DayStatus = 'outside' | 'no-spend' | 'spend'

// 通貨ごとの合計(最小単位)
export type CurrencyTotal = { currency: string; amount: number }

export type DayCell = {
  date: string
  status: DayStatus
  // その日の支出合計。通貨が違う金額は足し合わせない
  totals: readonly CurrencyTotal[]
}

// 支出を日付ごと・通貨ごとに合計する。通貨の並びは最初に現れた順
export function sumByDateAndCurrency(
  expenses: readonly { date: string; currency: string; amount: number }[],
): Map<string, CurrencyTotal[]> {
  const result = new Map<string, CurrencyTotal[]>()
  for (const { date, currency, amount } of expenses) {
    const totals = result.get(date) ?? []
    const existing = totals.find((total) => total.currency === currency)
    if (existing) {
      existing.amount += amount
    } else {
      totals.push({ currency, amount })
    }
    result.set(date, totals)
  }
  return result
}

export function buildDayCell(
  date: string,
  dailyTotals: ReadonlyMap<string, readonly CurrencyTotal[]>,
  range: { trackingStartDate: string; today: string },
): DayCell {
  if (date < range.trackingStartDate || date > range.today) {
    return { date, status: 'outside', totals: [] }
  }
  const totals = dailyTotals.get(date) ?? []
  return { date, status: totals.length === 0 ? 'no-spend' : 'spend', totals }
}

// GitHub の草と同じく、今日を含む週を最後にした 53 週分(各週は日曜始まり)
export function yearGridWeeks(today: string, weekCount = 53): string[][] {
  const firstSunday = addDays(today, -dayOfWeek(today) - (weekCount - 1) * 7)
  return Array.from({ length: weekCount }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(firstSunday, week * 7 + day)),
  )
}

// 草の上に出す月ラベル。その週に月初(1日)が含まれていれば月(1〜12)、なければ null
export function monthStartInWeek(week: readonly string[]): number | null {
  const first = week.find((date) => date.endsWith('-01'))
  return first ? Number(first.slice(5, 7)) : null
}

// 草で月の境目を階段状に描くため、左隣(前の週の同じ曜日)・上(前日)のマスと月が変わるかを返す
export function monthBoundary(date: string, isFirstWeek: boolean): { left: boolean; top: boolean } {
  const month = date.slice(0, 7)
  return {
    left: !isFirstWeek && addDays(date, -7).slice(0, 7) !== month,
    top: dayOfWeek(date) !== 0 && addDays(date, -1).slice(0, 7) !== month,
  }
}

// 月カレンダーのマス。日曜始まりで、1日より前の空きは null
export function monthGridDates(month: string): (string | null)[] {
  const first = `${month}-01`
  const [year, monthIndex] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate()
  const blanks: null[] = Array(dayOfWeek(first)).fill(null)
  return [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i))]
}

// YYYY-MM に月数を足す
export function addMonths(month: string, months: number): string {
  const [year, monthIndex] = month.split('-').map(Number)
  return fromUtc(new Date(Date.UTC(year, monthIndex - 1 + months, 1))).slice(0, 7)
}
