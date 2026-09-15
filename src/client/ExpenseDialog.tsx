import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiErrorCode } from '../shared/apiErrors'
import { MAX_NOTE_LENGTH } from '../shared/limits'
import { ApiError, createExpense, updateExpense, type Expense } from './api'
import { moneyInputProps, toMajorUnits, toMinorUnits } from './lib/money'

type Props = {
  // null なら新規登録、Expense なら編集
  expense: Expense | null
  // 新規登録時の日付の初期値
  defaultDate: string
  today: string
  minDate: string
  currency: string
  onClose: () => void
  onSaved: () => void
}

// 支出の登録・編集モーダル。表示中だけマウントする
export function ExpenseDialog({ expense, defaultDate, today, minDate, currency, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [date, setDate] = useState(expense?.date ?? defaultDate)
  const [note, setNote] = useState(expense?.note ?? '')
  const [amount, setAmount] = useState(expense ? toMajorUnits(expense.amount, expense.currency) : '')
  const [errors, setErrors] = useState<ApiErrorCode[]>([])
  const [saving, setSaving] = useState(false)

  // 編集時は登録時の通貨で入力させる
  const inputCurrency = expense?.currency ?? currency

  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const amountMinor = toMinorUnits(amount, inputCurrency)
    if (amountMinor === null) {
      setErrors(['invalid_amount'])
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
      setErrors(err instanceof ApiError ? err.codes : ['request_failed'])
      setSaving(false)
    }
  }

  return (
    // Esc キーで閉じたときも親の状態を戻す
    <dialog ref={dialogRef} className="expense-dialog" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2>{expense ? t('dialog.editTitle') : t('dialog.newTitle')}</h2>

        <label>
          {t('dialog.date')}
          <input type="date" value={date} min={minDate} max={today} required onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          {t('dialog.note')}
          <input
            type="text"
            value={note}
            maxLength={MAX_NOTE_LENGTH}
            placeholder={t('dialog.notePlaceholder')}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <label>
          {t('dialog.amount', { currency: inputCurrency })}
          <input
            {...moneyInputProps(inputCurrency)}
            value={amount}
            required
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        {errors.length > 0 && (
          <ul className="errors" role="alert">
            {errors.map((code) => (
              <li key={code}>{t(`errors.${code}`, { minDate, max: MAX_NOTE_LENGTH })}</li>
            ))}
          </ul>
        )}

        <div className="actions">
          <button type="button" onClick={() => dialogRef.current?.close()}>
            {t('dialog.cancel')}
          </button>
          <button type="submit" className="primary" disabled={saving}>
            {expense ? t('dialog.update') : t('dialog.create')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
