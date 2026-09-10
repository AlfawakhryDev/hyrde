-- A support session makes no noise.
--
-- Signing in is already silent: generateLink() mints a link, it does not send
-- one (signInWithOtp would). What was not silent is everything done afterwards
-- — a message written as Naila would email Ayman, a match would notify him —
-- so the pilot would be punctuated by notifications neither of them expected
-- and could not explain.
--
-- While a session is open, notifications involving either party are skipped.
-- The CONTENT still lands: a message written on someone's behalf is in the
-- thread where it belongs. Only the interruption is suppressed.
create table if not exists public.support_sessions (
  target_id  uuid primary key references auth.users(id) on delete cascade,
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '4 hours'
);

alter table public.support_sessions enable row level security;
-- Admin-visible so it is never a mystery why the product went quiet.
create policy support_admin_read on public.support_sessions
  for select using (public.am_i_admin());
revoke all on public.support_sessions from anon, authenticated;
grant select on public.support_sessions to authenticated;

-- Expiry is the safety: a forgotten session goes quiet on its own after four
-- hours rather than silencing someone's notifications indefinitely.
create or replace function public.in_support_session(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.support_sessions s
     where s.target_id = p_user and s.expires_at > now()
  );
$$;
revoke execute on function public.in_support_session(uuid) from public, anon, authenticated;

create or replace function public.start_support_session(p_target uuid, p_by uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.support_sessions (target_id, started_by, started_at, expires_at)
  values (p_target, p_by, now(), now() + interval '4 hours')
  on conflict (target_id) do update
    set started_by = excluded.started_by,
        started_at = excluded.started_at,
        expires_at = excluded.expires_at;
$$;
revoke execute on function public.start_support_session(uuid, uuid) from public, anon, authenticated;

create or replace function public.end_support_session(p_target uuid)
returns void language sql security definer set search_path = public as $$
  delete from public.support_sessions where target_id = p_target;
$$;
revoke execute on function public.end_support_session(uuid) from public, anon, authenticated;

-- Teach the notifiers to stay quiet.
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_task record; v_other uuid; v_email text; v_sender text; v_preview text;
begin
  select t.id, t.title, t.poster_id, t.claimed_by_user_id
    into v_task from public.tasks t where t.id = new.task_id;
  if v_task.id is null then return new; end if;

  v_other := case when new.sender_id = v_task.poster_id
                  then v_task.claimed_by_user_id else v_task.poster_id end;
  if v_other is null or v_other = new.sender_id then return new; end if;

  -- Either side under support: the message is still in the thread, but nobody
  -- gets pinged about something a support session did.
  if public.in_support_session(new.sender_id) or public.in_support_session(v_other) then
    return new;
  end if;

  select coalesce(p.display_name, 'Someone') into v_sender
    from public.profiles p where p.id = new.sender_id;
  v_preview := left(regexp_replace(new.body, '\s+', ' ', 'g'), 140);

  insert into public.notifications (user_id, kind, title, body, url, task_id)
  values (v_other, 'message', v_sender || ' sent you a message',
          v_preview, '/t/' || new.task_id, new.task_id);

  select u.email into v_email from auth.users u where u.id = v_other;
  if v_email is not null then
    perform public.notify_dispatch('message', jsonb_build_object(
      'to', v_email, 'sender', v_sender,
      'task_title', v_task.title, 'task_id', new.task_id, 'preview', v_preview));
  end if;
  return new;
exception when others then return new;
end;
$$;
revoke execute on function public.notify_on_message() from public, anon, authenticated;

create or replace function public.notify_inapp_on_match()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.claimed_by_user_id is not null and old.claimed_by_user_id is null
     and not public.in_support_session(new.claimed_by_user_id)
     and not public.in_support_session(new.poster_id) then
    insert into public.notifications (user_id, kind, title, body, url, task_id)
    values (new.claimed_by_user_id, 'matched', 'You have been matched to work',
            new.title, '/t/' || new.id, new.id);
  end if;
  return new;
exception when others then return new;
end;
$$;
revoke execute on function public.notify_inapp_on_match() from public, anon, authenticated;

create or replace function public.notify_on_match()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_email text;
begin
  if new.claimed_by_user_id is not null and old.claimed_by_user_id is null then
    if public.in_support_session(new.claimed_by_user_id)
       or public.in_support_session(new.poster_id) then
      return new;
    end if;
    select u.email into v_email from auth.users u where u.id = new.claimed_by_user_id;
    perform public.notify_dispatch('match', jsonb_build_object(
      'freelancer_email', v_email, 'title', new.title, 'task_id', new.id,
      'amount', (new.amount_cents / 100.0)::text, 'deadline', new.deadline::text));
  end if;
  return new;
end;
$$;
revoke execute on function public.notify_on_match() from public, anon, authenticated;
