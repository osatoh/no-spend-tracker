import { useTranslation } from 'react-i18next'

const REPOSITORY_URL = 'https://github.com/osatoh/no-spend-tracker'
// ポリシーは英語・日本語を1ファイルに併記しているので、表示言語の見出しへ直接飛ばす
const PRIVACY_ANCHORS: Record<string, string> = { en: '#english', ja: '#日本語' }

// プライバシーポリシーとソースコードへのリンク。ログイン画面のフッターと設定画面で使う
export function ProjectLinks() {
  const { t, i18n } = useTranslation()
  const anchor = PRIVACY_ANCHORS[i18n.resolvedLanguage ?? 'en'] ?? ''

  return (
    <div className="project-links">
      <a href={`${REPOSITORY_URL}/blob/main/PRIVACY.md${anchor}`} target="_blank" rel="noreferrer">
        {t('footer.privacy')}
      </a>
      <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
        {t('footer.source')}
      </a>
    </div>
  )
}

// サインアップ前にポリシーを読めるよう、ログイン画面にだけ出す
export function Footer() {
  return (
    <footer>
      <ProjectLinks />
    </footer>
  )
}
