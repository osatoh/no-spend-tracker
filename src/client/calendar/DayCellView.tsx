import { useTranslation } from 'react-i18next'
import type { DayCell } from '../../shared/calendar'
import { useLocale } from '../i18n/useLocale'
import { formatDate } from '../lib/dateFormat'
import { formatMoney } from '../lib/money'

type Props = {
  cell: DayCell
  currency: string
  label?: string
  isToday: boolean
  // 月の境目の線を引く辺(草のみ)
  boundary?: { left: boolean; top: boolean }
  onSelect: (date: string) => void
}

// 草・月カレンダー共通のマス。範囲外の日は押せない
export function DayCellView({ cell, currency, label, isToday, boundary, onSelect }: Props) {
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
  const description =
    cell.status === 'outside'
      ? date
      : `${date}: ${cell.status === 'no-spend' ? t('calendar.noSpend') : formatMoney(cell.total, currency, locale)}`

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
