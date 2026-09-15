import { useTranslation } from 'react-i18next'
import type { DayCell } from '../../shared/calendar'
import { useLocale } from '../i18n/useLocale'
import { formatDate } from '../lib/dateFormat'
import { formatMoney } from '../lib/money'

type Props = {
  cell: DayCell
  label?: string
  isToday: boolean
  // 月の境目の線を引く辺(草のみ)
  boundary?: { left: boolean; top: boolean }
  onSelect: (date: string) => void
}

// 草・月カレンダー共通のマス。範囲外の日は押せない
export function DayCellView({ cell, label, isToday, boundary, onSelect }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const classNames = [
    'day-cell',
    cell.status,
    isToday && 'today',
    boundary?.left && 'boundary-left',
    boundary?.top && 'boundary-top',
  ]
  const date = formatDate(cell.date, locale)
  // 通貨が違う金額は換算せず「¥500 + £3.50」のように並べる
  const spent = cell.totals.map((total) => formatMoney(total.amount, total.currency, locale)).join(' + ')
  const description =
    cell.status === 'outside' ? date : `${date}: ${cell.status === 'no-spend' ? t('calendar.noSpend') : spent}`

  return (
    <button
      type="button"
      className={classNames.filter(Boolean).join(' ')}
      title={description}
      aria-label={description}
      disabled={cell.status === 'outside'}
      onClick={() => onSelect(cell.date)}
    >
      {label}
    </button>
  )
}
