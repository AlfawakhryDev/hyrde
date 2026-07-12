import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Handles the email-confirmation / magic-link redirect from Supabase:
// exchanges the auth code for a session cookie, then forwards the user on.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  // Account type chosen on the signup page, riding along through OAuth.
  const roleParam = searchParams.get("role");
  const role = roleParam === "client" || roleParam === "pilot" ? roleParam : null;

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const dest = next.startsWith("/") ? next : "/dashboard";
      if (!dest.startsWith("/onboarding")) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles").select("mode").eq("id", user.id).maybeSingle();
          if (!profile?.mode) {
            if (role) {
              // First sign-in with a pre-picked side: persist it, skip onboarding.
              // Existing accounts keep their mode — the param never overwrites.
              await supabase.from("profiles").upsert({
                id: user.id,
                mode: role,
                display_name:
                  (user.user_metadata?.display_name as string) ||
                  (user.user_metadata?.full_name as string) ||
                  (user.user_metadata?.name as string) ||
                  user.email?.split("@")[0] || "New user",
                updated_at: new Date().toISOString(),
              });
              return NextResponse.redirect(
                `${origin}${role === "pilot" && dest === "/dashboard" ? "/vetting" : dest}`
              );
            }
            // No role known (e.g. OAuth from the login page) — fall back to onboarding.
            return NextResponse.redirect(`${origin}/onboarding?next=${encodeURIComponent(dest)}`);
          }
        }
      }
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
