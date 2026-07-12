-- Auto-match model: AI assigns tasks; deadline + match metadata on tasks.
-- (Applied to production 2026-07-11 as `add_task_match_and_deadline`.)
alter table public.tasks add column if not exists deadline timestamptz;
alter table public.tasks add column if not exists match_reason text;
alter table public.tasks add column if not exists match_score integer;
alter table public.tasks add column if not exists matched_at timestamptz;
