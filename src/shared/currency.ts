// 設定で選べる通貨(ISO 4217)。支出はそれぞれ登録時の通貨で保存し、集計時に表示通貨へ換算する
export const SUPPORTED_CURRENCIES = ['JPY', 'GBP'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

// 通貨の小数桁数(JPY: 0, GBP: 2)
export function fractionDigits(currency: string): number {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 0
}

// 為替レート。base 通貨 1 単位が各通貨でいくらになるか(Frankfurter の形式に合わせる)
export type ExchangeRates = {
  base: string
  date: string
  rates: Record<string, number>
}

// 最小単位の金額を別の通貨の最小単位に換算する。rates の base は換算先の通貨であること。換算できなければ null
export function convertMinor(amountMinor: number, from: string, to: string, rates: ExchangeRates | null): number | null {
  if (from === to) return amountMinor
  if (!rates || rates.base !== to) return null
  const rate = rates.rates[from]
  if (!rate) return null
  // base(to) 1 単位 = rate(from) なので、from の金額 ÷ rate が to の金額
  const major = amountMinor / 10 ** fractionDigits(from)
  return Math.round((major / rate) * 10 ** fractionDigits(to))
}
