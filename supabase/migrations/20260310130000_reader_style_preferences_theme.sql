alter table public.reader_style_preferences
  add column if not exists theme text not null default 'dark'
  check (theme in ('light', 'dark'));