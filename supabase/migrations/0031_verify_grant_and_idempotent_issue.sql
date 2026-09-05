-- 0031 — the grant 0029 forgot, and an idempotent code issue
--
-- 0029 added profiles.email_verified_at but never granted SELECT on it.
-- profiles uses column-level grants, so adding the column to the dashboard's
-- select made the whole select fail with "permission denied for table
-- profiles": the row came back null, `if (!profile?.mode)` fired, and every
-- visit to /dashboard redirected to /onboarding. Nobody could see the verify
-- banner because nobody could load the page it lives on.
grant select (email_verified_at) on public.profiles to authenticated;

-- Issuing is now idempotent. The banner asks for a code whenever it mounts, so
-- the default has to be "leave a live code alone" — otherwise a reload would
-- invalidate the code someone is halfway through typing. Passing p_force skips
-- the check, which is what "send me a new code" does.
drop function if exists public.issue_email_code(text, text, integer);

create or replace function public.issue_email_code(
  p_code_hash text, p_email text, p_ttl_minutes integer default 10,
  p_force boolean default false
) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not p_force and exists (
    select 1 from public.email_verifications
     where user_id = auth.uid() and consumed_at is null and expires_at > now()
  ) then
    return false;  -- one is already in their inbox
  end if;

  -- One live code per user. Requesting a new one kills the old.
  update public.email_verifications
     set consumed_at = now()
   where user_id = auth.uid() and consumed_at is null;

  insert into public.email_verifications (user_id, email, code_hash, expires_at)
  values (auth.uid(), p_email, p_code_hash, now() + make_interval(mins => p_ttl_minutes));
  return true;
end;
$$;
