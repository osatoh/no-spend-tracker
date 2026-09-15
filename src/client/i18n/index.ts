import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { ja } from './ja'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
] as const

// 画面右上で選んだ言語を優先し、未選択ならブラウザの言語設定に合わせる。どちらでもなければ英語
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ja: { translation: ja } },
    supportedLngs: SUPPORTED_LANGUAGES.map((language) => language.code),
    fallbackLng: 'en',
    // ja-JP や en-GB も ja / en として扱う
    load: 'languageOnly',
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
    // React が出力時にエスケープするため不要
    interpolation: { escapeValue: false },
  })

// 読み上げや検索のために <html lang> を表示言語に合わせる
document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
i18n.on('languageChanged', () => {
  document.documentElement.lang = i18n.resolvedLanguage ?? 'en'
})

export default i18n
