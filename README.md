# No-Spend Tracker (working title)

## Overview
A no-spend challenge tracker that celebrates the days you DON'T spend money.
Positive reinforcement instead of guilt — inspired by the No-Spend Challenge culture.

## Why
- Most budgeting apps make you feel bad about spending
- Flip the model: reward no-spend days instead of punishing expenses
- Practical for my own life in Edinburgh (YMS visa, tracking living costs in GBP)

## Core Features (MVP)
- [ ] Log expenses (multiple entries per day, with a note); days without expenses are no-spend days
- [ ] Calendar view with no-spend days highlighted (GitHub-contribution-style grid)
- [ ] Streak counter (consecutive no-spend days)
- [ ] Celebration messages for streaks
- [ ] Sign in with Google

## Future Ideas
- [ ] AI-generated praise messages
- [ ] Multi-currency support with conversion (JPY / GBP)
- [ ] Monthly challenge mode (e.g. No Spend November)
- [ ] Stats: no-spend rate per month, total saved estimate
- [ ] PWA support (daily logging on mobile)

## Tech Stack
- Frontend: React SPA built with Vite
- API: Hono + TypeScript on Cloudflare Workers (the same Worker serves the SPA via Static Assets)
- Cloudflare D1 (SQLite) + Drizzle ORM
- Auth: Google OAuth (`@hono/oauth-providers`) + self-managed sessions stored in D1

## Design Decisions
- Reward-based UX (praise no-spend days) instead of guilt-based tracking
- No-spend is the default: only expenses are stored. Every day from sign-up to today without an expense counts as a no-spend day
- Tracking starts on the sign-up date, fixed in the user's timezone at sign-up (changing the timezone later does not move it)
- Timezone (IANA name) is a user setting and decides where each day starts and ends. At sign-up it is taken from the browser (`Intl.DateTimeFormat().resolvedOptions().timeZone`) with no onboarding screen; it can be changed later in settings
- Expenses are stored one per entry (to see what the spending was on)
- Amounts are integers in the currency's minor unit (JPY: yen, GBP: pence)
- Currency is a user setting, and each expense also stores its own currency so changing the setting never reinterprets past records. JPY only for now
- Every query on user data must be scoped by the signed-in user's id

## Development
```sh
npm install
cp .dev.vars.example .dev.vars # fill in the Google OAuth client ID / secret
npm run db:generate      # generate migration SQL from src/worker/db/schema.ts
npm run db:migrate:local # apply migrations to the local D1
npm run dev
```

## License
MIT
