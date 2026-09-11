-- Rate limits every server instance agrees on. (Applied to production 2026-09-11.)
--
-- The AI routes cost money and are public. Their limits lived in each server
-- instance's memory, so N instances meant N times the limit and a cold start
-- reset it. The counters now live here, in the database every instance
-- shares. It is also the one piece of infrastructure that stays put when
-- hosting moves from Vercel to AWS.
--
-- ponytail: fixed one-minute windows and a single hot 'global' row. Fine for
-- tens of requests a minute; at hundreds, move to Redis (ElastiCache on AWS)
-- behind the same lib/ratelimit.ts interface.
create table if not exists public.rate_limit_counters (
  key          text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (key, window_start)
);
alter table public.rate_limit_counters enable row level security;
-- No policies. Nothing reads or writes this through the API; only the
-- function below touches it, running as its owner.
revoke all on public.rate_limit_counters from anon, authenticated;

create or replace function public.rate_limit_ai(p_ip text, p_per_ip integer, p_global integer)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_window timestamptz := date_trunc('minute', now());
  v_ip     integer;
  v_global integer;
begin
  insert into public.rate_limit_counters as c (key, window_start, hits)
       values ('ip:' || p_ip, v_window, 1)
  on conflict (key, window_start) do update set hits = c.hits + 1
  returning c.hits into v_ip;

  insert into public.rate_limit_counters as c (key, window_start, hits)
       values ('global', v_window, 1)
  on conflict (key, window_start) do update set hits = c.hits + 1
  returning c.hits into v_global;

  -- Old windows are dead weight; clearing them occasionally on the way
  -- through keeps the table tiny without a scheduled job.
  if random() < 0.02 then
    delete from public.rate_limit_counters where window_start < now() - interval '10 minutes';
  end if;

  return jsonb_build_object(
    'allowed',     v_ip <= p_per_ip and v_global <= p_global,
    'reason',      case when v_global > p_global then 'global' when v_ip > p_per_ip then 'ip' end,
    'retry_after', greatest(1, 60 - extract(second from now())::int)
  );
end;
$$;
-- Server only. If signed-in users could call this, anyone could burn a
-- stranger's quota by incrementing their IP's counter.
revoke execute on function public.rate_limit_ai(text, integer, integer) from public, anon, authenticated;
