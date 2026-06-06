-- FanRush Seed Data
-- Idempotent — safe to run multiple times

-- ============================================================
-- TEAMS
-- ============================================================
insert into public.teams (id, name, code, group_name, emoji) values
  ('eng', 'England',      'ENG', 'A', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'),
  ('bra', 'Brazil',       'BRA', 'A', '🇧🇷'),
  ('fra', 'France',       'FRA', 'B', '🇫🇷'),
  ('arg', 'Argentina',    'ARG', 'B', '🇦🇷'),
  ('esp', 'Spain',        'ESP', 'C', '🇪🇸'),
  ('ger', 'Germany',      'GER', 'C', '🇩🇪'),
  ('por', 'Portugal',     'POR', 'D', '🇵🇹'),
  ('ned', 'Netherlands',  'NED', 'D', '🇳🇱'),
  ('usa', 'USA',          'USA', 'E', '🇺🇸'),
  ('mex', 'Mexico',       'MEX', 'E', '🇲🇽'),
  ('can', 'Canada',       'CAN', 'F', '🇨🇦'),
  ('jpn', 'Japan',        'JPN', 'F', '🇯🇵'),
  ('mar', 'Morocco',      'MAR', 'G', '🇲🇦'),
  ('sen', 'Senegal',      'SEN', 'G', '🇸🇳'),
  ('aus', 'Australia',    'AUS', 'H', '🇦🇺'),
  ('ksa', 'Saudi Arabia', 'KSA', 'H', '🇸🇦')
on conflict (id) do nothing;

-- ============================================================
-- CITIES
-- ============================================================
insert into public.cities (id, name, country, timezone) values
  ('nyc', 'New York / New Jersey', 'USA',    'America/New_York'),
  ('lax', 'Los Angeles',           'USA',    'America/Los_Angeles'),
  ('dal', 'Dallas',                'USA',    'America/Chicago'),
  ('mia', 'Miami',                 'USA',    'America/New_York'),
  ('atl', 'Atlanta',               'USA',    'America/New_York'),
  ('sea', 'Seattle',               'USA',    'America/Los_Angeles'),
  ('tor', 'Toronto',               'Canada', 'America/Toronto'),
  ('gdl', 'Guadalajara',           'Mexico', 'America/Monterrey')
on conflict (id) do nothing;

-- ============================================================
-- MATCHES
-- ============================================================
insert into public.matches (id, home_team_id, away_team_id, kickoff_at, stadium, city_id, stage, status) values
  ('m01', 'usa', 'mex', '2026-06-12T18:00:00Z', 'MetLife Stadium',       'nyc', 'Group Stage',   'scheduled'),
  ('m02', 'eng', 'bra', '2026-06-13T21:00:00Z', 'SoFi Stadium',          'lax', 'Group Stage',   'scheduled'),
  ('m03', 'fra', 'arg', '2026-06-14T18:00:00Z', 'AT&T Stadium',          'dal', 'Group Stage',   'scheduled'),
  ('m04', 'esp', 'ger', '2026-06-15T21:00:00Z', 'Hard Rock Stadium',     'mia', 'Group Stage',   'scheduled'),
  ('m05', 'por', 'ned', '2026-06-16T18:00:00Z', 'Mercedes-Benz Stadium', 'atl', 'Group Stage',   'scheduled'),
  ('m06', 'can', 'jpn', '2026-06-17T00:00:00Z', 'BMO Field',             'tor', 'Group Stage',   'scheduled'),
  ('m07', 'mar', 'sen', '2026-06-18T18:00:00Z', 'Estadio Akron',         'gdl', 'Group Stage',   'scheduled'),
  ('m08', 'aus', 'ksa', '2026-06-19T21:00:00Z', 'Lumen Field',           'sea', 'Group Stage',   'scheduled'),
  ('m09', 'bra', 'arg', '2026-06-26T21:00:00Z', 'MetLife Stadium',       'nyc', 'Group Stage',   'scheduled'),
  ('m10', 'esp', 'fra', '2026-06-27T18:00:00Z', 'SoFi Stadium',          'lax', 'Group Stage',   'scheduled'),
  ('m11', 'eng', 'ger', '2026-07-04T21:00:00Z', 'AT&T Stadium',          'dal', 'Round of 16',  'scheduled'),
  ('m12', 'por', 'usa', '2026-07-05T18:00:00Z', 'Hard Rock Stadium',     'mia', 'Round of 16',  'scheduled')
on conflict (id) do nothing;

-- ============================================================
-- SPONSOR SLOTS
-- ============================================================
insert into public.sponsor_slots (title, placement, sponsor_name, active) values
  ('Coca-Cola Fan Zone Banner',          'banner', 'Coca-Cola', true),
  ('Adidas City Spotlight — New York',   'city',   'Adidas',    true)
on conflict do nothing;
