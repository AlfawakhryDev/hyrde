-- Notifications that survive a failure. (Applied to production 2026-09-11.)
--
-- A notification used to be one fire-and-forget HTTP call from a trigger. If
-- that call failed, the email was gone, and the only trace was a pg_net
-- response row that expires after six hours. Now every notification is
-- written to an outbox first and its first send goes out immediately. A job
-- every minute settles each send by its HTTP answer:
--   2xx                  sent
--   400/404/413/422      dead at once: the request itself is wrong
--   401, 429, 5xx, none  retried at 2, 4, 8 … 60 minutes, dead after 8
-- A dead notification emails the admin an ops_alert; a dead ops_alert does
-- not, so a broken mail path cannot loop. Delivery is at-least-once.
--
-- The scheduler is pg_cron inside Postgres, so this is unaffected by a move
-- from Vercel to AWS.
create extension if not exists pg_cron with schema pg_catalog;

create table if not exists public.notification_outbox (
  id              bigint generated always as identity primary key,
  kind            text        not null,
  payload         jsonb       not null,
  status          text        not null default 'pending'
                  check (status in ('pending', 'sending', 'sent', 'dead')),
  attempts        integer     not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  request_id      bigint,
  last_status     integer,
  last_error      text,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);
create index if not exists notification_outbox_due
  on public.notification_outbox (next_attempt_at) where status in ('pending', 'sending');
alter table public.notification_outbox enable row level security;
drop policy if exists outbox_admin_read on public.notification_outbox;
create policy outbox_admin_read on public.notification_outbox for select using (public.am_i_admin());
revoke all on public.notification_outbox from anon, authenticated;
grant select on public.notification_outbox to authenticated;

create or replace function public.outbox_verdict(p_status integer, p_attempts integer)
returns text language sql immutable set search_path = public as $$
  select case
    when p_status between 200 and 299 then 'sent'
    when p_status in (400, 404, 413, 422) then 'dead'
    when p_attempts >= 8 then 'dead'
    else 'retry'
  end
$$;

create or replace function public.outbox_send(p_id bigint)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_row    public.notification_outbox;
  v_secret text;
  v_url    text;
begin
  select * into v_row from public.notification_outbox
   where id = p_id and status in ('pending', 'sending') for update skip locked;
  if not found then return; end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_webhook_secret' limit 1;
  if v_secret is null then
    update public.notification_outbox
       set status = 'pending', last_error = 'notify_webhook_secret is missing from Vault',
           next_attempt_at = now() + interval '15 minutes'
     where id = p_id;
    raise warning 'outbox %: notify_webhook_secret is missing from Vault', p_id;
    return;
  end if;

  -- Overridable per environment (staging points at its own app).
  v_url := coalesce(
    (select decrypted_secret from vault.decrypted_secrets where name = 'notify_webhook_url' limit 1),
    'https://hyrde.net/api/notify/dispatch');

  update public.notification_outbox
     set status = 'sending', attempts = attempts + 1, last_attempt_at = now(),
         request_id = net.http_post(
           url := v_url,
           headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', v_secret),
           body := jsonb_build_object('kind', v_row.kind, 'payload', v_row.payload, 'outbox_id', v_row.id),
           timeout_milliseconds := 10000)
   where id = p_id;
end;
$$;

create or replace function public.outbox_reconcile()
returns void language plpgsql security definer set search_path = public as $$
declare r record; v text;
begin
  for r in
    select o.id, o.kind, o.payload, o.attempts, o.last_attempt_at,
           resp.id as resp_id, resp.status_code, resp.error_msg
      from public.notification_outbox o
      left join net._http_response resp on resp.id = o.request_id
     where o.status = 'sending'
     for update of o skip locked
  loop
    if r.resp_id is null then
      if now() - r.last_attempt_at < interval '10 minutes' then continue; end if;
      v := public.outbox_verdict(null, r.attempts);
    else
      v := public.outbox_verdict(r.status_code, r.attempts);
    end if;

    update public.notification_outbox set
      status          = case v when 'sent' then 'sent' when 'dead' then 'dead' else 'pending' end,
      sent_at         = case when v = 'sent' then now() end,
      last_status     = r.status_code,
      last_error      = case when v <> 'sent'
                             then coalesce(r.error_msg, 'HTTP ' || r.status_code, 'no response within 10 minutes') end,
      next_attempt_at = case when v = 'retry'
                             then now() + make_interval(mins => least(60, (2 ^ r.attempts)::int))
                             else next_attempt_at end
     where id = r.id;

    if v = 'dead' and r.kind <> 'ops_alert' then
      insert into public.notification_outbox (kind, payload) values ('ops_alert', jsonb_build_object(
        'failed_kind', r.kind,
        'outbox_id',   r.id,
        'attempts',    r.attempts,
        'last_error',  coalesce(r.error_msg, 'HTTP ' || r.status_code, 'no response'),
        'recipient',   coalesce(r.payload ->> 'to', r.payload ->> 'freelancer_email', r.payload ->> 'contact_email')));
    end if;
  end loop;

  for r in
    select id from public.notification_outbox
     where status = 'pending' and next_attempt_at <= now()
     order by next_attempt_at
     limit 50
  loop
    perform public.outbox_send(r.id);
  end loop;
end;
$$;

create or replace function public.notify_dispatch(p_kind text, p_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  k         text;
  v_id      bigint;
begin
  foreach k in array array['to', 'freelancer_email', 'contact_email'] loop
    if v_payload ? k and exists (
      select 1 from public.support_sessions s join auth.users u on u.id = s.target_id
       where s.expires_at > now() and lower(u.email) = lower(v_payload ->> k)
    ) then
      v_payload := v_payload - k;
    end if;
  end loop;

  insert into public.notification_outbox (kind, payload) values (p_kind, v_payload) returning id into v_id;
  begin
    perform public.outbox_send(v_id);
  exception when others then
    raise warning 'outbox %: first send failed, the scheduler will retry: %', v_id, sqlerrm;
  end;
exception when others then
  raise warning 'notify_dispatch(%) failed: %', p_kind, sqlerrm;
end;
$$;

revoke execute on function public.outbox_verdict(integer, integer) from public, anon, authenticated;
revoke execute on function public.outbox_send(bigint)               from public, anon, authenticated;
revoke execute on function public.outbox_reconcile()                from public, anon, authenticated;
revoke execute on function public.notify_dispatch(text, jsonb)      from public, anon, authenticated;

select cron.schedule('notification-outbox', '* * * * *', $$select public.outbox_reconcile()$$);
select cron.schedule('notification-outbox-prune', '17 3 * * *',
  $$delete from public.notification_outbox where status = 'sent' and sent_at < now() - interval '30 days'$$);
