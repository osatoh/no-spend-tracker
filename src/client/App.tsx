import { useCallback, useEffect, useState } from 'react'
import { todayIn } from '../shared/timezone'
import { deleteExpense, fetchExpenses, fetchMe, type Expense, type Me } from './api'
import { ExpenseDialog } from './ExpenseDialog'
import { formatMoney } from './lib/money'

// 閉じている: null / 新規登録: 'new' / 編集: 対象の支出
type DialogState = null | 'new' | Expense

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

  return (
    <main>
      <header>
        <h1>No-Spend Tracker</h1>
        <form method="post" action="/auth/logout">
          <span>{me.name ?? me.email}</span>
          <button>ログアウト</button>
        </form>
      </header>

      <button className="primary" onClick={() => setDialog('new')}>
        今日の支出を入力
      </button>

      <ExpenseList expenses={expenses} onEdit={setDialog} onDelete={handleDelete} />

      {dialog !== null && (
        <ExpenseDialog
          expense={dialog === 'new' ? null : dialog}
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
