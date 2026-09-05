-- Profile details + match-notification email (applied to prod 2026-07-12/13
-- as `profile_details_and_match_email`).
alter table public.profiles add column if not exists headline text;
alter table public.profiles add column if not exists company text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists city text;

create table if not exists public.profile_private (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  notify_matches boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.profile_private enable row level security;
drop policy if exists profile_private_owner on public.profile_private;
create policy profile_private_owner on public.profile_private
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create extension if not exists pg_net;

-- notify_on_match(): trigger fn — emails the matched freelancer.
-- SUPERSEDED by 0030: it now calls notify_dispatch() (SendGrid via the app),
-- not Resend. Full definition
-- lives in the remote migration `profile_details_and_match_email`; see
-- supabase/README.md. Never breaks matching (exception-wrapped).
