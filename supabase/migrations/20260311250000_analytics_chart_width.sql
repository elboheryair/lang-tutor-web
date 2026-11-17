alter table public.analytics_preferences
  add column if not exists chart_width integer not null default 0
  check (chart_width = 0 or (chart_width >= 480 and chart_width <= 1600));