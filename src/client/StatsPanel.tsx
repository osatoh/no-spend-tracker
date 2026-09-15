import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import type { ExchangeRates } from '../shared/currency'
import { computeStats, noSpendRate, type PeriodStats } from '../shared/stats'
import { fetchRates, type Expense, type Me } from './api'
import { useLocale } from './i18n/useLocale'
import { formatMonthTitle } from './lib/dateFormat'
import { formatMoney } from './lib/money'

type Props = {
  me: Me
  expenses: Expense[]
  today: string
}

// 表示通貨以外の支出があるときだけレートを取得する。取得できなければ 'error'
function useExchangeRates(currency: string, needed: boolean): ExchangeRates | null | 'error' {
  const [rates, setRates] = useState<ExchangeRates | null | 'error'>(null)

  useEffect(() => {
    if (!needed) return
    let cancelled = false
    fetchRates(currency)
      .then((loaded) => !cancelled && setRates(loaded))
      .catch(() => !cancelled && setRates('error'))
    return () => {
      cancelled = true
    }
  }, [currency, needed])

  return needed ? rates : null
}

export function StatsPanel({ me, expenses, today }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const needsRates = expenses.some((expense) => expense.currency !== me.currency)
  const rates = useExchangeRates(me.currency, needsRates)
  // レートの取得中は、換算が必要な節約額だけ表示を保留する
  const ratesPending = needsRates && rates === null

  const stats = computeStats({
    expenses,
    trackingStartDate: me.trackingStartDate,
    today,
    dailyBudget: me.dailyBudget,
    currency: me.currency,
    rates: rates === 'error' ? null : rates,
  })
  const [thisMonth, ...previousMonths] = stats.months
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 })

  function rateText(period: PeriodStats) {
    const rate = noSpendRate(period)
    return rate === null ? '-' : percent.format(rate)
  }

  function savedText(period: PeriodStats) {
    if (me.dailyBudget === null || ratesPending || period.saved === null) return '-'
    return formatMoney(period.saved, me.currency, locale)
  }

  return (
    <section className="stats">
      <h2>{t('stats.title')}</h2>

      <div className="stats-cards">
        {[
          { label: t('stats.thisMonth'), period: thisMonth },
          { label: t('stats.allTime'), period: stats.total },
        ].map(({ label, period }) => (
          <div key={label} className="stats-card">
            <h3>{label}</h3>
            <p className="stats-rate">{rateText(period)}</p>
            <p className="stats-sub">
              {t('stats.noSpendDays', { noSpend: period.noSpendDays, count: period.trackedDays })}
            </p>
            <p className="stats-saved">
              {t('stats.saved')}: <strong>{savedText(period)}</strong>
            </p>
          </div>
        ))}
      </div>

      {me.dailyBudget === null && (
        <p className="stats-note">
          {t('stats.setBudget')} <Link to="/settings">{t('settings.title')}</Link>
        </p>
      )}
      {me.dailyBudget !== null && rates === 'error' && <p className="stats-note">{t('stats.ratesUnavailable')}</p>}

      {previousMonths.length > 0 && (
        <div className="stats-table-scroll">
          <table className="stats-table">
            <thead>
              <tr>
                <th>{t('stats.month')}</th>
                <th>{t('stats.noSpendRate')}</th>
                <th>{t('stats.saved')}</th>
              </tr>
            </thead>
            <tbody>
              {previousMonths.map((month) => (
                <tr key={month.month}>
                  <td>{formatMonthTitle(month.month, locale)}</td>
                  <td>
                    {rateText(month)} ({month.noSpendDays}/{month.trackedDays})
                  </td>
                  <td>{savedText(month)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
