-- "Book a demo" capture. Public can submit (no login needed); only admins read.
-- notify_on_demo emails the founder on each request (mirrors notify_on_lead:
-- see 0030: dispatches through the app's SendGrid sender, never blocks insert).
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  note text,
  source text not null default 'website',
  status text not null default 'new'
);

alter table public.demo_requests enable row level security;

revoke all on public.demo_requests from anon, authenticated;
grant insert on public.demo_requests to anon, authenticated;
grant select on public.demo_requests to authenticated;

create policy dr_insert_public on public.demo_requests
  for insert to anon, authenticated with check (true);
create policy dr_select_admin on public.demo_requests
  for select to authenticated using (public.am_i_admin());

create index if not exists demo_requests_created_idx on public.demo_requests (created_at desc);

-- notify_on_demo() + trigger applied via the Supabase MCP; see notify_on_lead
-- (migration 0024 on the pivot line) for the identical pattern. Recipient
-- abdelrahman@hyrde.net; requires `notify_webhook_secret` in Vault (see 0030).
