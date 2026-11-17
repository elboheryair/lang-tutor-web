create table public.analytics_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  date_preset text not null default '30d' check (
    date_preset in ('7d', '30d', 'all', 'custom')
  ),
  custom_start date,
  custom_end date,
  lines_charts_unified boolean not null default false,
  words_charts_unified boolean not null default false,
  updated_at timestamptz not null default now()
);

grant select, insert, update on table public.analytics_preferences to authenticated;

alter table public.analytics_preferences enable row level security;

create policy "Users can read own analytics preferences"
  on public.analytics_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own analytics preferences"
  on public.analytics_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own analytics preferences"
  on public.analytics_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_analytics_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger analytics_preferences_set_updated_at
  before update on public.analytics_preferences
  for each row
  execute function public.set_analytics_preferences_updated_at();