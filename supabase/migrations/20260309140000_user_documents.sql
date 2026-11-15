create table public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language text not null,
  title text not null,
  source_type text not null check (
    source_type in ('file', 'url', 'pasted_text')
  ),
  content text not null,
  last_position integer not null default 0 check (last_position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_documents_user_language_idx
  on public.user_documents (user_id, language, updated_at desc);

grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.user_documents to authenticated;

alter table public.user_documents enable row level security;

create policy "Users can read own documents"
  on public.user_documents
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.user_documents
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.user_documents
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.user_documents
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_user_documents_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_documents_set_updated_at
  before update on public.user_documents
  for each row
  execute function public.set_user_documents_updated_at();
