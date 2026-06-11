# FanRush — Sitemap, User Flows & Role-Based Navigation Blueprint

---

## 1. Route Inventory

### 1.1 Public / Marketing Routes

| Route | Description | Who can access | Unauthorised redirect |
|---|---|---|---|
| `/` | Landing page | Everyone | — |
| `/advertise` | Sponsor/advertise info | Everyone | — |
| `/about` | About FanRush | Everyone | — |
| `/pricing` | Business pricing | Everyone | — |
| `/legal/disclaimer` | Legal disclaimer | Everyone | — |

### 1.2 Auth Routes

| Route | Description | Who can access | Unauthorised redirect |
|---|---|---|---|
| `/login` | Log-in form | Logged-out users | `/home` if already logged in |
| `/signup` | Sign-up form | Logged-out users | `/home` if already logged in |
| `/onboarding` | City + team selection | Logged-in (first time) | `/login` if logged out |
| `/unauthorized` | 403 page | Everyone | — |

### 1.3 Fan App Routes

| Route | Description | Who can access | Unauthorised redirect |
|---|---|---|---|
| `/home` | Personalised feed | Logged-in (any role) | `/` |
| `/matches` | Match listings | Logged-in (any role) | `/` |
| `/matches/[id]` | Match detail | Logged-in (any role) | `/` |
| `/watch-parties` | Venue listings | Logged-in (any role) | `/` |
| `/predictions` | Score predictions | Logged-in (any role) | `/` |
| `/profile` | Fan passport | Logged-in (any role) | `/` |
| `/account` | Account settings | Logged-in (any role) | `/login` |

### 1.4 Business Routes

| Route | Description | Who can access | Unauthorised redirect |
|---|---|---|---|
| `/business` | Business dashboard | `business` or `admin` role | `/unauthorized` |
| `/business/add-venue` | Submit new venue | `business` or `admin` role | `/unauthorized` |
| `/business/add-event` | Submit new event | `business` or `admin` role | `/unauthorized` |
| `/business/venues/[id]/edit` | Edit venue | owner or `admin` | `/unauthorized` |
| `/business/events/[id]/edit` | Edit event | owner or `admin` | `/unauthorized` |

### 1.5 Admin Routes

| Route | Description | Who can access | Unauthorised redirect |
|---|---|---|---|
| `/admin` | Admin dashboard | `admin` role only | `/unauthorized` |
| `/admin/venues` | Venue moderation | `admin` role only | `/unauthorized` |
| `/admin/events` | Event moderation | `admin` role only | `/unauthorized` |
| `/admin/matches` | Match management | `admin` role only | `/unauthorized` |
| `/admin/sponsors` | Sponsor management | `admin` role only | `/unauthorized` |

---

## 2. User Flow Diagrams

### Flow A — Logged-out Fan

```
/ (Landing page)
  ├── Browse matches (public match previews)
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
/login  →  /home  →  Business Dashboard link in header
                          │
                     /business
                       ├── /business/add-venue  → pending approval
                       ├── /business/add-event  → pending approval
                       ├── /business/venues/[id]/edit  (approved / rejected)
                       └── /business/events/[id]/edit  (approved / rejected)

/profile  →  "Go to Business Dashboard" button  → /business
```

### Flow D — Admin User

```
/login  →  /home  →  "Admin Dashboard" button in header
                          │
                     /admin
                       ├── /admin/venues   → approve / reject / delete
                       ├── /admin/events   → approve / reject / delete
                       ├── /admin/matches  → create / edit
                       └── /admin/sponsors → create / manage
                              │
                    "← Back to App" link  →  /home

/home  →  "Admin Dashboard" visible in header (admin never loses their way back)
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

---

## 3. Navigation Rules

### 3.1 Public Landing Header (`/`, `/advertise`, `/about`, `/pricing`)

```
[ ⚡ FanRush ]                    [ Log in ]  [ Sign up ]  [ Advertise ]
```

- Logo → `/`
- Log in → `/login`
- Sign up → `/signup`
- Advertise → `/advertise`

### 3.2 App Header (authenticated users on fan routes)

```
Fan role:
[ ⚡ FanRush ]                              [ 👤 Account ]  [ ← logout ]

Business role:
[ ⚡ FanRush ]          [ Business Dashboard ]  [ 👤 Account ]  [ ← logout ]

Admin role:
[ ⚡ FanRush ]          [ Admin Dashboard ]  [ 👤 Account ]  [ ← logout ]
```

- Logo → `/home`
- Business users: **Business Dashboard** button visible at all times
- Admin users: **Admin Dashboard** button visible at all times
- No user with elevated role should be stranded without a route back to their dashboard

### 3.3 Admin Sidebar / Header

```
Desktop sidebar:
┌────────────────┐
│ ⚡ FanRush     │
│ Admin Panel    │
├────────────────┤
│ ■ Dashboard    │
│ ■ Venues       │
│ ■ Events       │
│ ■ Matches      │
│ ■ Sponsors     │
├────────────────┤
│ ← Back to App  │  → /home
│ [ Log out ]    │
└────────────────┘

