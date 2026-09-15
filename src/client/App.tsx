import { useEffect, useState } from 'react'

type Me = {
  name: string | null
  email: string
  currency: string
  timezone: string
  trackingStartDate: string
}

export function App() {
  // undefined: 読み込み中 / null: 未ログイン
  const [me, setMe] = useState<Me | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json() as Promise<{ user: Me | null }>)
      .then((body) => setMe(body.user))
  }, [])

  if (me === undefined) return null

  if (me === null) {
    // サインアップ時のタイムゾーンとしてブラウザの値を渡す
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    return <a href={`/auth/google?tz=${encodeURIComponent(tz)}`}>Google でログイン</a>
  }

  return (
    <>
      <p>{me.name ?? me.email} としてログイン中</p>
      <p>
        タイムゾーン: {me.timezone} / 記録開始日: {me.trackingStartDate}
      </p>
      <form method="post" action="/auth/logout">
        <button>ログアウト</button>
      </form>
    </>
  )
}
