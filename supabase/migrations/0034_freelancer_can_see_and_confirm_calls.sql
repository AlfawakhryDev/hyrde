-- 0034 — the specialist could not see, let alone confirm, a call booked with them
--
-- cr_select_own was (client_id = auth.uid() OR am_i_admin()), so the one person
-- the request is FOR could not read it, and there was no UPDATE policy at all.
-- CallScheduler's confirm() would have failed silently even if it had been
-- rendered anywhere — and it is not: the default export has no mount point, so
-- the notification telling them to "open Hyrde and confirm one of their times"
-- pointed at a screen that does not exist.
drop policy if exists cr_select_own on public.call_requests;
create policy cr_select_involved on public.call_requests
  for select using (
    client_id = auth.uid() or freelancer_id = auth.uid() or public.am_i_admin()
  );

drop policy if exists cr_update_involved on public.call_requests;
create policy cr_update_involved on public.call_requests
  for update using (
    client_id = auth.uid() or freelancer_id = auth.uid() or public.am_i_admin()
  ) with check (
    client_id = auth.uid() or freelancer_id = auth.uid() or public.am_i_admin()
  );

-- Column grants keep either side to the scheduling fields: confirming a time
-- must not become a way to rewrite the brief, the budget or who it is with.
revoke update on public.call_requests from authenticated;
grant update (scheduled_at, freelancer_timezone, client_timezone, status, duration_mins)
  on public.call_requests to authenticated;
