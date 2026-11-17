create table public.user_reading_daily_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null,
  activity_date date not null,
  lines_read integer not null default 0 check (lines_read >= 0),
  lines_recorded integer not null default 0 check (lines_recorded >= 0),
  words_read integer not null default 0 check (words_read >= 0),
  words_recorded integer not null default 0 check (words_recorded >= 0),
  practice_seconds integer not null default 0 check (practice_seconds >= 0),
  completed_sessions integer not null default 0 check (completed_sessions >= 0),
  unique (user_id, language, activity_date)
);

create index user_reading_daily_stats_user_lang_date_idx
  on public.user_reading_daily_stats (user_id, language, activity_date desc);

grant select, insert, update on table public.user_reading_daily_stats to authenticated;

alter table public.user_reading_daily_stats enable row level security;

create policy "Users can read own reading stats"
  on public.user_reading_daily_stats
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own reading stats"
  on public.user_reading_daily_stats
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reading stats"
  on public.user_reading_daily_stats
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.increment_user_reading_daily_stats(
  p_language text,
  p_activity_date date,
  p_lines_read integer default 0,
  p_lines_recorded integer default 0,
  p_words_read integer default 0,
  p_words_recorded integer default 0,
  p_practice_seconds integer default 0,
  p_completed_sessions integer default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_reading_daily_stats (
    user_id,
    language,
    activity_date,
    lines_read,
    lines_recorded,
    words_read,
    words_recorded,
    practice_seconds,
    completed_sessions
  )
  values (
    v_user_id,
    p_language,
    p_activity_date,
    greatest(0, coalesce(p_lines_read, 0)),
    greatest(0, coalesce(p_lines_recorded, 0)),
    greatest(0, coalesce(p_words_read, 0)),
    greatest(0, coalesce(p_words_recorded, 0)),
    greatest(0, coalesce(p_practice_seconds, 0)),
    greatest(0, coalesce(p_completed_sessions, 0))
  )
  on conflict (user_id, language, activity_date) do update
  set
    lines_read = user_reading_daily_stats.lines_read + greatest(0, coalesce(p_lines_read, 0)),
    lines_recorded = user_reading_daily_stats.lines_recorded + greatest(0, coalesce(p_lines_recorded, 0)),
    words_read = user_reading_daily_stats.words_read + greatest(0, coalesce(p_words_read, 0)),
    words_recorded = user_reading_daily_stats.words_recorded + greatest(0, coalesce(p_words_recorded, 0)),
    practice_seconds = user_reading_daily_stats.practice_seconds + greatest(0, coalesce(p_practice_seconds, 0)),
    completed_sessions = user_reading_daily_stats.completed_sessions + greatest(0, coalesce(p_completed_sessions, 0));
end;
$$;

grant execute on function public.increment_user_reading_daily_stats(
  text,
  date,
  integer,
  integer,
  integer,
  integer,
  integer,
  integer
) to authenticated;

-- One-time backfill from stored completion reports (finished sessions).
insert into public.user_reading_daily_stats (
  user_id,
  language,
  activity_date,
  lines_read,
  lines_recorded,
  words_read,
  words_recorded,
  practice_seconds,
  completed_sessions
)
select
  d.user_id,
  d.language,
  (d.updated_at at time zone 'utc')::date,
  greatest(0, coalesce((d.completion_report ->> 'totalLines')::integer, 0)),
  greatest(
    0,
    coalesce(jsonb_array_length(d.completion_report -> 'uniqueLineIndices'), 0)
  ),
  greatest(0, coalesce((d.completion_report ->> 'totalWords')::integer, 0)),
  greatest(
    0,
    coalesce((d.completion_report ->> 'uniqueWordsRecorded')::integer, 0)
  ),
  greatest(0, coalesce((d.completion_report ->> 'sessionSeconds')::integer, 0)),
  1
from public.user_documents d
where d.completion_report is not null
  and d.last_position >= 100
on conflict (user_id, language, activity_date) do update
set
  lines_read = user_reading_daily_stats.lines_read + excluded.lines_read,
  lines_recorded = user_reading_daily_stats.lines_recorded + excluded.lines_recorded,
  words_read = user_reading_daily_stats.words_read + excluded.words_read,
  words_recorded = user_reading_daily_stats.words_recorded + excluded.words_recorded,
  practice_seconds = user_reading_daily_stats.practice_seconds + excluded.practice_seconds,
  completed_sessions = user_reading_daily_stats.completed_sessions + excluded.completed_sessions;