Mobile top bar:
← App  |  Admin Panel  |  [Dashboard] [Venues] [Events] [Matches] [Sponsors]
```

- "Back to App" / "← App" always links to `/home`
- Logo / title is NOT a dead zone — clicking it goes to `/home`

### 3.4 Business Sidebar / Header

```
Desktop sidebar:
┌──────────────────┐
│ ⚡ FanRush       │
│ Business Panel   │
├──────────────────┤
│ ■ Dashboard      │
│ ■ Add Venue      │
│ ■ Add Event      │
├──────────────────┤
│ ← Back to App    │  → /home
│ [ Log out ]      │
└──────────────────┘
```

### 3.5 Profile Role Card

```
Admin user:
┌─────────────────────────────────┐
│  [ADMIN]  Mohamed               │
│  ● Admin access enabled         │
│  [ Go to Admin Dashboard → ]    │
└─────────────────────────────────┘

Business user:
┌─────────────────────────────────┐
│  [BUSINESS]  Mohamed            │
│  ● Business account             │
│  [ Go to Business Dashboard → ] │
└─────────────────────────────────┘

Fan:
┌─────────────────────────────────┐
│  Mohamed                        │
│  FanRush Fan                    │
└─────────────────────────────────┘
```

---

## 4. Primary Navigation Per Role

| Role | Primary nav | Dashboard access |
|---|---|---|
| Logged-out | Landing header: Logo, Login, Sign up, Advertise | None |
| Fan | Bottom nav: Home, Matches, Watch Parties, Predictions, Profile | None |
| Business | Bottom nav + **Business Dashboard** in header | `/business` |
| Admin | Bottom nav + **Admin Dashboard** in header | `/admin` |

---

## 5. Text Wireframes

### 5.1 Public Landing Header

```
┌─────────────────────────────────────────────────────┐
│  ⚡FanRush           [Advertise]  [Log in]  [Sign up]│
└─────────────────────────────────────────────────────┘
```

### 5.2 App Header — Normal Fan

```
┌─────────────────────────────────────────────────────┐
│  ⚡FanRush                           [👤] [logout ↪]│
└─────────────────────────────────────────────────────┘
```

### 5.3 App Header — Admin User

```
┌─────────────────────────────────────────────────────┐
│  ⚡FanRush        [Admin Dashboard]  [👤] [logout ↪]│
└─────────────────────────────────────────────────────┘
```

### 5.4 App Header — Business User

```
┌─────────────────────────────────────────────────────┐
│  ⚡FanRush     [Business Dashboard]  [👤] [logout ↪]│
└─────────────────────────────────────────────────────┘
```

### 5.5 Admin Mobile Header

```
┌─────────────────────────────────────────────────────┐
│ ← App  │  Admin Panel  │ [Dash][Venues][Events]...  │
└─────────────────────────────────────────────────────┘
```

### 5.6 Profile Role/Action Card

```
Admin:
┌──────────────────────────────────────────┐
│  ⚡ Mohamed Osman        [ADMIN BADGE]    │
│  ─────────────────────────────────────   │
│  Admin access is active on this account  │
│  [  Go to Admin Dashboard  →  ]          │
└──────────────────────────────────────────┘

Business:
┌──────────────────────────────────────────┐
│  ⚡ Mohamed Osman      [BUSINESS BADGE]  │
│  ─────────────────────────────────────   │
│  Manage your venues and events           │
│  [ Go to Business Dashboard  →  ]        │
└──────────────────────────────────────────┘
```

---

## 6. QA Checklist

- [ ] Logged-out user navigating to `/home` is redirected to `/`
- [ ] Logged-out user navigating to `/admin` is redirected to `/unauthorized`
- [ ] Logged-out user navigating to `/business` is redirected to `/unauthorized`
- [ ] Fan role navigating to `/admin` is redirected to `/unauthorized`
- [ ] Fan role navigating to `/business` is redirected to `/unauthorized`
- [ ] Business role navigating to `/admin` is redirected to `/unauthorized`
- [ ] Admin user on `/home` sees **Admin Dashboard** button in header
- [ ] Admin user on `/admin` sees **← Back to App** link leading to `/home`
- [ ] Admin user on `/profile` sees Admin badge + **Go to Admin Dashboard** button
- [ ] Business user on `/home` sees **Business Dashboard** button in header
- [ ] Business user on `/business` sees **← Back to App** link leading to `/home`
- [ ] Business user on `/profile` sees Business badge + **Go to Business Dashboard** button
- [ ] All five bottom nav items respond on first tap (no double-tap required)
- [ ] Bottom nav highlights correct active item for each route
- [ ] No user role ends up with no visible route back to their primary dashboard
- [ ] `/unauthorized` page has a clear CTA back to a safe route (`/home` or `/`)
