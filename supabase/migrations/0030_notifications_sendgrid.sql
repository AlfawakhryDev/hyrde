-- 0030 — notifications move off Resend onto SendGrid
--
-- The notify_on_* triggers from 0007 and 0025 POSTed straight to Resend using
-- a key in Vault named 'resend_api_key'. That secret was never created, so
-- every notification since those migrations silently did nothing.
--
-- They now go through one function that POSTs to the app, which owns the only
-- mail credential (SENDGRID_API_KEY, Vercel env). Vault holds a shared secret
-- so the route can tell a real trigger from anyone else, and nothing more.
-- Supersedes the Resend comments in 0007 and 0025.

create or replace function public.notify_dispatch(p_kind text, p_payload jsonb)
returns void language plpgsql security definer set search_path = public as $$
declare v_secret text;
begin
  select decrypted_secret into v_secret
    from vault.decrypted_secrets where name = 'notify_webhook_secret' limit 1;
  if v_secret is null then return; end if;

  perform net.http_post(
    url     := 'https://hyrde.net/api/notify/dispatch',
    headers := jsonb_build_object('Content-Type','application/json','x-notify-secret', v_secret),
    body    := jsonb_build_object('kind', p_kind, 'payload', p_payload)
  );
-- A failed notification must never roll back the row that triggered it.
exception when others then
  return;
end;
$$;

create or replace function public.notify_on_match()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  if new.claimed_by_user_id is not null and old.claimed_by_user_id is null then
    select u.email into v_email from auth.users u where u.id = new.claimed_by_user_id;
    perform public.notify_dispatch('match', jsonb_build_object(
      'freelancer_email', v_email, 'title', new.title, 'task_id', new.id,
      'amount', (new.amount_cents / 100.0)::text, 'deadline', new.deadline::text));
  end if;
  return new;
end;
$$;

create or replace function public.notify_on_demo()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_dispatch('demo', jsonb_build_object(
    'name', new.name, 'email', new.email, 'company', new.company, 'note', new.note));
  return new;
end;
$$;

create or replace function public.notify_on_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_dispatch('lead', jsonb_build_object(
    'name', new.name, 'email', new.email, 'note', new.note));
  return new;
end;
$$;

-- A booked call had no notification at all: the dispatcher knew how to compose
-- one, but nothing ever asked it to.
create or replace function public.notify_on_call()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_dispatch('call', jsonb_build_object(
    'contact_name', new.contact_name, 'contact_email', new.contact_email,
    'freelancer_name', new.freelancer_name, 'project_title', new.project_title,
    'milestone', new.milestone, 'site_url', new.site_url,
    'scheduled_at', new.scheduled_at::text, 'client_timezone', new.client_timezone));
  return new;
end;
$$;

drop trigger if exists trg_notify_on_call on public.call_requests;
create trigger trg_notify_on_call after insert on public.call_requests
  for each row execute function public.notify_on_call();
