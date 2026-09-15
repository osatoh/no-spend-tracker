import type { en } from './en'

export const ja = {
  app: {
    title: 'No-Spend Tracker',
  },
  auth: {
    signIn: 'Google でログイン',
    signOut: 'ログアウト',
  },
  language: {
    label: '言語',
  },
  streak: {
    // 日本語に複数形はないが、キーの形を en に揃える
    days_one: '日連続 no-spend',
    days_other: '日連続 no-spend',
    messages: {
      zero: '明日からまた一緒に積み上げよう',
      start: 'いいスタート！',
      going: 'その調子！',
      week: '1週間以上続いてる、すごい！',
      habit: '習慣になってきたね、最高！',
    },
  },
  calendar: {
    previousMonth: '‹ 前の月',
    nextMonth: '次の月 ›',
    noSpend: 'no-spend 🎉',
  },
  expenses: {
    addToday: '今日の支出を入力',
    empty: 'まだ支出の記録はありません。',
    noNote: '内訳なし',
    edit: '編集',
    delete: '削除',
    confirmDelete: '「{{note}}」を削除しますか？',
  },
  dialog: {
    newTitle: '支出を入力',
    editTitle: '支出を編集',
    date: '日付',
    note: '内訳',
    notePlaceholder: '例: コンビニのお菓子',
    amount: '金額({{currency}})',
    cancel: 'キャンセル',
    create: '登録',
    update: '更新',
  },
  errors: {
    invalid_body: 'リクエストの形式が不正です',
    invalid_date: '日付が不正です',
    date_before_tracking_start: '日付は記録開始日({{minDate}})以降にしてください',
    date_in_future: '未来の日付は入力できません',
    invalid_amount: '金額は1以上の整数で入力してください',
    invalid_note: '内訳が不正です',
    note_too_long: '内訳は{{max}}文字以内で入力してください',
    not_found: '支出が見つかりません',
    request_failed: '通信に失敗しました。もう一度お試しください',
  },
} satisfies typeof en
