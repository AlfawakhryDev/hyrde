import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// Plain anon-key client for server routes that don't act as a signed-in user
// (e.g. public lead capture). RLS on the clients/pilots tables allows anon
// INSERT but not SELECT, so lead PII stays private.
// `ws` transport: Node < 22 has no native WebSocket (realtime is unused here).
export function supabaseAnon() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      realtime: { transport: ws as never },
    },
  );
}
