-- ============================================================================
-- 0017 RLS for interrogation capture (spec steps 6-7)
-- ----------------------------------------------------------------------------
-- 0015 created interrogation_sessions/answers RLS-on with no policies (deny
-- all) since nothing wrote them yet. The interrogation engine now persists the
-- client's own answers about their own project via /api/create-project (running
-- as the authenticated poster), so grant owner-scoped read/insert. Not sensitive
-- (a client's answers about their own project), but still owner-only.
-- ============================================================================

-- interrogation_sessions: gated by owning the project.
alter table public.interrogation_sessions enable row level security;
revoke all on public.interrogation_sessions from anon, authenticated;
grant select, insert on public.interrogation_sessions to authenticated;
drop policy if exists interrogation_sessions_select_own on public.interrogation_sessions;
create policy interrogation_sessions_select_own on public.interrogation_sessions for select to authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.poster_id = auth.uid()));
drop policy if exists interrogation_sessions_insert_own on public.interrogation_sessions;
create policy interrogation_sessions_insert_own on public.interrogation_sessions for insert to authenticated
  with check (exists (select 1 from public.projects p where p.id = project_id and p.poster_id = auth.uid()));

-- Helper: does the current user own the project behind a session?
create or replace function public.owns_session(sess uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.interrogation_sessions s
    join public.projects p on p.id = s.project_id
    where s.id = sess and p.poster_id = auth.uid()
  );
$$;

-- interrogation_answers: gated by owning the parent session.
alter table public.interrogation_answers enable row level security;
revoke all on public.interrogation_answers from anon, authenticated;
grant select, insert on public.interrogation_answers to authenticated;
drop policy if exists interrogation_answers_select_own on public.interrogation_answers;
create policy interrogation_answers_select_own on public.interrogation_answers for select to authenticated
  using (public.owns_session(session_id));
drop policy if exists interrogation_answers_insert_own on public.interrogation_answers;
create policy interrogation_answers_insert_own on public.interrogation_answers for insert to authenticated
  with check (public.owns_session(session_id));
