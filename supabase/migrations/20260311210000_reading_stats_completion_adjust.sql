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
    completed_sessions = greatest(
      0,
      user_reading_daily_stats.completed_sessions + coalesce(p_completed_sessions, 0)
    );
end;
$$;