import { useTranslation } from 'react-i18next'

// Intl に渡す表示言語
export function useLocale(): string {
  const { i18n } = useTranslation()
  return i18n.resolvedLanguage ?? 'en'
}
