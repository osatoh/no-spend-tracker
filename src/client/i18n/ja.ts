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
  header: {
    openSettings: '設定を開く',
  },
  settings: {
    title: '設定',
    language: '表示言語',
    account: 'アカウント',
    region: 'タイムゾーンと通貨',
    timezone: 'タイムゾーン',
    timezoneHelp: '1日の区切りを決めます。記録開始日({{date}})は変わりません。',
    currency: '通貨',
    currencyHelp: '新しく登録する支出に使います。過去の支出は登録時の通貨のままです。',
    saved: '保存しました。',
    signedInAs: '{{email}} でログイン中',
    about: 'このアプリについて',
    deleteAccount: 'アカウントを削除',
    deleteDescription: 'アカウントとすべての支出の記録を完全に削除します。元に戻すことはできません。',
    confirmDelete: 'アカウントとすべての支出の記録を削除しますか？元に戻すことはできません。',
  },
  footer: {
    privacy: 'プライバシーポリシー',
    source: 'ソースコード',
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
    invalid_timezone: '有効なタイムゾーンを選んでください',
    invalid_currency: '対応している通貨を選んでください',
    not_found: '支出が見つかりません',
    rate_limited: '短時間に操作が集中しています。1分ほど待ってからもう一度お試しください',
    request_failed: '通信に失敗しました。もう一度お試しください',
  },
} satisfies typeof en
