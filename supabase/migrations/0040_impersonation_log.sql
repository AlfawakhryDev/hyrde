-- 0040 — pilot support impersonation, and the record of every use
--
-- Signing in as another person is the most abusable thing this system can do,
-- so it is built narrow and loud: one named operator, two named accounts, and
-- a row written for every attempt including the refused ones. The consent is
-- Naila's, in writing, for the pilot only — which means the log has to outlive
-- the feature so the use can be shown afterwards.
--
-- Nothing here grants anything. Authorisation lives in lib/impersonation.ts
-- and is enforced in the route; this table only remembers.
create table if not exists public.impersonation_log (
  id             uuid primary key default gen_random_uuid(),
  operator_id    uuid references auth.users(id) on delete set null,
  operator_email text not null,
  target_id      uuid references auth.users(id) on delete set null,
  target_email   text not null,
  allowed        boolean not null,        -- refusals are the interesting rows
  reason         text,
  ip             text,
  user_agent     text,
  created_at     timestamptz not null default now()
);

create index if not exists impersonation_log_recent_idx
  on public.impersonation_log (created_at desc);

alter table public.impersonation_log enable row level security;

-- Admins read the record. Nobody writes from a client: rows come from the
-- route with definer rights, so the log cannot be edited by its subject.
create policy imp_log_admin_read on public.impersonation_log
  for select using (public.am_i_admin());

revoke all on public.impersonation_log from anon, authenticated;
grant select on public.impersonation_log to authenticated;

create or replace function public.log_impersonation(
  p_operator uuid, p_operator_email text,
  p_target uuid, p_target_email text,
  p_allowed boolean, p_reason text, p_ip text, p_ua text
) returns void
language sql security definer set search_path = public as $$
  insert into public.impersonation_log
    (operator_id, operator_email, target_id, target_email, allowed, reason, ip, user_agent)
  values (p_operator, p_operator_email, p_target, p_target_email, p_allowed, p_reason, p_ip, p_ua);
$$;

revoke execute on function public.log_impersonation(uuid, text, uuid, text, boolean, text, text, text)
  from public, anon, authenticated;
