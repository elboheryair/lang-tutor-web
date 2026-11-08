-- Allow authenticated users to create their own profile row (e.g. existing accounts before the trigger existed).
grant insert on table public.profiles to authenticated;

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);
