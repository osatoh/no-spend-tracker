export type CalendarProps = {
  // 日付ごとの支出合計(最小単位)
  dailyTotals: ReadonlyMap<string, number>
  trackingStartDate: string
  today: string
  currency: string
  onSelect: (date: string) => void
}
