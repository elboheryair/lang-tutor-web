create table public.reader_style_preferences (
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  font_size integer not null default 18 check (font_size >= 14 and font_size <= 32),
  display_mode text not null default 'full' check (display_mode in ('lines', 'full')),
  highlight_current boolean not null default true,
  dull_rest boolean not null default false,
  bold_current boolean not null default false,
  theme text not null default 'dark' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now(),
  primary key (user_id, language_code)
);

grant select, insert, update on table public.reader_style_preferences to authenticated;

alter table public.reader_style_preferences enable row level security;

create policy "Users can read own reader style preferences"
  on public.reader_style_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own reader style preferences"
  on public.reader_style_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own reader style preferences"
  on public.reader_style_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_reader_style_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reader_style_preferences_set_updated_at
  before update on public.reader_style_preferences
  for each row
  execute function public.set_reader_style_preferences_updated_at();