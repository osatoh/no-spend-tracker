import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, createExpense, updateExpense, type Expense } from './api'
import { fractionDigits, toMajorUnits, toMinorUnits } from './lib/money'

const MAX_NOTE_LENGTH = 100

type Props = {
  // null なら新規登録、Expense なら編集
  expense: Expense | null
  today: string
  minDate: string
  currency: string
  onClose: () => void
  onSaved: () => void
}

// 支出の登録・編集モーダル。表示中だけマウントする
export function ExpenseDialog({ expense, today, minDate, currency, onClose, onSaved }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [date, setDate] = useState(expense?.date ?? today)
  const [note, setNote] = useState(expense?.note ?? '')
  const [amount, setAmount] = useState(expense ? toMajorUnits(expense.amount, expense.currency) : '')
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // 編集時は登録時の通貨で入力させる
  const inputCurrency = expense?.currency ?? currency
  const digits = fractionDigits(inputCurrency)

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const amountMinor = toMinorUnits(amount, inputCurrency)
    if (amountMinor === null) {
      setErrors(['金額を入力してください'])
      return
    }
    const input = { date, amount: amountMinor, note: note.trim() === '' ? null : note }
    setSaving(true)
    try {
      if (expense) {
        await updateExpense(expense.id, input)
      } else {
        await createExpense(input)
      }
      onSaved()
    } catch (err) {
      setErrors(err instanceof ApiError ? err.messages : ['保存に失敗しました'])
      setSaving(false)
    }
  }

  return (
    // Esc キーで閉じたときも親の状態を戻す
    <dialog ref={dialogRef} className="expense-dialog" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>{expense ? '支出を編集' : '支出を入力'}</h2>

        <label>
          日付
          <input type="date" value={date} min={minDate} max={today} required onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          内訳
          <input
            type="text"
            value={note}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="例: コンビニのお菓子"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <label>
          金額({inputCurrency})
          <input
            type="number"
            inputMode={digits === 0 ? 'numeric' : 'decimal'}
            value={amount}
            min={1 / 10 ** digits}
            step={1 / 10 ** digits}
            required
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        {errors.length > 0 && (
          <ul className="errors" role="alert">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <div className="actions">
          <button type="button" onClick={() => dialogRef.current?.close()}>
            キャンセル
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {expense ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
