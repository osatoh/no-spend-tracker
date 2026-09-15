import type { ApiErrorCode } from '../../shared/apiErrors'

// 翻訳の基準になる英語の文言。ja.ts はこの形に合わせる
export const en = {
  app: {
    title: 'No-Spend Tracker',
  },
  auth: {
    signIn: 'Sign in with Google',
    signOut: 'Sign out',
  },
  language: {
    label: 'Language',
  },
  header: {
    openSettings: 'Open settings',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    account: 'Account',
    signedInAs: 'Signed in as {{email}}',
    about: 'About',
    deleteAccount: 'Delete account',
    deleteDescription: 'Permanently delete your account and all spending records. This cannot be undone.',
    confirmDelete: 'Delete your account and all spending records? This cannot be undone.',
  },
  footer: {
    privacy: 'Privacy Policy',
    source: 'Source code',
  },
  streak: {
    days_one: 'day no-spend streak',
    days_other: 'days no-spend streak',
    messages: {
      zero: "Let's build it back up from tomorrow",
      start: 'Nice start!',
      going: 'Keep it up!',
      week: 'Over a week. Amazing!',
      habit: "It's becoming a habit. Brilliant!",
    },
  },
  calendar: {
    previousMonth: '‹ Previous',
    nextMonth: 'Next ›',
    noSpend: 'no-spend 🎉',
  },
  expenses: {
    addToday: "Log today's spending",
    empty: 'No spending logged yet.',
    noNote: 'No note',
    edit: 'Edit',
    delete: 'Delete',
    confirmDelete: 'Delete "{{note}}"?',
  },
  dialog: {
    newTitle: 'Log spending',
    editTitle: 'Edit spending',
    date: 'Date',
    note: 'Note',
    notePlaceholder: 'e.g. Snacks from the corner shop',
    amount: 'Amount ({{currency}})',
    cancel: 'Cancel',
    create: 'Save',
    update: 'Update',
  },
  errors: {
    invalid_body: 'The request was invalid.',
    invalid_date: 'Enter a valid date.',
    date_before_tracking_start: 'The date must be on or after your tracking start date ({{minDate}}).',
    date_in_future: "You can't log spending for a future date.",
    invalid_amount: 'Enter a whole amount of at least 1.',
    invalid_note: 'The note is invalid.',
    note_too_long: 'The note must be {{max}} characters or fewer.',
    not_found: 'That spending entry could not be found.',
    rate_limited: 'Too many changes in a short time. Please wait a minute and try again.',
    request_failed: 'Something went wrong. Please try again.',
  } satisfies Record<ApiErrorCode, string>,
}
