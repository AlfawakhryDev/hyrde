-- Admin ops oversight function (applied to prod 2026-07-14).
-- A single SECURITY DEFINER function backing the /admin/oversight dashboard.
-- Self-gates on profiles.is_admin, reads auth.users (emails) which normal roles
-- cannot, and is granted to `authenticated` only. This is the ONLY new surface —
-- no new table-level grants. Read-only; performs no mutations. Intervention
-- tooling (reassign / force-release) is deliberately NOT here — see Linear HYR-5.
create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_tasks jsonb;
  v_stats jsonb;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and is_admin) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(row_to_json(r) order by r.created_at desc), '[]'::jsonb)
  into v_tasks
  from (
    select
      tk.id, tk.title, tk.category, tk.amount_cents, tk.status, tk.payment_status,
      tk.created_at, tk.deadline, tk.match_reason, tk.match_score,
      tk.project_id, tk.milestone_index, tk.milestone_total,
      pu.email as poster_email,
      coalesce(pp.company, pp.display_name) as poster_name,
      fu.email as freelancer_email,
      fp.display_name as freelancer_name,
      fv.score as freelancer_vetting_score,
      fv.band  as freelancer_vetting_band,
      fv.category as freelancer_vetting_category
    from public.tasks tk
    left join auth.users     pu on pu.id = tk.poster_id
    left join public.profiles pp on pp.id = tk.poster_id
    left join auth.users     fu on fu.id = tk.claimed_by_user_id
    left join public.profiles fp on fp.id = tk.claimed_by_user_id
    left join lateral (
      select score, band, category
      from public.vettings
      where user_id = tk.claimed_by_user_id and status = 'passed'
        and (tk.category is null or tk.category = 'Other' or category = tk.category)
      order by score desc
      limit 1
    ) fv on true
    order by tk.created_at desc
    limit 300
  ) r;

  select jsonb_build_object(
    'clients',     (select count(*) from public.profiles where mode = 'client'),
    'freelancers', (select count(*) from public.profiles where mode = 'pilot'),
    'vetted',      (select count(distinct user_id) from public.vettings where status = 'passed'),
    'tasks_total', (select count(*) from public.tasks),
    'tasks_matched', (select count(*) from public.tasks where claimed_by_user_id is not null),
    'tasks_unmatched', (select count(*) from public.tasks where claimed_by_user_id is null and status <> 'closed')
  ) into v_stats;

  return jsonb_build_object('tasks', v_tasks, 'stats', v_stats);
end;
$$;

revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;
