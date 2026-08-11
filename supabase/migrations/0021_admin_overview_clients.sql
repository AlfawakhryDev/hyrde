-- ============================================================================
-- 0021 admin_overview: real counts + clients roster
-- ----------------------------------------------------------------------------
-- The oversight stats counted orphan seed tasks (poster_id with no auth.users
-- row) and never showed cancellations, so the numbers looked static and wrong.
-- Now: task list + counts JOIN auth.users on the poster (drops orphan seed),
-- unmatched is split into Open vs Cancelled (closed) so cancelling is visible,
-- and a clients roster is returned for an at-a-glance quick peek. Admin-gated.
-- ============================================================================
create or replace function public.admin_overview()
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare v_tasks jsonb; v_stats jsonb; v_clients jsonb;
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
    join auth.users pu on pu.id = tk.poster_id           -- real poster only
    left join public.profiles pp on pp.id = tk.poster_id
    left join auth.users fu on fu.id = tk.claimed_by_user_id
    left join public.profiles fp on fp.id = tk.claimed_by_user_id
    left join lateral (
      select score, band, category
      from public.vettings
      where user_id = tk.claimed_by_user_id and status = 'passed'
        and (tk.category is null or tk.category = 'Other' or category = tk.category)
      order by score desc limit 1
    ) fv on true
    order by tk.created_at desc
    limit 300
  ) r;

  select jsonb_build_object(
    'clients',      (select count(*) from public.profiles where mode = 'client'),
    'freelancers',  (select count(*) from public.profiles where mode = 'pilot'),
    'vetted',       (select count(distinct user_id) from public.vettings where status = 'passed'),
    'tasks_total',    (select count(*) from public.tasks tk join auth.users u on u.id = tk.poster_id),
    'tasks_matched',  (select count(*) from public.tasks tk join auth.users u on u.id = tk.poster_id where tk.claimed_by_user_id is not null and tk.status <> 'closed'),
    'tasks_open',     (select count(*) from public.tasks tk join auth.users u on u.id = tk.poster_id where tk.claimed_by_user_id is null and tk.status <> 'closed'),
    'tasks_cancelled',(select count(*) from public.tasks tk join auth.users u on u.id = tk.poster_id where tk.status = 'closed')
  ) into v_stats;

  select coalesce(jsonb_agg(row_to_json(c) order by c.signed_up desc), '[]'::jsonb)
  into v_clients
  from (
    select
      u.email, p.display_name, p.company, p.country,
      u.created_at as signed_up,
      (select count(*) from public.tasks t   where t.poster_id  = u.id) as tasks_posted,
      (select count(*) from public.projects pr where pr.poster_id = u.id) as projects,
      (select max(t.created_at) from public.tasks t where t.poster_id = u.id) as last_post
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.mode = 'client'
    order by u.created_at desc
    limit 200
  ) c;

  return jsonb_build_object('tasks', v_tasks, 'stats', v_stats, 'clients', v_clients);
end $$;
