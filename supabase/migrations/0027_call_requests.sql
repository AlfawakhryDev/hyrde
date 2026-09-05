-- Call requests: a client asking to speak to ONE specific vetted specialist
-- about a scoped plan. Deliberately separate from demo_requests, which is a
-- sales demo of Hyrde. A hands-off client's real next step is "put me on a
-- call with Kazi about my website", not "show me the product".
create table if not exists public.call_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references auth.users(id) on delete set null,
  freelancer_id uuid references auth.users(id) on delete set null,
  freelancer_name text,
  project_title text,
  milestone text,
  site_url text,
  plan_summary text,
  budget_usd integer,
  contact_name text,
  contact_email text,
  note text,
  status text not null default 'requested'
);

alter table public.call_requests enable row level security;
revoke all on public.call_requests from anon, authenticated;
grant insert on public.call_requests to authenticated;
grant select on public.call_requests to authenticated;

create policy cr_insert_own on public.call_requests
  for insert to authenticated with check (client_id = auth.uid());

-- Admin gating goes through am_i_admin(); an inline profiles.is_admin read in
-- an RLS qual runs as the caller, who has no grant on that column, and throws
-- "permission denied for table profiles" (see migration 0018).
create policy cr_select_own on public.call_requests
  for select to authenticated using (client_id = auth.uid() or public.am_i_admin());

create index if not exists call_requests_created_idx on public.call_requests (created_at desc);
