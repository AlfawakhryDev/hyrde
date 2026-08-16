-- Security advisor hardening (pre-open-source pass), part 1.
-- Trigger functions are never callable directly; pin search_path on the
-- immutability trigger fns; drop the orphaned append-only fn.
-- NOTE: the PUBLIC revokes here are no-ops on Supabase (anon/authenticated are
-- granted EXECUTE directly, not via PUBLIC) -> see 0023 for the effective revokes.
revoke execute on function public.capture_milestone_actuals() from public;
revoke execute on function public.prevent_mode_change_after_onboarding() from public;
revoke execute on function public.notify_on_match() from public;
revoke execute on function public.enforce_task_limit() from public;
revoke execute on function public.owns_scope(uuid)   from public;
grant  execute on function public.owns_scope(uuid)   to authenticated;
revoke execute on function public.owns_session(uuid) from public;
grant  execute on function public.owns_session(uuid) to authenticated;
revoke execute on function public.get_task_full(uuid) from public;
grant  execute on function public.get_task_full(uuid) to authenticated;
alter function public.tg_block_update() set search_path = public;
alter function public.tg_lock_raw_request() set search_path = public;
drop function if exists public.tg_block_update_delete();
