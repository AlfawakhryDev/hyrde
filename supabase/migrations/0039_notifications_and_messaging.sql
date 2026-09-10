-- 0039 — in-product notifications, and messaging that tells someone about it
--
-- The messages table and a chat component already existed, but nothing told
-- the other person a message had arrived. Email went out for matches and calls
-- only, and there was nowhere in the product to see that anything happened —
-- which matters more here than usual: for a Gulf client the inbox we mail is
-- often not the one they watch.
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  kind       text not null,              -- message | matched | delivered | call | progress
  title      text not null,
  body       text,
  url        text,
  task_id    uuid references public.tasks(id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- The query that runs on every page load: my unread, newest first.
create index if not exists notifications_inbox_idx
  on public.notifications (user_id, read_at, created_at desc);

alter table public.notifications enable row level security;

create policy notif_select_own on public.notifications
  for select using (user_id = auth.uid());
-- Marking read is the only thing a person may change, and only on their own.
create policy notif_update_own on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- No INSERT policy on purpose: rows are written by definer-rights triggers,
-- never by a client.
revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- A message notifies the OTHER party, in-product and by email. One function
-- covers both directions because "the other person" is all that differs.
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

  select coalesce(p.display_name, 'Someone') into v_sender
    from public.profiles p where p.id = new.sender_id;

  -- Enough to decide whether to open it, not so much that the email becomes
  -- where the conversation happens.
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
-- A notification must never cost someone their message.
exception when others then return new;
end;
$$;

drop trigger if exists trg_notify_on_message on public.messages;
create trigger trg_notify_on_message after insert on public.messages
  for each row execute function public.notify_on_message();
revoke execute on function public.notify_on_message() from public, anon, authenticated;

create or replace function public.notify_inapp_on_match()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.claimed_by_user_id is not null and old.claimed_by_user_id is null then
    insert into public.notifications (user_id, kind, title, body, url, task_id)
    values (new.claimed_by_user_id, 'matched', 'You have been matched to work',
            new.title, '/t/' || new.id, new.id);
  end if;
  return new;
exception when others then return new;
end;
$$;

drop trigger if exists trg_notify_inapp_on_match on public.tasks;
create trigger trg_notify_inapp_on_match after update of claimed_by_user_id on public.tasks
  for each row execute function public.notify_inapp_on_match();
revoke execute on function public.notify_inapp_on_match() from public, anon, authenticated;
