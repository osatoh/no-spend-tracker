import type { ApiErrorCode } from '../../shared/apiErrors'
import { isSupportedCurrency, type SupportedCurrency } from '../../shared/currency'
import { isValidTimezone } from '../../shared/timezone'
import { MAX_AMOUNT } from '../expenses/validation'

export type SettingsInput = {
  timezone?: string
  currency?: SupportedCurrency
  // 表示通貨の最小単位。null で未設定に戻す
  dailyBudget?: number | null
}

export type SettingsValidationResult = { ok: true; value: SettingsInput } | { ok: false; errors: ApiErrorCode[] }

function isValidBudget(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_AMOUNT)
}

// 設定の変更リクエストを検証する。変更したい項目だけを送れるが、少なくとも1つは必要
export function validateSettingsInput(body: unknown): SettingsValidationResult {
  if (typeof body !== 'object' || body === null) return { ok: false, errors: ['invalid_body'] }
  const { timezone, currency, dailyBudget } = body as Record<string, unknown>
  if (timezone === undefined && currency === undefined && dailyBudget === undefined) {
    return { ok: false, errors: ['invalid_body'] }
  }

  const errors: ApiErrorCode[] = []
  if (timezone !== undefined && !isValidTimezone(timezone)) errors.push('invalid_timezone')
  if (currency !== undefined && !isSupportedCurrency(currency)) errors.push('invalid_currency')
  if (dailyBudget !== undefined && !isValidBudget(dailyBudget)) errors.push('invalid_budget')
  if (errors.length > 0) return { ok: false, errors }

  const value: SettingsInput = {}
  if (isValidTimezone(timezone)) value.timezone = timezone
  if (isSupportedCurrency(currency)) value.currency = currency
  if (dailyBudget !== undefined && isValidBudget(dailyBudget)) value.dailyBudget = dailyBudget
  return { ok: true, value }
}
