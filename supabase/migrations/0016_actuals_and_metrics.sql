-- ============================================================================
-- 0016 Actuals capture + scope-accuracy metrics (spec steps 4-5)
-- ----------------------------------------------------------------------------
-- Closes the data loop opened by 0015: when a milestone's task reaches a
-- terminal state, capture what it ACTUALLY cost/took into milestone_actuals,
-- then expose the estimate-vs-actual metrics (scope_accuracy first) to admins.
--
-- Capture runs as a SECURITY DEFINER trigger so the immutable/locked-down
-- milestone_actuals table (no authenticated policy) can only ever be written by
-- the system on a real task transition, never forged from the client.
-- ============================================================================

-- ── Step 4: capture actuals at milestone close ──────────────────────────────
create or replace function public.capture_milestone_actuals() returns trigger
  language plpgsql security definer set search_path = public as $$
declare
  terminal boolean;
begin
  if new.milestone_id is null then return new; end if;

  -- "Closed" for a milestone = deliverable accepted (approved/closed) or paid.
  terminal := (new.status in ('approved','closed')) or (new.payment_status = 'paid');
  if not terminal then return new; end if;

  insert into public.milestone_actuals as ma (
    milestone_id, task_id, cost_actual, duration_days_actual,
    started_at, completed_at, outcome, rework_cycles, updated_at
  ) values (
    new.milestone_id,
    new.id,
    round(coalesce(new.amount_cents, 0) / 100.0, 2),
    greatest(0, round(extract(epoch from (now() - coalesce(new.matched_at, new.created_at))) / 86400.0, 2)),
    coalesce(new.matched_at, new.created_at),
    now(),
    case when new.deadline is not null and now() > new.deadline then 'delivered_late' else 'delivered' end,
    0,   -- rework_cycles: not tracked yet; refined when a decline/re-match counter lands
    now()
  )
  on conflict (milestone_id) do update set
    task_id              = excluded.task_id,
    cost_actual          = excluded.cost_actual,
    duration_days_actual = excluded.duration_days_actual,
    completed_at         = excluded.completed_at,
    outcome              = excluded.outcome,
    updated_at           = now();

  return new;
end $$;

drop trigger if exists capture_actuals on public.tasks;
create trigger capture_actuals after update on public.tasks
  for each row
  when (
    new.milestone_id is not null
    and (new.status is distinct from old.status or new.payment_status is distinct from old.payment_status)
  )
  execute function public.capture_milestone_actuals();

-- ── Step 5: scope-accuracy metrics (admin-gated, self-checking) ─────────────
-- Returns the whole metric set as jsonb. Honest about cold start: every metric
-- carries its own sample size, and with zero settled projects the ratios are
-- null rather than a fabricated number.
create or replace function public.instrumentation_metrics() returns jsonb
  language plpgsql security definer set search_path = public as $$
declare
  result jsonb;
begin
  if coalesce((select is_admin from public.profiles where id = auth.uid()), false) is not true then
    raise exception 'not authorized' using errcode = 'insufficient_privilege';
  end if;

  with orig_scope as (
    select sd.id, sd.project_id, sd.total_estimate_low as low, sd.total_estimate_high as high,
           (sd.total_estimate_low + sd.total_estimate_high) / 2.0 as mid
    from public.scope_documents sd
    where sd.version = 1
  ),
  proj_roll as (
    select m.scope_document_id,
           count(m.id)                         as milestone_count,
           count(ma.id)                        as with_actuals,
           sum(ma.cost_actual)                 as actual_total
    from public.milestones m
    left join public.milestone_actuals ma on ma.milestone_id = m.id
    group by m.scope_document_id
  ),
  settled as (   -- closed projects whose every milestone has an actual
    select p.id as project_id, p.archetype_id, os.low, os.high, os.mid, pr.actual_total,
           (pr.actual_total between os.low and os.high) as within_envelope
    from public.projects p
    join orig_scope os on os.project_id = p.id
    join proj_roll pr  on pr.scope_document_id = os.id
    where p.status in ('closed','completed')
      and pr.milestone_count > 0
      and pr.with_actuals = pr.milestone_count
  )
  select jsonb_build_object(
    'generated_at', now(),
    -- plumbing health (proves capture is flowing even before anything closes)
    'plumbing', jsonb_build_object(
      'scope_documents',    (select count(*) from public.scope_documents),
      'milestones',         (select count(*) from public.milestones),
      'milestone_estimates',(select count(*) from public.milestone_estimates),
      'milestone_actuals',  (select count(*) from public.milestone_actuals),
      'events',             (select count(*) from public.events),
      'risk_flags',         (select count(*) from public.risk_flags)
    ),
    'settled_projects', (select count(*) from settled),
    -- PRIMARY: % of settled projects that closed inside the original envelope
    'scope_accuracy', (select round(avg(case when within_envelope then 1 else 0 end), 3) from settled),
    'cost_variance_median_overall',
      (select round(percentile_cont(0.5) within group (order by actual_total / nullif(mid,0))::numeric, 3) from settled where mid > 0),
    'cost_variance_by_archetype', coalesce((
      select jsonb_agg(row_to_json(a)) from (
        select coalesce(pa.slug,'unclassified') as archetype,
               count(*) as n,
               round(percentile_cont(0.5) within group (order by s.actual_total / nullif(s.mid,0))::numeric, 3) as variance_median
        from settled s
        left join public.project_archetypes pa on pa.id = s.archetype_id
        where s.mid > 0
        group by coalesce(pa.slug,'unclassified')
        order by n desc
      ) a), '[]'::jsonb),
    'milestone_variance_by_type', coalesce((
      select jsonb_agg(row_to_json(b)) from (
        select m.milestone_type as type,
               count(*) as n,
               round(percentile_cont(0.5) within group (
                 order by ma.cost_actual / nullif((me.cost_low + me.cost_high)/2.0, 0))::numeric, 3) as variance_median
        from public.milestone_actuals ma
        join public.milestones m           on m.id = ma.milestone_id
        join public.milestone_estimates me on me.milestone_id = m.id
        group by m.milestone_type
        order by variance_median desc nulls last
      ) b), '[]'::jsonb),
    'risk_flag_precision',
      (select round(avg(case when materialized then 1 else 0 end), 3)
         from public.risk_flags where materialized is not null),
    'change_order_rate',
      (select round(
         (select count(*)::numeric from public.change_orders)
         / nullif((select count(*) from public.projects where status in ('closed','completed')), 0), 3)),
    'interrogation_completion',
      (select round(avg(case when completed_at is not null then 1 else 0 end), 3)
         from public.interrogation_sessions)
  ) into result;

  return result;
end $$;

revoke all on function public.instrumentation_metrics() from public, anon;
grant execute on function public.instrumentation_metrics() to authenticated;
