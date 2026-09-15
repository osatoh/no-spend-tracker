import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// ユーザー
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    googleSub: text('google_sub').notNull(),
    email: text('email').notNull(),
    name: text('name'),
    // Google のプロフィール画像の URL。ログインのたびに更新する
    pictureUrl: text('picture_url'),
    // 表示・入力に使う通貨(ISO 4217)。当面は JPY のみ
    currency: text('currency').notNull().default('JPY'),
    // 1日の支出の目安額(currency の最小単位)。節約額の推定に使う。未設定なら null、通貨を変えたら null に戻す
    dailyBudget: integer('daily_budget'),
    // 日付の区切りに使うタイムゾーン(IANA 名。例: Asia/Tokyo, Europe/London)
    timezone: text('timezone').notNull().default('Asia/Tokyo'),
    // 記録開始日(YYYY-MM-DD)。サインアップ時のタイムゾーンで確定させ、後でタイムゾーンを変えてもずらさない
    trackingStartDate: text('tracking_start_date').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex('users_google_sub_unique').on(t.googleSub)],
)

// ログインセッション。id は推測不能なランダム値
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index('sessions_user_id_idx').on(t.userId)],
)

// 支出。記録のない日は no-spend 日として扱う
export const expenses = sqliteTable(
  'expenses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // 支出した日(YYYY-MM-DD)
    date: text('date').notNull(),
    // 通貨の最小単位の整数(JPY なら円、GBP ならペンス)
    amount: integer('amount').notNull(),
    // 記録時点の通貨。ユーザー設定を変えても過去の記録の意味が変わらないように持つ
    currency: text('currency').notNull(),
    note: text('note'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index('expenses_user_id_date_idx').on(t.userId, t.date)],
)
