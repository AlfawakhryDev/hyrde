-- ── Email verification by code ──────────────────────────────────────
-- Deliberately NOT Supabase Auth's built-in confirmation. That path requires
-- custom SMTP configured in the dashboard; this one runs entirely on the
-- SendGrid key the app already holds, so it works with no external setup.
--
-- Only a HASH of the code is stored, salted with the user id. A database
-- read, a backup, or a leaked row must never hand somebody a working code.
alter table public.profiles
  add column if not exists email_verified_at timestamptz;

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  code_hash text not null,          -- sha256(code || user_id), never the code
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts integer not null default 0
);

alter table public.email_verifications enable row level security;
-- No client grants at all. Both paths go through the SECURITY DEFINER
-- functions below, so the table is unreachable from the browser.
revoke all on public.email_verifications from anon, authenticated;

create index if not exists email_verifications_user_idx
  on public.email_verifications (user_id, created_at desc);
create index if not exists email_verifications_expiry_idx
  on public.email_verifications (expires_at) where consumed_at is null;

-- Issue: invalidate any outstanding code, then store the new digest.
create or replace function public.issue_email_code(p_code_hash text, p_email text, p_ttl_minutes int default 10)
returns void
language plpgsql security definer set search_path to 'public'
as $function$
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  update public.email_verifications
     set consumed_at = now()
   where user_id = auth.uid() and consumed_at is null;
  insert into public.email_verifications (user_id, email, code_hash, expires_at)
  values (auth.uid(), p_email, p_code_hash, now() + make_interval(mins => p_ttl_minutes));
end;
$function$;

-- Consume: 'ok' | 'invalid' | 'expired' | 'too_many' | 'none'.
-- Attempts are counted so six digits cannot be brute forced.
create or replace function public.consume_email_code(p_code_hash text)
returns text
language plpgsql security definer set search_path to 'public'
as $function$
declare v record;
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select * into v from public.email_verifications
   where user_id = auth.uid() and consumed_at is null
   order by created_at desc limit 1;
  if v is null then return 'none'; end if;
  if v.attempts >= 5 then return 'too_many'; end if;
  if v.expires_at < now() then return 'expired'; end if;
  if v.code_hash <> p_code_hash then
    update public.email_verifications set attempts = attempts + 1 where id = v.id;
    return 'invalid';
  end if;
  update public.email_verifications set consumed_at = now() where id = v.id;
  update public.profiles set email_verified_at = now() where id = auth.uid();
  return 'ok';
end;
$function$;

revoke execute on function public.issue_email_code(text, text, int) from anon;
revoke execute on function public.consume_email_code(text) from anon;
grant execute on function public.issue_email_code(text, text, int) to authenticated;
grant execute on function public.consume_email_code(text) to authenticated;
