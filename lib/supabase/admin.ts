import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── The server's own database client ─────────────────────────────────
// Uses the service-role key, which bypasses every RLS policy. Server code
// only: never import this from a client component, and never prefix the key
// with NEXT_PUBLIC_. Returns null where the key is not configured (local
// development, CI), so callers fall back instead of crashing.
let cached: SupabaseClient | null | undefined;

export function supabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  cached = url && key
    ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;
  return cached;
}
