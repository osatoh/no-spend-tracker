import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ApiError, deleteAccount, type Me } from './api'
import { ProjectLinks } from './Footer'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Settings({ me }: { me: Me }) {
  const { t } = useTranslation()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!window.confirm(t('settings.confirmDelete'))) return
    setDeleting(true)
    try {
      await deleteAccount()
      // セッションも消えているので、未ログインの画面から読み込み直す
      window.location.assign('/')
    } catch (err) {
      setError(t(`errors.${err instanceof ApiError ? err.codes[0] : 'request_failed'}`))
      setDeleting(false)
    }
  }

  return (
    <section className="settings">
      <h2>{t('settings.title')}</h2>

      <div className="settings-group">
        <h3>{t('settings.language')}</h3>
        <LanguageSwitcher />
      </div>

      <div className="settings-group">
        <h3>{t('settings.account')}</h3>
        <p>{t('settings.signedInAs', { email: me.email })}</p>
        <form method="post" action="/auth/logout">
          <button>{t('auth.signOut')}</button>
        </form>
      </div>

      <div className="settings-group">
        <h3>{t('settings.about')}</h3>
        <ProjectLinks />
      </div>

      <div className="settings-group danger-zone">
        <h3>{t('settings.deleteAccount')}</h3>
        <p>{t('settings.deleteDescription')}</p>
        {error && (
          <p className="errors" role="alert">
            {error}
          </p>
        )}
        <button type="button" className="danger" disabled={deleting} onClick={handleDelete}>
          {t('settings.deleteAccount')}
        </button>
      </div>
    </section>
  )
}
