import { addDays } from './calendar'
import { convertMinor, type ExchangeRates } from './currency'

export type PeriodStats = {
  // 記録した日数(記録開始日から今日までのうち、その期間に含まれる日)
  trackedDays: number
  noSpendDays: number
  // 節約額の推定(表示通貨の最小単位)。目安額が未設定、または換算できない支出があれば null
  saved: number | null
}

export type MonthStats = PeriodStats & { month: string }

export type Stats = {
  // 新しい月から順に並べる
  months: MonthStats[]
  total: PeriodStats
}

type Params = {
  expenses: readonly { date: string; currency: string; amount: number }[]
  trackingStartDate: string
  today: string
  // 1日の目安額(表示通貨の最小単位)
  dailyBudget: number | null
  // 表示通貨
  currency: string
  // base が表示通貨のレート。表示通貨以外の支出がなければ不要
  rates: ExchangeRates | null
}

// 月ごとと累計の no-spend 日数と節約額を集計する。
// 節約額は日ごとの「目安額 − その日の支出」の合計で、目安額を超えた日はマイナスになる
export function computeStats({ expenses, trackingStartDate, today, dailyBudget, currency, rates }: Params): Stats {
  const spentByDate = new Map<string, number>()
  let convertible = true
  for (const expense of expenses) {
    if (expense.date < trackingStartDate || expense.date > today) continue
    const amount = convertMinor(expense.amount, expense.currency, currency, rates)
    if (amount === null) convertible = false
    spentByDate.set(expense.date, (spentByDate.get(expense.date) ?? 0) + (amount ?? 0))
  }
  const canSave = dailyBudget !== null && convertible

  const byMonth = new Map<string, MonthStats>()
  const total: PeriodStats = { trackedDays: 0, noSpendDays: 0, saved: canSave ? 0 : null }
  for (let date = trackingStartDate; date <= today; date = addDays(date, 1)) {
    const month = date.slice(0, 7)
    const stats = byMonth.get(month) ?? { month, trackedDays: 0, noSpendDays: 0, saved: canSave ? 0 : null }
    const spent = spentByDate.get(date)
    const saved = canSave ? dailyBudget - (spent ?? 0) : null

    for (const period of [stats, total]) {
      period.trackedDays++
      if (spent === undefined) period.noSpendDays++
      if (saved !== null && period.saved !== null) period.saved += saved
    }
    byMonth.set(month, stats)
  }

  return { months: [...byMonth.values()].reverse(), total }
}

// no-spend 率(0〜1)。記録した日がなければ null
export function noSpendRate(stats: PeriodStats): number | null {
  return stats.trackedDays === 0 ? null : stats.noSpendDays / stats.trackedDays
}
