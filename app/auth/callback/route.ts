import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { IMPERSONATION_COOKIE, targetFor } from "@/lib/impersonation";

// Handles the email-confirmation / magic-link redirect from Supabase:
// turns the credential in the URL into a session cookie, then forwards on.
//
// Two shapes arrive here, and they are not interchangeable:
//   ?code=          PKCE. Requires a code_verifier cookie in the SAME browser
//                   that started the flow.
//   ?token_hash=    A token verified server-side. No verifier needed.
//
// A support link is minted server-side and opened in a private window, so it
// has no verifier and PKCE cannot work for it — that is why it used to land
// on /login?error=auth. It arrives as token_hash instead.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/dashboard";
  // Account type chosen on the signup page, riding along through OAuth.
  const roleParam = searchParams.get("role");
  const role = roleParam === "client" || roleParam === "pilot" ? roleParam : null;

  if (code || tokenHash) {
    const supabase = await supabaseServer();
    const { error } = tokenHash
      ? await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: (searchParams.get("type") ?? "magiclink") as "magiclink",
        })
      : await supabase.auth.exchangeCodeForSession(code!);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();

      // The banner is the only thing that stops a borrowed session being
      // mistaken for your own, and it has to be set on the window that
      // actually signed in — which, when the link is opened privately, is a
      // different browser profile from the one that issued it.
      //
      // Both conditions are required: the caller asked for a support session
      // AND the account is on the consented list. A real sign-in by either of
      // those two people never carries support=1, so they never see it.
      const isSupport =
        searchParams.get("support") === "1" && !!targetFor(user?.id ?? "");
      const send = (path: string) => {
        const res = NextResponse.redirect(`${origin}${path}`);
        if (isSupport) {
          res.cookies.set(IMPERSONATION_COOKIE, user?.email ?? "the pilot account", {
            path: "/", sameSite: "lax", maxAge: 60 * 60 * 4, httpOnly: false,
          });
        }
        return res;
      };

      const dest = next.startsWith("/") ? next : "/dashboard";
      if (!dest.startsWith("/onboarding") && user) {
        const { data: profile } = await supabase
          .from("profiles").select("mode").eq("id", user.id).maybeSingle();
        if (!profile?.mode) {
          if (role) {
            // First sign-in with a pre-picked side: persist it, skip onboarding.
            // Existing accounts keep their mode — the param never overwrites.
            await supabase.rpc("upsert_my_profile", {
              p_mode: role,
              p_display_name:
                (user.user_metadata?.display_name as string) ||
                (user.user_metadata?.full_name as string) ||
                (user.user_metadata?.name as string) ||
                user.email?.split("@")[0] || "New user",
            });
            return send(role === "pilot" && dest === "/dashboard" ? "/vetting" : dest);
          }
          // No role known (e.g. OAuth from the login page) — fall back to onboarding.
          return send(`/onboarding?next=${encodeURIComponent(dest)}`);
        }
      }
      return send(dest);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
