// Which social sign-ins are actually configured, resolved on the server.
//
// AuthForm used to fetch this from the browser on mount, which meant the
// primary call to action — the thing 100% of completed signups tap — was a
// grey skeleton until a round trip to Supabase came back. On a phone on
// mobile data that is the first two seconds of the visit.
//
// Fetching it here renders the buttons in the first paint. Cached briefly
// rather than hardcoded, so enabling a provider in the Supabase dashboard
// still lights the button up on its own within a few minutes.

export type Provider = "google" | "github" | "apple" | "azure" | "linkedin_oidc";

const KNOWN: Provider[] = ["linkedin_oidc", "google", "github", "azure", "apple"];

/** Falls back to the two that have been live for months rather than an empty
 *  panel with no way in. */
const FALLBACK: Provider[] = ["google", "github"];

export async function enabledProviders(): Promise<Provider[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return FALLBACK;

  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { external?: Record<string, boolean> };
    const on = KNOWN.filter(p => data.external?.[p]);
    return on.length ? on : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
