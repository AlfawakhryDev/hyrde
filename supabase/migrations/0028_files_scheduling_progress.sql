-- ── 1. Close the attachment leak ────────────────────────────────────
-- task_attachments carried `SELECT ... to public USING (true)` and the
-- task-files bucket was public, so anyone holding the anon key could
-- enumerate every uploaded file on the platform and download it. Same shape
-- as the deliverable_text leak in migration 0011: a permissive grant quietly
-- undoing the intent. Files are now signed-URL only, for the two people on
-- the task. Never reintroduce a /object/public/ link for this bucket.
update storage.buckets set public = false where id = 'task-files';

drop policy if exists "Anyone can view attachments" on public.task_attachments;

create policy ta_select_involved on public.task_attachments
  for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_attachments.task_id
        and (t.poster_id = auth.uid() or t.claimed_by_user_id = auth.uid())
    )
    or public.am_i_admin()
  );

drop policy if exists task_files_read on storage.objects;
create policy task_files_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'task-files'
    and exists (
      select 1 from public.task_attachments ta
      join public.tasks t on t.id = ta.task_id
      where ta.storage_path = storage.objects.name
        and (t.poster_id = auth.uid() or t.claimed_by_user_id = auth.uid() or public.am_i_admin())
    )
  );

-- ── 2. Scheduling with real timezones ───────────────────────────────
-- Instants are stored as timestamptz (UTC) and rendered through Intl in each
-- viewer's own zone. The IANA strings are kept only so each side can also see
-- the other's local time, which is what actually stops a missed call between
-- Riyadh (UTC+3) and everywhere else.
alter table public.call_requests
  add column if not exists client_timezone     text,
  add column if not exists freelancer_timezone text,
  add column if not exists scheduled_at        timestamptz,
  add column if not exists duration_mins       integer not null default 30;

create table if not exists public.call_slots (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  call_request_id uuid not null references public.call_requests(id) on delete cascade,
  starts_at timestamptz not null,
  state text not null default 'proposed'   -- proposed | confirmed | declined
);
alter table public.call_slots enable row level security;
revoke all on public.call_slots from anon, authenticated;
grant select, insert, update on public.call_slots to authenticated;

create policy cs_rw_involved on public.call_slots
  for all to authenticated
  using (
    exists (select 1 from public.call_requests c where c.id = call_slots.call_request_id
              and (c.client_id = auth.uid() or c.freelancer_id = auth.uid()))
    or public.am_i_admin()
  )
  with check (
    exists (select 1 from public.call_requests c where c.id = call_slots.call_request_id
              and (c.client_id = auth.uid() or c.freelancer_id = auth.uid()))
  );

create index if not exists call_slots_request_idx on public.call_slots (call_request_id, starts_at);

-- ── 3. Progress the client can watch ────────────────────────────────
-- Append-only, one number and one line. Deliberately not a chat: the client
-- asked to track progress, not to be in a thread.
create table if not exists public.milestone_progress (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  percent integer not null check (percent >= 0 and percent <= 100),
  note text
);
alter table public.milestone_progress enable row level security;
revoke all on public.milestone_progress from anon, authenticated;
grant select, insert on public.milestone_progress to authenticated;

-- Only the matched specialist reports; only the two sides read.
create policy mp_insert_worker on public.milestone_progress
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.tasks t where t.id = milestone_progress.task_id
                  and t.claimed_by_user_id = auth.uid())
  );

create policy mp_select_involved on public.milestone_progress
  for select to authenticated
  using (
    exists (select 1 from public.tasks t where t.id = milestone_progress.task_id
              and (t.poster_id = auth.uid() or t.claimed_by_user_id = auth.uid()))
    or public.am_i_admin()
  );

create index if not exists milestone_progress_task_idx on public.milestone_progress (task_id, created_at desc);
