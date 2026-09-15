import { useCallback, useEffect, useState } from 'react'
import { computeStreak } from '../shared/calendar'
import { todayIn } from '../shared/timezone'
import { deleteExpense, fetchExpenses, fetchMe, type Expense, type Me } from './api'
import { MonthCalendar } from './calendar/MonthCalendar'
import { YearGrid } from './calendar/YearGrid'
import { ExpenseDialog } from './ExpenseDialog'
import { StreakBanner } from './StreakBanner'
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

  if (me === null) {
    // サインアップ時のタイムゾーンとしてブラウザの値を渡す
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return (
      <main>
        <h1>No-Spend Tracker</h1>
        <a className="button primary" href={`/auth/google?tz=${encodeURIComponent(tz)}`}>
          Google でログイン
        </a>
      </main>
    )
  }

  return <Home me={me} />
}

function Home({ me }: { me: Me }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [dialog, setDialog] = useState<DialogState>(null)
  const isNarrow = useMediaQuery(NARROW_SCREEN_QUERY)
  const today = todayIn(me.timezone)

  const reload = useCallback(() => {
    fetchExpenses().then(setExpenses)
  }, [])

  useEffect(reload, [reload])

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`「${expense.note ?? '内訳なし'}」を削除しますか？`)) return
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
    <main>
      <header>
        <h1>No-Spend Tracker</h1>
        <form method="post" action="/auth/logout">
          <span>{me.name ?? me.email}</span>
          <button>ログアウト</button>
        </form>
      </header>

      <StreakBanner streak={streak} />

      {isNarrow ? <MonthCalendar {...calendarProps} /> : <YearGrid {...calendarProps} />}

      <button className="primary" onClick={() => setDialog({ kind: 'new', date: today })}>
        今日の支出を入力
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
    </main>
  )
}

type ExpenseListProps = {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

// 日付ごとにまとめて表示する(expenses は日付の降順で届く)
function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) return <p>まだ支出の記録はありません。</p>

  const byDate = Map.groupBy(expenses, (expense) => expense.date)

  return (
    <section className="expense-list">
      {[...byDate].map(([date, items]) => (
        <div key={date} className="day">
          <h2>{date}</h2>
          <ul>
            {items.map((expense) => (
              <li key={expense.id}>
                <span className="note">{expense.note ?? '内訳なし'}</span>
                <span className="amount">{formatMoney(expense.amount, expense.currency)}</span>
                <button onClick={() => onEdit(expense)}>編集</button>
                <button onClick={() => onDelete(expense)}>削除</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
