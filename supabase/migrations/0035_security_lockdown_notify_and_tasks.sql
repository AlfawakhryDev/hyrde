-- 0035 — security audit: an open email relay, and world-readable client briefs
--
-- 1. notify_dispatch was an open email relay.
--    It is SECURITY DEFINER (it must be, to read the webhook secret from
--    Vault), and Postgres grants EXECUTE to PUBLIC by default. PostgREST
--    exposes every public-schema function at /rest/v1/rpc/<name>, so anyone
--    holding the anon key — which ships in the browser bundle by design —
--    could make Hyrde send arbitrary content from notifications@hyrde.net to
--    any address. Verified end to end: an anonymous POST produced a SendGrid
--    202. Blast radius was phishing from a verified domain, the SendGrid
--    quota, and hyrde.net's sending reputation.
--
--    Triggers do not need EXECUTE granted to the calling role, so this breaks
--    nothing.
revoke execute on function public.notify_dispatch(text, jsonb) from public, anon, authenticated;
revoke execute on function public.notify_on_match()          from public, anon, authenticated;
revoke execute on function public.notify_on_demo()           from public, anon, authenticated;
revoke execute on function public.notify_on_lead()           from public, anon, authenticated;
revoke execute on function public.notify_on_call()           from public, anon, authenticated;
revoke execute on function public.notify_on_call_scheduled() from public, anon, authenticated;
revoke execute on function public.enforce_task_limit()       from public, anon, authenticated;
revoke execute on function public.issue_email_code(text, text, integer, boolean) from public, anon;
revoke execute on function public.consume_email_code(text) from public, anon;

-- 2. Every client brief and budget was world-readable.
--    tasks_select was USING (true) and anon held SELECT on brief, amount_cents,
--    poster_id, client_id, ai_review and agent_summary. Verified: an anonymous
--    REST call paged through real briefs and budgets.
--
--    The only legitimate public read is the homepage ticker: six rows of title
--    and category. That is a function, not a table grant.
create or replace function public.recent_open_tasks()
returns table (id uuid, title text, category text, agent_completion int, claimed_by_user_id uuid)
language sql security definer stable set search_path = public as $$
  select t.id, t.title, t.category, t.agent_completion, t.claimed_by_user_id
    from public.tasks t
   order by t.created_at desc
   limit 6;
$$;
grant execute on function public.recent_open_tasks() to anon, authenticated;

drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select using (
    poster_id = auth.uid()
    or client_id = auth.uid()
    or claimed_by_user_id = auth.uid()
    or public.am_i_admin()
  );

revoke select on public.tasks from anon;

-- 3. notify_on_lead read new.name and new.note; the leads table has neither.
--    Building the payload raised BEFORE notify_dispatch could swallow it, so
--    every insert into leads failed. The table had zero rows and /api/lead
--    logged the failure to console.warn and fell through to an ephemeral file
--    store that Vercel discards on each deploy.
create or replace function public.notify_on_lead()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_dispatch('lead', jsonb_build_object(
    'name',  new.contact_name,
    'email', new.email,
    'note',  concat_ws(' · ',
               nullif(new.company, ''), nullif(new.role, ''),
               nullif(new.outcome, ''), nullif(new.budget_range, ''),
               nullif(new.timeline, ''))));
  return new;
-- Capturing the lead matters more than announcing it.
exception when others then
  return new;
end;
$$;
revoke execute on function public.notify_on_lead() from public, anon, authenticated;
