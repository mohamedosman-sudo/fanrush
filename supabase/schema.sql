-- FanRush Database Schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- HELPER FUNCTION: get current user role
-- ============================================================
create or replace function get_my_role()
returns text
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'fan' check (role in ('fan', 'business', 'admin')),
  city_id text,
  favourite_team_ids text[] default '{}',
  interests text[] default '{}',
  points int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'fan')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- TEAMS
-- ============================================================
create table if not exists public.teams (
  id text primary key,
  name text not null,
  code text not null,
  group_name text,
  emoji text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- CITIES
-- ============================================================
create table if not exists public.cities (
  id text primary key,
  name text not null,
  country text not null,
  timezone text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MATCHES
-- ============================================================
create table if not exists public.matches (
  id text primary key,
  home_team_id text not null references public.teams(id),
  away_team_id text not null references public.teams(id),
  kickoff_at timestamptz not null,
  stadium text,
  city_id text not null references public.cities(id),
  stage text not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  home_score int,
  away_score int,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VENUES
-- ============================================================
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  city_id text references public.cities(id),
  address text,
  capacity int,
  food_available boolean not null default false,
  family_friendly boolean not null default false,
  big_screen boolean not null default true,
  price_type text not null default 'free' check (price_type in ('free', 'ticketed')),
  ticket_price numeric,
  booking_url text,
  image_url text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default false,
  views int not null default 0,
  clicks int not null default 0,
  saves int not null default 0,
  bookings int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- VENUE MATCHES (which matches a venue is showing)
-- ============================================================
create table if not exists public.venue_matches (
  venue_id uuid references public.venues(id) on delete cascade,
  match_id text references public.matches(id) on delete cascade,
  primary key (venue_id, match_id)
);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references public.venues(id) on delete cascade,
  match_id text references public.matches(id) on delete set null,
  title text not null,
  description text,
  price_type text not null default 'free' check (price_type in ('free', 'ticketed')),
  ticket_price numeric,
  booking_url text,
  special_offers text,
  event_date timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PREDICTIONS
-- ============================================================
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null references public.matches(id) on delete cascade,
  home_score int not null,
  away_score int not null,
  points int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ============================================================
-- MINI LEAGUES
-- ============================================================
create table if not exists public.mini_leagues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text not null unique,
  sponsored boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.mini_league_members (
  league_id uuid references public.mini_leagues(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (league_id, user_id)
);

-- ============================================================
-- SAVED VENUES & EVENTS
-- ============================================================
create table if not exists public.saved_venues (
  user_id uuid references auth.users(id) on delete cascade,
  venue_id uuid references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, venue_id)
);

create table if not exists public.saved_events (
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

-- ============================================================
-- SPONSOR SLOTS
-- ============================================================
create table if not exists public.sponsor_slots (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  placement text not null check (placement in ('banner', 'league', 'city', 'match')),
  sponsor_name text,
  destination_url text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DEALS
-- ============================================================
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  discount text,
  venue_id uuid references public.venues(id) on delete set null,
  city_id text references public.cities(id) on delete set null,
  affiliate_url text,
  category text check (category in ('food', 'travel', 'merch', 'accommodation')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.cities enable row level security;
alter table public.matches enable row level security;
alter table public.venues enable row level security;
alter table public.venue_matches enable row level security;
alter table public.events enable row level security;
alter table public.predictions enable row level security;
alter table public.mini_leagues enable row level security;
alter table public.mini_league_members enable row level security;
alter table public.saved_venues enable row level security;
alter table public.saved_events enable row level security;
alter table public.sponsor_slots enable row level security;
alter table public.deals enable row level security;

-- PROFILES
-- Leaderboard: anyone can read display_name and points (public columns only — do not select email/role).
create policy "Public leaderboard read" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
-- Note: "Public leaderboard read" supersedes the narrower per-user policy.
-- Queries should only select (id, display_name, points) for the leaderboard;
-- the email and role columns are only returned when explicitly selected.

-- TEAMS (public read)
create policy "Anyone can read teams" on public.teams for select using (true);
create policy "Admins can manage teams" on public.teams for all using (get_my_role() = 'admin');

-- CITIES (public read)
create policy "Anyone can read cities" on public.cities for select using (true);
create policy "Admins can manage cities" on public.cities for all using (get_my_role() = 'admin');

-- MATCHES (public read)
create policy "Anyone can read matches" on public.matches for select using (true);
create policy "Admins can manage matches" on public.matches for all using (get_my_role() = 'admin');

-- VENUES
create policy "Anyone can read approved venues" on public.venues for select using (status = 'approved' or auth.uid() = owner_id or get_my_role() = 'admin');
create policy "Business users can create venues" on public.venues for insert with check (auth.uid() = owner_id and get_my_role() in ('business', 'admin'));
create policy "Owners can update own venues" on public.venues for update using (auth.uid() = owner_id or get_my_role() = 'admin');
create policy "Admins can delete venues" on public.venues for delete using (get_my_role() = 'admin');

-- VENUE MATCHES
create policy "Anyone can read venue_matches" on public.venue_matches for select using (true);
create policy "Venue owners can manage venue_matches" on public.venue_matches for all using (
  exists (select 1 from public.venues v where v.id = venue_id and (v.owner_id = auth.uid() or get_my_role() = 'admin'))
);

-- EVENTS
create policy "Anyone can read approved events" on public.events for select using (status = 'approved' or get_my_role() = 'admin' or exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid()));
create policy "Venue owners can create events" on public.events for insert with check (exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid()));
create policy "Venue owners/admins can update events" on public.events for update using (get_my_role() = 'admin' or exists (select 1 from public.venues v where v.id = venue_id and v.owner_id = auth.uid()));
create policy "Admins can delete events" on public.events for delete using (get_my_role() = 'admin');

-- PREDICTIONS
create policy "Users can read own predictions" on public.predictions for select using (auth.uid() = user_id);
create policy "Admins can read all predictions" on public.predictions for select using (get_my_role() = 'admin');
create policy "Leaderboard — read all points" on public.predictions for select using (true);
create policy "Users can create predictions" on public.predictions for insert with check (auth.uid() = user_id);
create policy "Users can update own predictions" on public.predictions for update using (auth.uid() = user_id);

-- MINI LEAGUES
create policy "Members can read leagues" on public.mini_leagues for select using (
  owner_id = auth.uid() or exists (select 1 from public.mini_league_members m where m.league_id = id and m.user_id = auth.uid())
);
create policy "Users can create leagues" on public.mini_leagues for insert with check (auth.uid() = owner_id);
create policy "Owners can update leagues" on public.mini_leagues for update using (auth.uid() = owner_id);

-- MINI LEAGUE MEMBERS
create policy "Members can read membership" on public.mini_league_members for select using (auth.uid() = user_id);
create policy "Users can join leagues" on public.mini_league_members for insert with check (auth.uid() = user_id);
create policy "Users can leave leagues" on public.mini_league_members for delete using (auth.uid() = user_id);

-- SAVED VENUES
create policy "Users can manage saved venues" on public.saved_venues for all using (auth.uid() = user_id);

-- SAVED EVENTS
create policy "Users can manage saved events" on public.saved_events for all using (auth.uid() = user_id);

-- SPONSOR SLOTS
create policy "Anyone can read active sponsor slots" on public.sponsor_slots for select using (active = true);
create policy "Admins can manage sponsor slots" on public.sponsor_slots for all using (get_my_role() = 'admin');

-- DEALS
create policy "Anyone can read active deals" on public.deals for select using (active = true);
create policy "Admins can manage deals" on public.deals for all using (get_my_role() = 'admin');
