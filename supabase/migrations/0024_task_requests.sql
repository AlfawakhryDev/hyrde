-- Demand signal: capture what a client is trying to post the moment their intent
-- hits the server (the AI "recommendation" calls in /api/classify and /api/brief),
-- so it is stored even when they see results and churn without completing.
create table if not exists public.task_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  raw_text text not null,
  kind text not null default 'outcome',   -- outcome (project composer) | task (single-task)
  archetype text,
  status text not null default 'captured'  -- captured | posted (reserved for later linking)
);

alter table public.task_requests enable row level security;

revoke all on public.task_requests from anon, authenticated;
grant insert on public.task_requests to authenticated;
grant select on public.task_requests to authenticated;

create policy tr_insert_own on public.task_requests
  for insert to authenticated with check (user_id = auth.uid());

create policy tr_select_admin on public.task_requests
  for select to authenticated using (public.am_i_admin());

create index if not exists task_requests_created_idx on public.task_requests (created_at desc);
