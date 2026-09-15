import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { addMonths, buildDayCell, monthGridDates } from '../../shared/calendar'
import { useLocale } from '../i18n/useLocale'
import { formatMonthTitle, weekdayNames } from '../lib/dateFormat'
import { DayCellView } from './DayCellView'
import type { CalendarProps } from './types'

// 1か月分のカレンダー。記録開始月から今月まで切り替えられる
export function MonthCalendar({ dailyTotals, trackingStartDate, today, currency, onSelect }: CalendarProps) {
  const { t } = useTranslation()
  const locale = useLocale()
  const currentMonth = today.slice(0, 7)
  const firstMonth = trackingStartDate.slice(0, 7)
  const [month, setMonth] = useState(currentMonth)
  const range = { trackingStartDate, today }

  return (
    <div className="month-calendar">
      <div className="month-nav">
        <button type="button" disabled={month <= firstMonth} onClick={() => setMonth(addMonths(month, -1))}>
          {t('calendar.previousMonth')}
        </button>
        <h2>{formatMonthTitle(month, locale)}</h2>
        <button type="button" disabled={month >= currentMonth} onClick={() => setMonth(addMonths(month, 1))}>
          {t('calendar.nextMonth')}
        </button>
      </div>
      <div className="month-grid">
        {weekdayNames(locale).map((weekday) => (
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
