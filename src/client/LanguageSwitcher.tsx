import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES } from './i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  return (
    <select
      aria-label={t('language.label')}
      value={i18n.resolvedLanguage}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
    >
      {SUPPORTED_LANGUAGES.map((language) => (
        <option key={language.code} value={language.code}>
          {language.label}
        </option>
      ))}
    </select>
  )
}
