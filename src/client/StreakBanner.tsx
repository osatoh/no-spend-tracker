import { useTranslation } from 'react-i18next'

type MessageKey = 'zero' | 'start' | 'going' | 'week' | 'habit'

function messageKey(streak: number): MessageKey {
  if (streak === 0) return 'zero'
  if (streak < 3) return 'start'
  if (streak < 7) return 'going'
  if (streak < 30) return 'week'
  return 'habit'
}

export function StreakBanner({ streak }: { streak: number }) {
  const { t } = useTranslation()

  return (
    <section className="streak" aria-live="polite">
      <p className="streak-count">
        <span>{streak}</span>
        {t('streak.days', { count: streak })}
      </p>
      <p className="streak-message">{t(`streak.messages.${messageKey(streak)}`)}</p>
    </section>
  )
}
