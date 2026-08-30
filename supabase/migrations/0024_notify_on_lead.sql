-- Email the ops inbox when a new lead (pre-order enquiry) arrives from /kontakt.
-- Mirrors notify_on_match: SECURITY DEFINER, reads the Resend key from Vault,
-- no-ops silently until the key is set, and never blocks the insert.
--
-- Activation: create a Resend account, add the API key to Supabase Vault as
-- `resend_api_key`, and verify hyrde.net so `notifications@hyrde.net` can send.
-- Until then this is inert and /admin/leads is the inbox.
--
-- (Companion policies leads_insert_public / leads_select_admin / leads_update_admin
-- and the leads table itself were applied via the Supabase MCP; back-fill them
-- into this dir when convenient.)
create or replace function public.notify_on_lead()
  returns trigger
  language plpgsql
  security definer
  set search_path to 'public'
as $$
declare
  v_key text;
  v_text text;
begin
  begin
    select decrypted_secret into v_key
      from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
    if v_key is null then return new; end if;

    v_text :=
      'Neuer Lead über /kontakt' || E'\n\n'
      || 'Name: ' || coalesce(new.contact_name, '—') || E'\n'
      || 'E-Mail: ' || coalesce(new.email, '—') || E'\n'
      || 'Unternehmen: ' || coalesce(new.company, '—') || E'\n'
      || 'Rolle: ' || coalesce(new.role, '—') || E'\n'
      || 'Budget: ' || coalesce(new.budget_range, '—') || '   Zeit: ' || coalesce(new.timeline, '—') || E'\n\n'
      || 'Ergebnis:' || E'\n' || coalesce(new.outcome, '—') || E'\n\n'
      || 'Alle Leads: https://hyrde.net/admin/leads';

    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', 'Hyrde <notifications@hyrde.net>',
        'to', jsonb_build_array('abdelrahman@hyrde.net'),
        'reply_to', new.email,
        'subject', 'Neuer Lead: ' || coalesce(new.contact_name, new.email),
        'text', v_text
      )
    );
  exception when others then
    null;
  end;
  return new;
end;
$$;

drop trigger if exists trg_notify_on_lead on public.leads;
create trigger trg_notify_on_lead
  after insert on public.leads
  for each row execute function public.notify_on_lead();

revoke execute on function public.notify_on_lead() from anon, authenticated;
