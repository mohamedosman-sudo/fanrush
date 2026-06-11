# FanRush — Sitemap, User Flows & Role-Based Navigation Blueprint

_Last updated: 2026-06-11_

---

## 0. Core UX Rule — Four Navigation Modes

| Mode | When | Header | Bottom nav |
|---|---|---|---|
| **Public website** | Logged-out on any route | Public header (logo → /) | None |
| **Fan app** | Logged-in on fan routes | App header (logo → /home) + AccountMenu | Yes |
| **Admin console** | Admin on /admin/* | Admin sidebar/top bar | None |
| **Business portal** | Business on /business/* | Business sidebar/top bar | None |

> No user should feel trapped. Every mode has a clear exit back to a safe route.

---

## 1. Route Inventory

### 1.1 Public / Marketing Routes

| Route | Description | Who can access | Unauth redirect |
|---|---|---|---|
| `/` | Landing page | Everyone | — |
| `/advertise` | Sponsor / advertise info | Everyone | — |
| `/about` | About FanRush | Everyone | — |
| `/pricing` | Business pricing | Everyone | — |
| `/legal/disclaimer` | Legal disclaimer | Everyone | — |

### 1.2 Auth Routes

| Route | Description | Who can access | Unauth redirect |
|---|---|---|---|
| `/login` | Log-in form | Logged-out users | `/home` if already logged in |
| `/signup` | Sign-up form | Logged-out users | `/home` if already logged in |
| `/onboarding` | City + team selection | Logged-in (first time) | `/login` if logged out |
| `/unauthorized` | 403 page | Everyone | — |

### 1.3 Fan App Routes

| Route | Description | Who can access | Unauth redirect |
|---|---|---|---|
| `/home` | Personalised feed | Logged-in (any role) | `/` |
| `/matches` | Match listings | Everyone (preview for logged-out) | — |
| `/matches/[id]` | Match detail | Everyone (preview for logged-out) | — |
| `/watch-parties` | Venue listings | Everyone (preview for logged-out) | — |
| `/predictions` | Score predictions | Everyone (preview; save requires login) | — |
| `/profile` | Fan passport | Logged-in (any role) | `/login` |
| `/account` | Account settings | Logged-in (any role) | `/login` |

### 1.4 Business Routes

| Route | Description | Who can access | Unauth redirect |
|---|---|---|---|
| `/business` | Business dashboard | `business` or `admin` role | `/unauthorized` |
| `/business/add-venue` | Submit new venue | `business` or `admin` role | `/unauthorized` |
| `/business/add-event` | Submit new event | `business` or `admin` role | `/unauthorized` |
| `/business/venues/[id]/edit` | Edit venue | owner or `admin` | `/unauthorized` |
| `/business/events/[id]/edit` | Edit event | owner or `admin` | `/unauthorized` |

### 1.5 Admin Routes

| Route | Description | Who can access | Unauth redirect |
|---|---|---|---|
| `/admin` | Admin dashboard | `admin` role only | `/unauthorized` |
| `/admin/venues` | Venue moderation | `admin` role only | `/unauthorized` |
| `/admin/events` | Event moderation | `admin` role only | `/unauthorized` |
| `/admin/matches` | Match management | `admin` role only | `/unauthorized` |
| `/admin/sponsors` | Sponsor management | `admin` role only | `/unauthorized` |

---

## 2. Navigation Mode Details

### Mode 1 — Public Website Mode

**When**: Logged-out user is on any route (including preview of /matches, /watch-parties, /predictions).

**Header**: Public header
- Logo → `/`
- Nav links: Matches, Watch Parties, Predictions, Business/Pricing, Advertise
- Right: `Log in` + `Create Account`

**Bottom nav**: None — never rendered for logged-out users.

**Logged-out preview pages** (`/matches`, `/watch-parties`, `/predictions`, `/matches/[id]`):
- Show limited/preview content
- Show Log in CTA where gated
- Logo returns to `/`
- No bottom nav
- No fan app chrome

### Mode 2 — Logged-in Fan App Mode

**When**: Logged-in user on fan app routes (`/home`, `/matches`, `/watch-parties`, `/predictions`, `/profile`, `/account`).

**Header**: App header
- Logo → `/home`
- Right: `AccountMenu` (role-aware dropdown)

**Bottom nav**: Fixed, always visible on fan app routes.
- Home → `/home`
- Matches → `/matches`
- Watch Parties → `/watch-parties`
- Predictions → `/predictions`
- Profile → `/profile`

### Mode 3 — Admin Console Mode

**When**: Admin user on `/admin/*` routes.

**Desktop**: Sidebar with:
- Logo (links to `/home`)
- Admin links: Dashboard, Venues, Events, Matches, Sponsors
- "Back to App" → `/home`

**Mobile**: Top bar with scrollable tabs + "← App" → `/home`

**Bottom nav**: None.

**Admin user always has access to**:
- `/home` (Back to App)
- `/admin` (Admin Dashboard)
- `/profile` (via AccountMenu on app header)
- Logout

### Mode 4 — Business Portal Mode

**When**: Business user on `/business/*` routes.

**Desktop**: Sidebar with:
- Logo (links to `/home`)
- Business links: Dashboard, Add Venue, Add Event
- "Back to App" → `/home`

**Mobile**: Top bar with tabs + "← App" → `/home`

**Bottom nav**: None.

**Business user always has access to**:
- `/home` (Back to App)
- `/business` (Business Dashboard)
- `/business/add-venue`
- `/business/add-event`
- `/profile` (via AccountMenu on app header)
- Logout

---

## 3. User Flow Diagrams

### Flow A — Logged-out Fan

```
/ (Landing page)
  ├── Preview matches (public)
  ├── /advertise  → email enquiry
  ├── /about
  │
  ├── /login  ──────────────────────────────────────┐
  │     └── success → /home (or /onboarding)        │
  │                                                  │
  └── /signup                                        │
        └── success → /onboarding                   │
              └── complete → /home ─────────────────┘
```

### Flow B — Logged-in Fan

```
/home
  ├── /matches
  │     └── /matches/[id]  → predict score
  │
  ├── /predictions  → make / review predictions
  │
  ├── /watch-parties  → browse & save venues
  │
  └── /profile
        ├── Overview / Predictions / Saved / Badges tabs
        └── (no dashboard shortcuts — regular fan)
```

### Flow C — Business User

```
/login  →  /home
           │
           ├── AccountMenu → Business Dashboard → /business
           │                                         │
           │                          ┌──────────────┤
           │                    /business/add-venue  │
           │                    /business/add-event  │
           │                    venues/[id]/edit      │
           │                    events/[id]/edit      │
           │                          │               │
           └── "Back to App" ←────────┘               │
                   │                                   │
              /home ←──────────────────────────────────┘

/profile  →  Business badge + "Go to Business Dashboard" button
```

### Flow D — Admin User

```
/login  →  /home
           │
           ├── AccountMenu → Admin Dashboard → /admin
           │                                    │
           │            /admin/venues            │
           │            /admin/events            │
           │            /admin/matches           │
           │            /admin/sponsors          │
           │                 │                   │
           └── "Back to App" ←──────────────────┘
                   │
              /home

/home  →  Admin Dashboard pill in header (AccountMenu)
/profile  →  Admin badge + "Go to Admin Dashboard" button
```

### Flow E — Sponsor / Business Advertiser

```
/advertise
  └── Email enquiry to FanRush team
        └── Admin logs into /admin/sponsors
              └── Creates sponsor slot (placement, dates, target URL)
                    └── Slot goes live in configured placement(s)
                          └── Fans see SponsorBanner on relevant pages
                                └── Click tracked → admin views in /admin/sponsors
```

### Flow F — Business Dashboard Operator

```
/business  (dashboard)
  ├── Status summary: X venues (Y live, Z pending, W rejected)
  ├── Pending listings: "Under review — no action needed"
  ├── Approved listings: Analytics, Boost CTA
  ├── Rejected listings: Rejection reason + "Edit & resubmit →" CTA
  ├── + Add Venue → /business/add-venue → pending approval
  └── + Add Event → /business/add-event → pending approval
```

---

## 4. Role-Aware Account Menu (AccountMenu component)

Renders as an avatar button + dropdown. Replaces the old separate avatar/logout pair.

**For all logged-in users:**
- Profile → `/profile`
- Account Settings → `/account`
- Update Preferences → `/onboarding`
- Public Landing Page → `/`
- Log Out

**Admin role additions (shown at top):**
- Admin Dashboard → `/admin`

**Business role additions (shown at top):**
- Business Dashboard → `/business`
- Add Venue → `/business/add-venue`
- Add Event → `/business/add-event`

**Behaviour:**
- Opens/closes on click
- Closes on outside click
- Closes on Escape key
- `touch-manipulation` on all items
- Does not overlay the bottom nav

---

## 5. Text Wireframes

### 5.1 Public Header (logged-out)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚡FanRush    Matches  Watch Parties  Predictions  Advertise    │
│                                             [Log in] [Sign up]  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 App Header — Fan

```
┌──────────────────────────────────────────────────────┐
│  ⚡FanRush                            [M ▾]           │
└──────────────────────────────────────────────────────┘
```
_(M = avatar initial, ▾ = chevron — opens AccountMenu)_

### 5.3 App Header — Admin

```
┌──────────────────────────────────────────────────────┐
│  ⚡FanRush                            [M ▾]           │
└──────────────────────────────────────────────────────┘
AccountMenu shows:
  ┌─────────────────────┐
  │ ADMIN               │
  │ ■ Admin Dashboard   │
  │─────────────────────│
  │ ■ Profile           │
  │ ■ Account Settings  │
  │ ■ Update Prefs      │
  │ ■ Public Site       │
  │─────────────────────│
  │ ↪ Log Out           │
  └─────────────────────┘
```

### 5.4 App Header — Business

```
AccountMenu shows:
  ┌─────────────────────┐
  │ BUSINESS            │
  │ ■ Business Dashboard│
  │ ■ Add Venue         │
  │ ■ Add Event         │
  │─────────────────────│
  │ ■ Profile           │
  │ ...                 │
  └─────────────────────┘
```

### 5.5 Admin Mobile Header

```
┌─────────────────────────────────────────────────────────┐
│ ← App  │  Admin Panel  │ [Dash][Venues][Events][Matches] │
└─────────────────────────────────────────────────────────┘
```

### 5.6 Profile Role/Action Card

```
Admin:
┌──────────────────────────────────────────┐
│  ⚡ Mohamed Osman        [ADMIN]          │
│  Admin access is active on this account  │
│  [ Go to Admin Dashboard  →  ]           │
└──────────────────────────────────────────┘

Business:
┌──────────────────────────────────────────┐
│  ⚡ Mohamed Osman        [BUSINESS]       │
│  Manage your venues, events & submissions│
│  [ Go to Business Dashboard  →  ]        │
└──────────────────────────────────────────┘
```

### 5.7 Business Dashboard Status Cards

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   3 Venues   │  │  2 Events    │  │  84 Total    │
│ 2 live       │  │ 1 live       │  │  Engagement  │
│ 1 pending    │  │ 1 rejected   │  │              │
└──────────────┘  └──────────────┘  └──────────────┘

Rejected listing card:
┌────────────────────────────────────────────────────┐
│  The Crown & Pitch  [✕ Rejected]                   │
│  Chicago · 123 Main St                             │
│  ╔──────────────────────────────────────────────╗  │
│  ║ Rejection reason                             ║  │
│  ║ Venue does not meet minimum capacity         ║  │
│  ╚──────────────────────────────────────────────╝  │
│  [ Edit & resubmit → ]                             │
└────────────────────────────────────────────────────┘
```

---

## 6. Primary Navigation Per Role

| Role | Primary nav | Dashboard access |
|---|---|---|
| Logged-out | Public header: Logo(→/), Login, Sign up, Nav links | None |
| Fan | Bottom nav + App header | AccountMenu → profile/account |
| Business | Bottom nav + App header + AccountMenu | `/business` |
| Admin | Bottom nav + App header + AccountMenu | `/admin` |

---

## 7. QA Checklist

### Navigation modes
- [ ] Logged-out user on `/` sees public header, no bottom nav
- [ ] Logged-out user on `/watch-parties` sees public header, no bottom nav
- [ ] Logged-out user on `/matches` sees no bottom nav
- [ ] Logged-out user on `/predictions` sees no bottom nav, cannot save prediction
- [ ] Logo on any logged-out page links to `/`
- [ ] Logged-in user on `/home` sees bottom nav
- [ ] Logged-in user on `/watch-parties` sees bottom nav
- [ ] Bottom nav does not appear on `/admin/*`
- [ ] Bottom nav does not appear on `/business/*`

### Role-based navigation
- [ ] Admin user on `/home` can reach `/admin` via AccountMenu
- [ ] Admin user on `/admin` can return to `/home` via "Back to App"
- [ ] Admin user on `/profile` sees Admin badge + Go to Admin Dashboard button
- [ ] Business user on `/home` can reach `/business` via AccountMenu
- [ ] Business user on `/business` can return to `/home` via "Back to App"
- [ ] Business user on `/profile` sees Business badge + Go to Business Dashboard button
- [ ] Fan user sees no dashboard shortcut in AccountMenu

### AccountMenu
- [ ] Opens on first tap/click
- [ ] Closes on outside click
- [ ] Closes on Escape key
- [ ] Does not block bottom nav

### Business dashboard
- [ ] Shows status summary (live/pending/rejected counts)
- [ ] Rejected listings show rejection reason if available
- [ ] Rejected listings show "Edit & resubmit" CTA
- [ ] Pending listings show "Under review" message (no action)
- [ ] Empty venues state has Add Venue CTA
- [ ] Empty events state has Add Event CTA
- [ ] Action required alert shown when any listing is rejected

### Auth / access
- [ ] Logged-out user cannot access `/admin` (redirected to `/unauthorized` or `/login`)
- [ ] Logged-out user cannot access `/business` (redirected to `/unauthorized` or `/login`)
- [ ] Fan role cannot access `/admin`
- [ ] Business role cannot access `/admin`
- [ ] All bottom nav items respond on first tap
- [ ] No user role gets trapped without a clear exit
