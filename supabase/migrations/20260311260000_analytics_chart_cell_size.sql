alter table public.analytics_preferences
  add column if not exists chart_cell_size integer not null default 26
  check (chart_cell_size >= 16 and chart_cell_size <= 48);

update public.analytics_preferences
set chart_cell_size = greatest(
  16,
  least(48, round(chart_height::numeric / 10))
)
where chart_height is not null;