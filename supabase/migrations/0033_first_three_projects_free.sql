-- 0033 — "first 3 projects on us": no Hyrde fee, just the specialist's price
--
-- Two changes, and the first was a live bug. The cap counted TASKS at 3 per
-- month, but a project fans out into one task per milestone, so a five
-- milestone project blew the free cap partway through creating itself — a free
-- client could not post a single project. The unit is now the project.
--
-- And the free allowance is a lifetime onboarding offer, not a monthly one.
-- Paid tiers stay monthly quotas.
create or replace function public.enforce_task_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_tier  text;
  v_limit int;
  v_used  int;
  v_free  boolean;
begin
  -- Milestones after the first belong to a project that has already been
  -- counted, so a plan of any length costs exactly one.
  if new.project_id is not null and exists (
    select 1 from public.tasks
     where poster_id = new.poster_id and project_id = new.project_id
  ) then
    return new;
  end if;

  select tier into v_tier
    from public.subscriptions
   where user_id = new.poster_id and status = 'active' and expires_at > now()
   order by expires_at desc limit 1;

  v_tier := coalesce(v_tier, 'free');
  v_free := v_tier = 'free';
  v_limit := case v_tier when 'scale' then null when 'pro' then 50 else 3 end;

  if v_limit is null then return new; end if;

  -- A unit is a project, or a standalone task. The free allowance is for all
  -- time; paid tiers are a monthly quota.
  select count(distinct t.project_id) filter (where t.project_id is not null)
       + count(*) filter (where t.project_id is null)
    into v_used
    from public.tasks t
   where t.poster_id = new.poster_id
     and (v_free or t.created_at >= date_trunc('month', now()));

  if v_used >= v_limit then
    raise exception 'TASK_LIMIT|%|%', v_tier, v_limit;
  end if;

  return new;
end;
$$;
