-- One choke point, not four guards.
--
-- 0041 quieted the two notifiers that matter most, but calls, scheduled calls,
-- demos and leads all reach mail by a different trigger, and a fifth will be
-- written eventually. Every one of them goes through notify_dispatch, so the
-- guard belongs here: a recipient who is in a support session is removed from
-- the payload before it is posted.
--
-- Removed, not dropped. A call notification names the specialist AND copies
-- the admin; taking the specialist out leaves the admin's copy intact, which
-- is the record the pilot actually wants. Only recipient fields are touched —
-- a lead's own address lives in the body and stays there.
create or replace function public.notify_dispatch(p_kind text, p_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_secret  text;
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  k         text;
begin
  foreach k in array array['to', 'freelancer_email', 'contact_email'] loop
    if v_payload ? k and exists (
      select 1
        from public.support_sessions s
        join auth.users u on u.id = s.target_id
       where s.expires_at > now()
         and lower(u.email) = lower(v_payload ->> k)
    ) then
      v_payload := v_payload - k;
    end if;
  end loop;

  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'notify_webhook_secret' limit 1;
  if v_secret is null then return; end if;

  perform net.http_post(
    url     := 'https://hyrde.net/api/notify/dispatch',
    headers := jsonb_build_object('Content-Type','application/json','x-notify-secret', v_secret),
    body    := jsonb_build_object('kind', p_kind, 'payload', v_payload)
  );
exception when others then
  return;
end;
$$;
revoke execute on function public.notify_dispatch(text, jsonb) from public, anon, authenticated;
