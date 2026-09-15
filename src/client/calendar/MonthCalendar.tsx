import { useState } from 'react'
import { addMonths, buildDayCell, monthGridDates } from '../../shared/calendar'
import { DayCellView } from './DayCellView'
import type { CalendarProps } from './types'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

// 1か月分のカレンダー。記録開始月から今月まで切り替えられる
export function MonthCalendar({ dailyTotals, trackingStartDate, today, currency, onSelect }: CalendarProps) {
  const currentMonth = today.slice(0, 7)
  const firstMonth = trackingStartDate.slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const range = { trackingStartDate, today }
  const [year, monthNumber] = month.split('-').map(Number)

  return (
    <div className="month-calendar">
      <div className="month-nav">
        <button type="button" disabled={month <= firstMonth} onClick={() => setMonth(addMonths(month, -1))}>
          ‹ 前の月
        </button>
        <h2>
          {year}年{monthNumber}月
        </h2>
        <button type="button" disabled={month >= currentMonth} onClick={() => setMonth(addMonths(month, 1))}>
          次の月 ›
        </button>
      </div>
      <div className="month-grid">
        {WEEKDAYS.map((weekday) => (
          <div key={weekday} className="weekday">
            {weekday}
          </div>
        ))}
        {monthGridDates(month).map((date, i) =>
          date === null ? (
            <div key={`blank-${i}`} />
          ) : (
            <DayCellView
              key={date}
              cell={buildDayCell(date, dailyTotals, range)}
              currency={currency}
              label={String(Number(date.slice(8)))}
              isToday={date === today}
              onSelect={onSelect}
            />
          ),
        )}
      </div>
    </div>
  )
}
