-- Pre-order pipeline: capture a phone number, and accept only business emails
-- (consumer/free providers rejected) — "business only, atm". Enforced at the DB
-- so a client that skips the check still cannot insert a free-provider lead.
-- The client denylist in lib/email.ts must stay in sync with the array below.
alter table public.leads add column if not exists phone text;

create or replace function public.enforce_business_email()
  returns trigger
  language plpgsql
  set search_path to 'public'
as $$
declare
  d text := lower(split_part(coalesce(new.email, ''), '@', 2));
begin
  if d = any (array[
    'gmail.com','googlemail.com','yahoo.com','yahoo.de','yahoo.co.uk','ymail.com',
    'hotmail.com','hotmail.de','hotmail.co.uk','outlook.com','outlook.de','live.com','live.de',
    'msn.com','icloud.com','me.com','mac.com','aol.com','proton.me','protonmail.com','pm.me',
    'gmx.de','gmx.net','gmx.com','gmx.at','gmx.ch','web.de','t-online.de','freenet.de',
    'mail.com','mail.ru','yandex.com','yandex.ru','zoho.com','hey.com','fastmail.com',
    'tutanota.com','tuta.io','posteo.de','arcor.de','bluewin.ch','sunrise.ch'
  ]) then
    raise exception 'BUSINESS_EMAIL_REQUIRED' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_business_email on public.leads;
create trigger trg_enforce_business_email
  before insert on public.leads
  for each row execute function public.enforce_business_email();

revoke execute on function public.enforce_business_email() from anon, authenticated;

-- notify_on_lead updated to include the phone number (see 0024 for the base).
-- (Re-applied here with the phone line; full body lives in the applied migration.)
