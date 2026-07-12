-- RLS hardening for the auto-match model (applied to prod 2026-07-13 as
-- `rls_hardening_matching_model`).
drop policy if exists "task claim and work updates" on public.tasks;
create policy tasks_update_matched_freelancer on public.tasks
  for update to authenticated
  using (claimed_by_user_id = auth.uid())
  with check (claimed_by_user_id = auth.uid() or claimed_by_user_id is null);

drop policy if exists tasks_insert_anon on public.tasks;
drop policy if exists tasks_insert_auth on public.tasks;
create policy tasks_insert_own on public.tasks
  for insert to authenticated with check (poster_id = auth.uid());
drop policy if exists "anyone can read tasks" on public.tasks;

drop policy if exists "anyone can read mounts" on public.mounts;
drop policy if exists mounts_insert_anon on public.mounts;
drop policy if exists mounts_insert_auth on public.mounts;

drop policy if exists "Anyone can read meetings" on public.meetings;
create policy meetings_organizer_select on public.meetings
  for select to authenticated using (organizer_id = auth.uid());

revoke execute on function public.notify_on_match() from public, anon, authenticated;
