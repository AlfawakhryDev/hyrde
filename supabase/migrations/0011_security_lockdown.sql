-- Security fixes applied to prod 2026-07-14, mirrored here.
--
-- 1. profiles.mode is now immutable after onboarding (HYR-7): a BEFORE UPDATE
--    trigger blocks any change to mode once it's set, except from
--    service_role. Previously any logged-in user could self-flip their
--    account between client/freelancer via a direct client SDK call.
--
-- 2. tasks.deliverable_text / tasks.agent_deliverable (legacy) were
--    world-readable via the public anon key -- confirmed live: an
--    unauthenticated curl request could read ANY freelancer's full delivered
--    work for free, bypassing the entire "pay before you see it" model,
--    which only ever existed in the browser UI. Closed by revoking the
--    table-level SELECT grant (which had been masking any column-level
--    revoke) and re-granting SELECT only on the safe column list; both
--    fields are now reachable exclusively through get_task_full(), a
--    SECURITY DEFINER function that nulls them unless the caller is the
--    poster, the matched freelancer, or the task is paid.
--
-- IMPORTANT for future schema changes: if a new sensitive/paywalled column is
-- ever added to `tasks`, it must be added to BOTH the revoke list below and
-- excluded from the safe-columns grant, or it will be silently exposed by
-- any future `select("*")`.

create or replace function public.prevent_mode_change_after_onboarding()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;
  if old.mode is not null and new.mode is distinct from old.mode then
    raise exception 'Account type cannot be changed after onboarding. Contact support.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_mode_change on public.profiles;
create trigger trg_prevent_mode_change
  before update on public.profiles
  for each row execute function public.prevent_mode_change_after_onboarding();

revoke select on public.tasks from anon, authenticated;

grant select (
  id, created_at, client_id, title, brief, category, origin, status,
  agent_completion, agent_summary, poster_id, amount_cents, claimed_by_user_id,
  claimed_at, payment_status, stripe_payment_intent_id, mount_points, ai_review,
  deadline, match_reason, match_score, matched_at, project_id, milestone_index,
  milestone_total
) on public.tasks to anon, authenticated;

create or replace function public.get_task_full(p_task_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select to_jsonb(t)
    || jsonb_build_object(
         'deliverable_text',
         case when auth.uid() = t.poster_id or auth.uid() = t.claimed_by_user_id or t.payment_status = 'paid'
              then t.deliverable_text else null end,
         'agent_deliverable',
         case when auth.uid() = t.poster_id or auth.uid() = t.claimed_by_user_id or t.payment_status = 'paid'
              then t.agent_deliverable else null end
       )
  from public.tasks t
  where t.id = p_task_id;
$$;

revoke all on function public.get_task_full(uuid) from public;
grant execute on function public.get_task_full(uuid) to authenticated, anon;
