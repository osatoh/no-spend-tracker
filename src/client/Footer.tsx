import { useTranslation } from 'react-i18next'

const REPOSITORY_URL = 'https://github.com/osatoh/no-spend-tracker'
// ポリシーは英語・日本語を1ファイルに併記しているので、表示言語の見出しへ直接飛ばす
const PRIVACY_ANCHORS: Record<string, string> = { en: '#english', ja: '#日本語' }

export function Footer() {
  const { t, i18n } = useTranslation()
  const anchor = PRIVACY_ANCHORS[i18n.resolvedLanguage ?? 'en'] ?? ''

  return (
    <footer>
      <a href={`${REPOSITORY_URL}/blob/main/PRIVACY.md${anchor}`} target="_blank" rel="noreferrer">
        {t('footer.privacy')}
      </a>
      <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
        {t('footer.source')}
      </a>
    </footer>
  )
}
