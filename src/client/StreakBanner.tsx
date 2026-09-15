function celebrationMessage(streak: number): string {
  if (streak === 0) return '明日からまた一緒に積み上げよう'
  if (streak < 3) return 'いいスタート！'
  if (streak < 7) return 'その調子！'
  if (streak < 30) return '1週間以上続いてる、すごい！'
  return '習慣になってきたね、最高！'
}

export function StreakBanner({ streak }: { streak: number }) {
  return (
    <section className="streak" aria-live="polite">
      <p className="streak-count">
        <span>{streak}</span>日連続 no-spend
      </p>
      <p className="streak-message">{celebrationMessage(streak)}</p>
    </section>
  )
}
