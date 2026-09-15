import type { ApiErrorCode } from '../../shared/apiErrors'
import { isSupportedCurrency, type SupportedCurrency } from '../../shared/currency'
import { isValidTimezone } from '../../shared/timezone'

export type SettingsInput = {
  timezone?: string
  currency?: SupportedCurrency
}

export type SettingsValidationResult = { ok: true; value: SettingsInput } | { ok: false; errors: ApiErrorCode[] }

// 設定の変更リクエストを検証する。変更したい項目だけを送れるが、少なくとも1つは必要
export function validateSettingsInput(body: unknown): SettingsValidationResult {
  if (typeof body !== 'object' || body === null) return { ok: false, errors: ['invalid_body'] }
  const { timezone, currency } = body as Record<string, unknown>
  if (timezone === undefined && currency === undefined) return { ok: false, errors: ['invalid_body'] }

  const errors: ApiErrorCode[] = []
  if (timezone !== undefined && !isValidTimezone(timezone)) errors.push('invalid_timezone')
  if (currency !== undefined && !isSupportedCurrency(currency)) errors.push('invalid_currency')
  if (errors.length > 0) return { ok: false, errors }

  const value: SettingsInput = {}
  if (isValidTimezone(timezone)) value.timezone = timezone
  if (isSupportedCurrency(currency)) value.currency = currency
  return { ok: true, value }
}
