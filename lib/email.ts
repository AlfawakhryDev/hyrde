// Business-email check for the pre-order pipeline. Client-side UX only — the
// authority is the DB trigger enforce_business_email (0025). Keep this denylist
// in sync with that migration's array.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.de", "yahoo.co.uk", "ymail.com",
  "hotmail.com", "hotmail.de", "hotmail.co.uk", "outlook.com", "outlook.de", "live.com", "live.de",
  "msn.com", "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "pm.me",
  "gmx.de", "gmx.net", "gmx.com", "gmx.at", "gmx.ch", "web.de", "t-online.de", "freenet.de",
  "mail.com", "mail.ru", "yandex.com", "yandex.ru", "zoho.com", "hey.com", "fastmail.com",
  "tutanota.com", "tuta.io", "posteo.de", "arcor.de", "bluewin.ch", "sunrise.ch",
]);

/** True only for a syntactically valid, non-free-provider (business) email. */
export function isBusinessEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  // minimal shape check: something@domain.tld
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return false;
  const domain = e.split("@")[1];
  return !FREE_EMAIL_DOMAINS.has(domain);
}
