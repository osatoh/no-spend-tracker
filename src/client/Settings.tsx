import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_CURRENCIES } from '../shared/currency'
import type { ApiErrorCode } from '../shared/apiErrors'
import { ApiError, deleteAccount, updateSettings, type Me } from './api'
import { ProjectLinks } from './Footer'
import { useLocale } from './i18n/useLocale'
import { LanguageSwitcher } from './LanguageSwitcher'

type Props = {
  me: Me
  // 設定を保存したら、ホームのカレンダーなどにも反映させるため親の状態を更新する
  onMeChange: (me: Me) => void
}

function errorCode(err: unknown): ApiErrorCode {
  return err instanceof ApiError ? (err.codes[0] ?? 'request_failed') : 'request_failed'
}

export function Settings({ me, onMeChange }: Props) {
  const { t } = useTranslation()
  const locale = useLocale()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | ApiErrorCode>('idle')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<ApiErrorCode | null>(null)

  // 一覧に今の値が含まれない環境でも選択状態を保てるようにする
  const timezones = [...new Set([me.timezone, ...Intl.supportedValuesOf('timeZone')])].sort()
  const currencyNames = new Intl.DisplayNames([locale], { type: 'currency' })

  async function save(input: { timezone?: string; currency?: string }) {
    setSaveState('saving')
    try {
      onMeChange(await updateSettings(input))
      setSaveState('saved')
    } catch (err) {
      setSaveState(errorCode(err))
    }
  }

  async function handleDelete() {
    if (!window.confirm(t('settings.confirmDelete'))) return
    setDeleting(true)
    try {
      await deleteAccount()
      // セッションも消えているので、未ログインの画面から読み込み直す
      window.location.assign('/')
    } catch (err) {
      setDeleteError(errorCode(err))
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
        <h3>{t('settings.region')}</h3>
        <label className="settings-field">
          {t('settings.timezone')}
          <select
            value={me.timezone}
            disabled={saveState === 'saving'}
            onChange={(e) => save({ timezone: e.target.value })}
          >
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
          <small>{t('settings.timezoneHelp', { date: me.trackingStartDate })}</small>
        </label>
        <label className="settings-field">
          {t('settings.currency')}
          <select
            value={me.currency}
            disabled={saveState === 'saving'}
            onChange={(e) => save({ currency: e.target.value })}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency} ({currencyNames.of(currency)})
              </option>
            ))}
          </select>
          <small>{t('settings.currencyHelp')}</small>
        </label>
        <p className="save-status" role="status">
          {saveState === 'saved' && t('settings.saved')}
          {saveState !== 'idle' && saveState !== 'saving' && saveState !== 'saved' && (
            <span className="errors">{t(`errors.${saveState}`)}</span>
          )}
        </p>
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
        {deleteError && (
          <p className="errors" role="alert">
            {t(`errors.${deleteError}`)}
          </p>
        )}
        <button type="button" className="danger" disabled={deleting} onClick={handleDelete}>
          {t('settings.deleteAccount')}
        </button>
      </div>
    </section>
  )
}
