import { fractionDigits } from '../../shared/currency'

export { fractionDigits }

// 最小単位の整数を通貨表記にする(例: 350, GBP → £3.50)
export function formatMoney(amountMinor: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    amountMinor / 10 ** fractionDigits(currency),
  )
}

// 入力欄の値(通常の単位)を最小単位の整数にする。数値でなければ null
export function toMinorUnits(value: string, currency: string): number | null {
  if (value.trim() === '') return null
  const major = Number(value)
  if (!Number.isFinite(major)) return null
  return Math.round(major * 10 ** fractionDigits(currency))
}

// 最小単位の整数を入力欄に入れる値にする
export function toMajorUnits(amountMinor: number, currency: string): string {
  const digits = fractionDigits(currency)
  return (amountMinor / 10 ** digits).toFixed(digits)
}
