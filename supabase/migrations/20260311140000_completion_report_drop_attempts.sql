update public.user_documents
set completion_report = completion_report - 'attemptsByLine'
where completion_report is not null
  and completion_report ? 'attemptsByLine';