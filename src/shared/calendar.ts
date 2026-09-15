// 日付はすべて YYYY-MM-DD の文字列で扱い、タイムゾーンの影響を受けないよう UTC で計算する

function toUtc(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10)
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

export type DayCell = {
  date: string
  status: DayStatus
  // その日の支出合計(最小単位)
  total: number
}

export function buildDayCell(
  date: string,
  dailyTotals: ReadonlyMap<string, number>,
  range: { trackingStartDate: string; today: string },
): DayCell {
  if (date < range.trackingStartDate || date > range.today) {
    return { date, status: 'outside', total: 0 }
  }
  const total = dailyTotals.get(date) ?? 0
  return { date, status: total === 0 ? 'no-spend' : 'spend', total }
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
