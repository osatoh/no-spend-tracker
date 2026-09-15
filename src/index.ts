import { Hono } from 'hono'
import { csrf } from 'hono/csrf'
import { html } from 'hono/html'
import { authRoutes } from './auth/routes'
import { loadSessionUser } from './auth/session'
import type { AppEnv } from './types'

const app = new Hono<AppEnv>()

// 更新系リクエストの Origin を検証する
app.use(csrf())
app.use(loadSessionUser)

app.route('/auth', authRoutes)

app.get('/', (c) => {
  const user = c.get('user')
  if (!user) {
    return c.html(html`<!doctype html>
      <title>No-Spend Tracker</title>
      <a id="login" href="/auth/google">Google でログイン</a>
      <script>
        // サインアップ時のタイムゾーンとしてブラウザの値を渡す
        document.getElementById('login').addEventListener('click', (e) => {
          e.preventDefault()
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
          location.href = '/auth/google?tz=' + encodeURIComponent(tz)
        })
      </script>`)
  }
  return c.html(html`<!doctype html>
    <title>No-Spend Tracker</title>
    <p>${user.name ?? user.email} としてログイン中</p>
    <p>タイムゾーン: ${user.timezone} / 記録開始日: ${user.trackingStartDate}</p>
    <form method="post" action="/auth/logout"><button>ログアウト</button></form>`)
})

export default app
