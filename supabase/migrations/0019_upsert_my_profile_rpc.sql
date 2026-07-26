-- ============================================================================
-- 0019 upsert_my_profile() — profile creation via SECURITY DEFINER RPC
-- ----------------------------------------------------------------------------
-- Direct client upserts on profiles intermittently threw "permission denied for
-- table profiles" (the is_admin/payout column lockdown has no grant to
-- authenticated, which some PostgREST paths trip on writes). Onboarding, signup
-- (AuthForm) and the OAuth callback now call this RPC instead. It runs as the
-- table owner and writes ONLY the caller's own row (auth.uid()), so column
-- grants and RETURNING can't interfere. Mode is set only if not already chosen,
-- honouring the mode-immutability rule.
-- ============================================================================
create or replace function public.upsert_my_profile(p_mode text, p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  if p_mode is not null and p_mode not in ('client','pilot') then
    raise exception 'invalid mode %', p_mode using errcode = '22023';
  end if;

  insert into public.profiles (id, mode, display_name, updated_at)
  values (uid, p_mode, coalesce(nullif(p_display_name, ''), 'New user'), now())
  on conflict (id) do update set
    display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
    mode = coalesce(public.profiles.mode, excluded.mode),  -- keep an existing mode
    updated_at = now();
end $$;

revoke all on function public.upsert_my_profile(text, text) from public, anon;
grant execute on function public.upsert_my_profile(text, text) to authenticated;
