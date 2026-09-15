import type { CurrencyTotal } from '../../shared/calendar'

export type CalendarProps = {
  // 日付ごと・通貨ごとの支出合計
  dailyTotals: ReadonlyMap<string, readonly CurrencyTotal[]>
  trackingStartDate: string
  today: string
  onSelect: (date: string) => void
}
