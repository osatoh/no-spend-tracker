// 設定で選べる通貨(ISO 4217)。換算は未対応で、支出はそれぞれ登録時の通貨で保存する
export const SUPPORTED_CURRENCIES = ['JPY', 'GBP'] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: unknown): value is SupportedCurrency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}
