import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import ws from "ws";
import { isEmailVerified } from "@/lib/verified";

// Refreshes the Supabase auth session on every page request and keeps the auth
// cookies in sync between the browser and the server. Also gates the app area
// (/dashboard, /onboarding, /t) behind a session.
//
// It has to run on EVERY page, not just the gated ones. Supabase rotates the
// refresh token each time it refreshes. A Server Component can't write cookies,
// so a refresh that happens there (say, /admin with an expired access token)
// rotates the token and the browser never learns the new one. Its next request
// presents a spent token, gets "Invalid Refresh Token: Already Used", and the
// user is signed out. Refreshing here first means pages only ever see a fresh
// session.
// Countries where the Arabic site is the right first impression.
const GCC = new Set(["SA", "AE", "QA", "BH", "KW", "OM"]);

export async function proxy(request: NextRequest) {
  // ── Arabic-first, without throwing away the English rankings ────────
  // Saudi Arabic is the product's default language, but "/" is the indexed
  // English page and "/ar" is its Arabic twin. Redirecting every visitor to
  // /ar would take Googlebot with them and deindex the English site — and the
  // English pages are what currently rank.
  //
  // So the redirect keys off the visitor's own signals: an Arabic
  // Accept-Language, or a Gulf IP. Googlebot crawls from the US asking for
  // English, so it still sees "/" as English and reaches "/ar" through
  // hreflang. Anyone who has chosen a language keeps it, forever, and the
  // switcher setting the cookie is what stops this from ever firing again.
  if (request.nextUrl.pathname === "/" && !request.cookies.get("hyrde_locale")) {
    const country = request.headers.get("x-vercel-ip-country") ?? "";
    const prefersArabic = /(^|,)\s*ar\b/i.test(request.headers.get("accept-language") ?? "");
    if (GCC.has(country) || prefersArabic) {
      const url = request.nextUrl.clone();
      url.pathname = "/ar";
      return NextResponse.redirect(url);
    }
  }

  let response = NextResponse.next({ request });

  // A redirect has to carry whatever cookies the refresh below just wrote. A
  // bare NextResponse.redirect() drops them, with the same spent-token result.
  const redirectTo = (url: URL) => {
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach(c => r.cookies.set(c));
    return r;
  };

  // Anonymous visitors, most of the marketing traffic, carry no auth cookie:
  // skip the round trip to Supabase for them entirely.
  const hasSession = request.cookies.getAll().some(
    c => c.name.startsWith("sb-") && c.name.includes("-auth-token"),
  );

  const supabase = hasSession ? createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Node < 22 has no native WebSocket; realtime is unused in the proxy.
      realtime: { transport: ws as never },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  ) : null;

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // it refreshes expired tokens as a side effect.
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  const path = request.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/t/");

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return redirectTo(url);
  }

  // Nobody gets into the app on an unconfirmed address. The check lives here
  // rather than on each page so a new route cannot quietly skip it. /vetting is
  // also a public marketing page, so it is gated only once someone is signed in.
  const inApp = needsAuth || path.startsWith("/vetting") ||
    path.startsWith("/profile") || path.startsWith("/billing");

  if (supabase && user && inApp) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email_verified_at")
      .eq("id", user.id)
      .maybeSingle();

    // Only a definite "not confirmed" gates. A failed lookup means we do not
    // know, and locking someone out of their own account on a null we cannot
    // explain is exactly how the missing 0029 grant bounced every user to
    // /onboarding for an hour. Fail open, and let the page decide.
    if (!error && !isEmailVerified(user, profile?.email_verified_at)) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify";
      url.search = "";
      url.searchParams.set("next", path);
      return redirectTo(url);
    }
  }

  // Already signed in — keep them out of login/signup.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return redirectTo(url);
  }

  return response;
}

export const config = {
  // Every page. Not /api (route handlers write their own cookies), not /auth
  // (the callback sets up the session itself), and not static files.
  matcher: [
    "/((?!api|auth|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|llms.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest|woff2?)$).*)",
  ],
};
