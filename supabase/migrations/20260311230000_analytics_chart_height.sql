alter table public.analytics_preferences
  add column if not exists chart_height integer not null default 260
  check (chart_height >= 160 and chart_height <= 480);