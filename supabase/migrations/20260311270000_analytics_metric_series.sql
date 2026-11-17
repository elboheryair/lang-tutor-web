alter table public.analytics_preferences
  add column if not exists lines_metric_series text not null default 'both'
    check (lines_metric_series in ('both', 'read', 'recorded')),
  add column if not exists words_metric_series text not null default 'both'
    check (words_metric_series in ('both', 'read', 'recorded'));