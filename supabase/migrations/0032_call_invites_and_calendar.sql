-- 0032 — call invites reach the specialist, and confirmed calls carry a calendar
--
-- notify_on_call built its payload without the freelancer's address, so the
-- dispatcher could only fall back to the admin inbox. The person actually
-- being booked heard nothing, and the client waited on a confirmation nobody
-- had been asked for.
create or replace function public.notify_on_call()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  select u.email into v_email from auth.users u where u.id = new.freelancer_id;

  perform public.notify_dispatch('call', jsonb_build_object(
    'call_id', new.id,
    'contact_name', new.contact_name, 'contact_email', new.contact_email,
    'freelancer_name', new.freelancer_name, 'freelancer_email', v_email,
    'project_title', new.project_title, 'milestone', new.milestone,
    'site_url', new.site_url, 'budget_usd', new.budget_usd,
    'client_timezone', new.client_timezone));
  return new;
end;
$$;

-- A time has been agreed. Separate from the request because it is the only
-- mail that carries the meeting itself (Google Calendar link + .ics), and it
-- must fire on the transition into scheduled, not on every later edit.
create or replace function public.notify_on_call_scheduled()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  if new.scheduled_at is null or old.scheduled_at is not distinct from new.scheduled_at then
    return new;
  end if;

  select u.email into v_email from auth.users u where u.id = new.freelancer_id;

  perform public.notify_dispatch('call_scheduled', jsonb_build_object(
    'call_id', new.id,
    'contact_name', new.contact_name, 'contact_email', new.contact_email,
    'freelancer_name', new.freelancer_name, 'freelancer_email', v_email,
    'project_title', new.project_title, 'milestone', new.milestone,
    'site_url', new.site_url,
    'scheduled_at', new.scheduled_at, 'duration_mins', new.duration_mins,
    'client_timezone', new.client_timezone));
  return new;
end;
$$;

drop trigger if exists trg_notify_on_call_scheduled on public.call_requests;
create trigger trg_notify_on_call_scheduled
  after update of scheduled_at on public.call_requests
  for each row execute function public.notify_on_call_scheduled();
