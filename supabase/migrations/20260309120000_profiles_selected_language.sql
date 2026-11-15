alter table public.profiles
  add column if not exists selected_language text;

comment on column public.profiles.selected_language is
  'Active learning language code (e.g. en, he). Nullable until the user chooses.';
