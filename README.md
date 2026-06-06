# FanRush ⚡

**The ultimate fan platform for World Cup 2026.**

FanRush helps fans find watch parties, predict match scores, create mini prediction leagues, and save their favourite venues — all in one mobile-first app.

> FanRush is an independent fan platform and is not affiliated with FIFA or any official tournament organiser.

---

## Quick Start (Demo Mode)

No database required. The app works with mock data out of the box.

```bash
git clone <repo-url>
cd fanrush
npm install
npm run dev
# Open http://localhost:3000
```

The app runs in **demo mode** when Supabase env vars are not set. All data is served from `lib/mock-data.ts`.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional* | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional* | Supabase anonymous key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional* | Service role key — server-only, never expose to client |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployment URL |

*Without these, the app runs in demo mode with mock data.

---

## Supabase Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon key** from Settings → API
3. Copy the **service_role key** (keep this secret)
4. Add all three to `.env.local`

### 2. Run the schema

In the Supabase SQL editor, paste and run the contents of:

```
supabase/schema.sql
```

This creates all tables, enables Row Level Security, and sets up the auto-profile trigger.

### 3. Seed demo data

After the schema, run:

```
supabase/seed.sql
```

This inserts teams, cities, matches, and sponsor slots.

### 4. Set up authentication

In Supabase dashboard:
- Authentication → Providers → Email: enable "Confirm email" (or disable for local dev)
- Set your Site URL to `http://localhost:3000` (or your production URL)

---

## Project Structure

```
fanrush/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── onboarding/         # Fan onboarding (team/city/interests)
│   ├── home/               # Fan dashboard
│   ├── matches/            # Fixtures + match detail
│   ├── watch-parties/      # Venue/watch party finder
│   ├── predictions/        # Prediction game + leaderboard
│   ├── profile/            # Fan Passport
│   ├── login/              # Auth — sign in
│   ├── signup/             # Auth — sign up
│   ├── account/            # Account settings
│   ├── business/           # Business portal
│   ├── admin/              # Admin dashboard
│   ├── pricing/            # Pricing page
│   ├── about/              # About page
│   └── legal/disclaimer/   # Disclaimer
├── components/             # 20+ reusable components
├── lib/
│   ├── mock-data.ts        # Demo data (always available)
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Utilities (scoring, formatting)
│   ├── storage.ts          # localStorage helpers
│   ├── supabase/           # Supabase clients
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── admin.ts        # Service role client (server-only)
│   └── data/               # Data access layer
│       ├── teams.ts        # Teams (Supabase or mock)
│       ├── cities.ts       # Cities
│       ├── matches.ts      # Matches
│       ├── venues.ts       # Venues
│       ├── events.ts       # Events
│       └── predictions.ts  # Predictions
├── supabase/
│   ├── schema.sql          # Database schema + RLS
│   └── seed.sql            # Demo seed data
├── middleware.ts            # Auth + role-based route guards
└── .env.example            # Environment variable template
```

---

## Available Routes

| Route | Description | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/onboarding` | Fan onboarding | No |
| `/home` | Fan dashboard | No (soft) |
| `/matches` | Fixtures list | No |
| `/matches/[id]` | Match detail | No |
| `/watch-parties` | Venue finder | No |
| `/predictions` | Prediction game | No (soft) |
| `/profile` | Fan Passport | Fan |
| `/login` | Sign in | No |
| `/signup` | Sign up | No |
| `/account` | Account settings | Any |
| `/business` | Business portal | Business/Admin |
| `/business/add-venue` | Add venue form | Business/Admin |
| `/business/add-event` | Add event form | Business/Admin |
| `/admin` | Admin dashboard | Admin |
| `/admin/venues` | Manage venues | Admin |
| `/admin/events` | Manage events | Admin |
| `/admin/matches` | Update scores | Admin |
| `/admin/sponsors` | Manage sponsors | Admin |
| `/admin/cities` | Manage cities | Admin |
| `/pricing` | Business pricing | No |
| `/about` | About FanRush | No |
| `/legal/disclaimer` | Disclaimer | No |

---

## Running Tests

```bash
npm test
```

Tests cover prediction scoring logic, utility functions, and input validation.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

```bash
npm run build  # Test production build locally
```

---

## Production Readiness

| Feature | Status |
|---|---|
| UI & Routes | ✅ Complete |
| Mock data / Demo mode | ✅ Complete |
| Supabase schema | ✅ Ready to deploy |
| RLS security policies | ✅ Written |
| Auth (email/password) | ✅ Wired (needs Supabase) |
| Route protection | ✅ Middleware ready |
| Prediction persistence | ✅ localStorage + Supabase |
| Venue save persistence | ✅ localStorage + Supabase |
| Business portal | ✅ UI complete, needs auth |
| Admin dashboard | ✅ UI complete, needs auth |
| Live scores API | ⏳ Service layer ready, API not connected |
| Image uploads | ⏳ URL field ready, storage not wired |
| Email notifications | ⏳ Not started |
| Payments (Stripe) | ⏳ Pricing page ready, Stripe not wired |
| Social auth (Google/Apple) | ⏳ Placeholder only |

---

## Legal

FanRush is an independent fan platform. It is **not affiliated with FIFA**, the 2026 World Cup organising committee, or any official tournament body.

See [/legal/disclaimer](/legal/disclaimer) for full terms.
