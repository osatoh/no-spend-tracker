import { buildDayCell, monthBoundary, monthStartInWeek, yearGridWeeks } from '../../shared/calendar'
import { DayCellView } from './DayCellView'
import type { CalendarProps } from './types'

// 日曜始まりの行のうち、月・水・金だけ曜日を出す
const WEEKDAY_LABELS = ['', '月', '', '水', '', '金', '']

// GitHub の草のような直近1年のグリッド
export function YearGrid({ dailyTotals, trackingStartDate, today, currency, onSelect }: CalendarProps) {
  const weeks = yearGridWeeks(today)
  const range = { trackingStartDate, today }

  return (
    <div className="year-grid">
      <div className="weekday-labels">
        <div className="month-label" />
        {WEEKDAY_LABELS.map((label, i) => (
          <div key={i} className="weekday-label">
            {label}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => {
        const month = monthStartInWeek(week)
        return (
          <div key={week[0]} className="week">
            <div className="month-label">{month && `${month}月`}</div>
            {week.map((date) => (
              <DayCellView
                key={date}
                cell={buildDayCell(date, dailyTotals, range)}
                currency={currency}
                isToday={date === today}
                boundary={monthBoundary(date, weekIndex === 0)}
                onSelect={onSelect}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
