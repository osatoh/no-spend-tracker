import { Hono } from 'hono'
import type { ApiErrorCode } from '../../shared/apiErrors'
import { SUPPORTED_CURRENCIES, isSupportedCurrency, type ExchangeRates } from '../../shared/currency'
import { requireUser } from '../auth/session'
import type { AppEnv } from '../types'

// Frankfurter のレートは1日1回更新されるので、数時間キャッシュすれば十分
const CACHE_TTL_SECONDS = 6 * 60 * 60

const INVALID_CURRENCY: ApiErrorCode[] = ['invalid_currency']
const RATES_UNAVAILABLE: ApiErrorCode[] = ['rates_unavailable']

export const ratesRoutes = new Hono<AppEnv>()

// 表示通貨(base)への換算に使う今日の為替レート。
// 利用者のブラウザから外部サービスへ直接通信しないよう Worker が取得し、Cache API でキャッシュする
ratesRoutes.get('/', async (c) => {
  // 誰でも使える外部 API の中継にならないようログインを必須にする
  requireUser(c)
  const base = c.req.query('base')
  if (!isSupportedCurrency(base)) return c.json({ errors: INVALID_CURRENCY }, 400)

  const symbols = SUPPORTED_CURRENCIES.filter((currency) => currency !== base)
  const url = `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${symbols.join(',')}`
  const cacheKey = new Request(url)
  const cache = caches.default

  let response = await cache.match(cacheKey)
  if (!response) {
    const upstream = await fetch(url).catch(() => null)
    if (!upstream?.ok) return c.json({ errors: RATES_UNAVAILABLE }, 502)
    response = new Response(await upstream.text(), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}` },
    })
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()))
  }

  const data = (await response.json()) as ExchangeRates
  const rates: ExchangeRates = { base: data.base, date: data.date, rates: data.rates }
  return c.json({ rates })
})
