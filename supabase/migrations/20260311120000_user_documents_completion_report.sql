alter table public.user_documents
  add column if not exists completion_report jsonb;