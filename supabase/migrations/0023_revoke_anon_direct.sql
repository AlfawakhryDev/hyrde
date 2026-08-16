-- Security advisor hardening part 2: Supabase grants anon/authenticated EXECUTE
-- directly on public functions, so PUBLIC revokes are insufficient. Revoke from
-- the roles directly. Trigger functions -> nobody; helpers/gated reader -> anon
-- loses it, authenticated keeps it.
-- RULE: any new SECURITY DEFINER function that should not be anon-callable needs
-- an explicit `revoke execute ... from anon` (and from authenticated if a trigger).
revoke execute on function public.capture_milestone_actuals()           from anon, authenticated;
revoke execute on function public.prevent_mode_change_after_onboarding() from anon, authenticated;
revoke execute on function public.notify_on_match()                      from anon, authenticated;
revoke execute on function public.enforce_task_limit()                   from anon, authenticated;
revoke execute on function public.owns_scope(uuid)    from anon;
revoke execute on function public.owns_session(uuid)  from anon;
revoke execute on function public.get_task_full(uuid) from anon;
