alter table public.user_documents
  add column if not exists session_locked boolean not null default false;