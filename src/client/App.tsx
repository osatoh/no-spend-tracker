import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes } from 'react-router'
import { computeStreak } from '../shared/calendar'
import { todayIn } from '../shared/timezone'
import { deleteExpense, fetchExpenses, fetchMe, type Expense, type Me } from './api'
import { Avatar } from './Avatar'
import { MonthCalendar } from './calendar/MonthCalendar'
import { YearGrid } from './calendar/YearGrid'
import { ExpenseDialog } from './ExpenseDialog'
import { Footer } from './Footer'
import { useLocale } from './i18n/useLocale'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Settings } from './Settings'
import { StreakBanner } from './StreakBanner'
import { formatDate } from './lib/dateFormat'
import { formatMoney } from './lib/money'
import { useMediaQuery } from './lib/useMediaQuery'

type DialogState = null | { kind: 'new'; date: string } | { kind: 'edit'; expense: Expense }

// これより狭い画面では草の代わりに月カレンダーを出す
const NARROW_SCREEN_QUERY = '(max-width: 640px)'

export function App() {
  // undefined: 読み込み中 / null: 未ログイン
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    fetchMe().then(setMe)
  }, [])

  if (me === undefined) return null
  if (me === null) return <SignIn />

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout me={me} />}>
          <Route index element={<Home me={me} />} />
          <Route path="settings" element={<Settings me={me} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

// 未ログインの画面。設定画面を開けないので、ここでも言語を切り替えられるようにする
function SignIn() {
  const { t } = useTranslation()
  // サインアップ時のタイムゾーンとしてブラウザの値を渡す
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone

  return (
    <main>
      <header>
        <h1>{t('app.title')}</h1>
        <LanguageSwitcher />
      </header>
      <a className="button primary" href={`/auth/google?tz=${encodeURIComponent(tz)}`}>
        {t('auth.signIn')}
      </a>
      <Footer />
    </main>
  )
}

function Layout({ me }: { me: Me }) {
  const { t } = useTranslation()

  return (
    <main>
      <header>
        <h1>
          <Link to="/" className="title-link">
            {t('app.title')}
          </Link>
        </h1>
        <Link to="/settings" className="avatar-link" aria-label={t('header.openSettings')}>
          <Avatar me={me} />
        </Link>
      </header>
      <Outlet />
    </main>
  )
}

function Home({ me }: { me: Me }) {
  const { t } = useTranslation()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dialog, setDialog] = useState<DialogState>(null)
  const isNarrow = useMediaQuery(NARROW_SCREEN_QUERY)
  const today = todayIn(me.timezone)

  const reload = useCallback(() => {
    fetchExpenses().then(setExpenses)
  }, [])

  useEffect(reload, [reload])

  async function handleDelete(expense: Expense) {
    if (!window.confirm(t('expenses.confirmDelete', { note: expense.note ?? t('expenses.noNote') }))) return
    await deleteExpense(expense.id)
    reload()
  }

  // 当面は通貨が1つなので、通貨を区別せずに日ごとに合計する
  const dailyTotals = new Map<string, number>()
  for (const expense of expenses) {
    dailyTotals.set(expense.date, (dailyTotals.get(expense.date) ?? 0) + expense.amount)
  }
  const streak = computeStreak(new Set(dailyTotals.keys()), me.trackingStartDate, today)

  const calendarProps = {
    dailyTotals,
    trackingStartDate: me.trackingStartDate,
    today,
    currency: me.currency,
    onSelect: (date: string) => setDialog({ kind: 'new', date }),
  }

  return (
    <>
      <StreakBanner streak={streak} />

      {isNarrow ? <MonthCalendar {...calendarProps} /> : <YearGrid {...calendarProps} />}

      <button className="primary add-expense" onClick={() => setDialog({ kind: 'new', date: today })}>
        {t('expenses.addToday')}
      </button>

      <ExpenseList
        expenses={expenses}
        onEdit={(expense) => setDialog({ kind: 'edit', expense })}
        onDelete={handleDelete}
      />

      {dialog !== null && (
        <ExpenseDialog
          expense={dialog.kind === 'edit' ? dialog.expense : null}
          defaultDate={dialog.kind === 'new' ? dialog.date : today}
          today={today}
          minDate={me.trackingStartDate}
          currency={me.currency}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            reload()
          }}
        />
      )}
    </>
  )
}

type ExpenseListProps = {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

// 日付ごとにまとめて表示する(expenses は日付の降順で届く)
function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const { t } = useTranslation()
  const locale = useLocale()

  if (expenses.length === 0) return <p>{t('expenses.empty')}</p>

  const byDate = Map.groupBy(expenses, (expense) => expense.date)

  return (
    <section className="expense-list">
      {[...byDate].map(([date, items]) => (
        <div key={date} className="day">
          <h2>{formatDate(date, locale)}</h2>
          <ul>
            {items.map((expense) => (
              <li key={expense.id}>
                <span className="note">{expense.note ?? t('expenses.noNote')}</span>
                <span className="amount">{formatMoney(expense.amount, expense.currency, locale)}</span>
                <button onClick={() => onEdit(expense)}>{t('expenses.edit')}</button>
                <button onClick={() => onDelete(expense)}>{t('expenses.delete')}</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
