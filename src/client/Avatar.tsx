import { useState } from 'react'
import type { Me } from './api'

// Google のプロフィール画像。未取得・読み込み失敗時は名前(なければメール)の頭文字を出す
export function Avatar({ me }: { me: Me }) {
  const [failed, setFailed] = useState(false)
  const initial = (me.name ?? me.email).charAt(0).toUpperCase()

  if (!me.pictureUrl || failed) {
    return (
      <span className="avatar avatar-fallback" aria-hidden="true">
        {initial}
      </span>
    )
  }
  return (
    <img
      className="avatar"
      src={me.pictureUrl}
      alt=""
      // Google の画像はリファラーがあると表示されないことがあるため送らない
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}
