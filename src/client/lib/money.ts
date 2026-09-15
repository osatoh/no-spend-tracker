import { fractionDigits } from '../../shared/currency'
import { numberFormat } from './intlCache'

// 最小単位の整数を通貨表記にする(例: 350, GBP → £3.50)
export function formatMoney(amountMinor: number, currency: string, locale: string): string {
  return numberFormat(locale, { style: 'currency', currency }).format(amountMinor / 10 ** fractionDigits(currency))
}

// 入力欄の値(通常の単位)を最小単位の整数にする。数値でなければ null
export function toMinorUnits(value: string, currency: string): number | null {
  if (value.trim() === '') return null
  const major = Number(value)
  if (!Number.isFinite(major)) return null
  return Math.round(major * 10 ** fractionDigits(currency))
}

// 最小単位の整数を入力欄に入れる値にする。null(未設定)は空欄
export function toMajorUnits(amountMinor: number | null, currency: string): string {
  if (amountMinor === null) return ''
  const digits = fractionDigits(currency)
  return (amountMinor / 10 ** digits).toFixed(digits)
}

// 金額の入力欄の属性。通貨の小数桁数に合わせて、入力できる最小単位とキーボードを決める
export function moneyInputProps(currency: string) {
  const digits = fractionDigits(currency)
  const step = 1 / 10 ** digits
  return {
    type: 'number',
    inputMode: digits === 0 ? 'numeric' : 'decimal',
    min: step,
    step,
  } as const
}
