alter table public.analytics_preferences
  add column if not exists graph_order text[] not null default array[
    'lines',
    'words',
    'practice_time',
    'completed_sessions'
  ]::text[],
  add column if not exists graph_visible jsonb not null default '{
    "lines": true,
    "words": true,
    "practice_time": true,
    "completed_sessions": true
  }'::jsonb;

alter table public.analytics_preferences
  drop constraint if exists analytics_preferences_graph_order_check;

alter table public.analytics_preferences
  add constraint analytics_preferences_graph_order_check check (
    coalesce(array_length(graph_order, 1), 0) = 4
    and graph_order <@ array['lines', 'words', 'practice_time', 'completed_sessions']::text[]
  );