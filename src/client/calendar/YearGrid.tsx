import { buildDayCell, monthBoundary, monthStartInWeek, yearGridWeeks } from '../../shared/calendar'
import { useLocale } from '../i18n/useLocale'
import { formatMonthShort, weekdayNames } from '../lib/dateFormat'
import { DayCellView } from './DayCellView'
import type { CalendarProps } from './types'

// 日曜始まりの行のうち、月・水・金だけ曜日を出す
const LABELED_WEEKDAYS = new Set([1, 3, 5])

// GitHub の草のような直近1年のグリッド
export function YearGrid({ dailyTotals, trackingStartDate, today, onSelect }: CalendarProps) {
  const locale = useLocale()
  const weeks = yearGridWeeks(today)
  const range = { trackingStartDate, today }

  return (
    <div className="year-grid">
      <div className="weekday-labels">
        <div className="month-label" />
        {weekdayNames(locale).map((name, i) => (
          <div key={i} className="weekday-label">
            {LABELED_WEEKDAYS.has(i) ? name : ''}
          </div>
        ))}
      </div>
      {weeks.map((week, weekIndex) => {
        const month = monthStartInWeek(week)
        return (
          <div key={week[0]} className="week">
            <div className="month-label">{month && formatMonthShort(month, locale)}</div>
            {week.map((date) => (
              <DayCellView
                key={date}
                cell={buildDayCell(date, dailyTotals, range)}
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
