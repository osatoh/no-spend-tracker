import 'i18next'
import type { en } from './en'

// t() に渡すキーを型でチェックする
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: typeof en }
  }
}
