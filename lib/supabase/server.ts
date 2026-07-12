import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import ws from "ws";

// Server-side Supabase client bound to the request's auth cookies.
// Use in Server Components, Route Handlers, and Server Functions.
// `ws` transport: Node < 22 has no native WebSocket and supabase-js v2.109+
// requires one at construction time (realtime is unused server-side).
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: { transport: ws as never },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore when the
            // proxy is refreshing sessions.
          }
        },
      },
    },
  );
}
