-- ============================================================================
-- 0020 Cancel an auto-matched project/task (before delivery or payment)
-- ----------------------------------------------------------------------------
-- When a project auto-matches milestone 1 to a freelancer, the poster (or an
-- admin) may need to pull it back. cancel_project unassigns the matched
-- specialist, closes the open/matched milestones, and marks the project
-- cancelled. Delivered/approved/paid/closed tasks are protected so real work is
-- never silently removed. cancel_task does the same for a single task.
-- SECURITY DEFINER: needs to unassign (claimed_by_user_id) and write the event.
-- ============================================================================
create or replace function public.cancel_project(p_project uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid(); n int; is_owner boolean;
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  is_owner := exists (select 1 from public.projects where id = p_project and poster_id = uid);
  if not is_owner and not coalesce((select is_admin from public.profiles where id = uid), false) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.tasks
    set status = 'closed', claimed_by_user_id = null, matched_at = null,
        match_reason = null, match_score = null
    where project_id = p_project
      and status not in ('delivered','approved','paid','closed')
      and coalesce(payment_status,'unpaid') <> 'paid';
  get diagnostics n = row_count;

  update public.projects set status = 'cancelled', updated_at = now() where id = p_project;

  insert into public.events (project_id, event_type, payload, actor)
  values (p_project, 'project_cancelled', jsonb_build_object('tasks_cancelled', n),
          case when is_owner then 'client' else 'admin' end);

  return jsonb_build_object('cancelled_tasks', n);
end $$;

create or replace function public.cancel_task(p_task uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated' using errcode = '28000'; end if;
  if not exists (select 1 from public.tasks where id = p_task and poster_id = uid)
     and not coalesce((select is_admin from public.profiles where id = uid), false) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.tasks
    set status = 'closed', claimed_by_user_id = null, matched_at = null,
        match_reason = null, match_score = null
    where id = p_task
      and status not in ('delivered','approved','paid','closed')
      and coalesce(payment_status,'unpaid') <> 'paid';
end $$;

revoke all on function public.cancel_project(uuid) from public, anon;
revoke all on function public.cancel_task(uuid) from public, anon;
grant execute on function public.cancel_project(uuid) to authenticated;
grant execute on function public.cancel_task(uuid) to authenticated;
