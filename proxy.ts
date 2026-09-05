import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import ws from "ws";
import { isEmailVerified } from "@/lib/verified";

// Refreshes the Supabase auth session on every matched request and keeps the
// auth cookies in sync between the browser and the server. Also gates the
// app area (/dashboard, /onboarding, /t) behind a session.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
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
  );

  // IMPORTANT: do not run code between createServerClient and getUser() —
  // it refreshes expired tokens as a side effect.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth =
    path.startsWith("/dashboard") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/t/");

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Nobody gets into the app on an unconfirmed address. The check lives here
  // rather than on each page so a new route cannot quietly skip it. /vetting is
  // also a public marketing page, so it is gated only once someone is signed in.
  const inApp = needsAuth || path.startsWith("/vetting") ||
    path.startsWith("/profile") || path.startsWith("/billing");

  if (user && inApp) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("email_verified_at")
      .eq("id", user.id)
      .maybeSingle();

    // Only a definite "not confirmed" gates. A failed lookup means we do not
    // know, and locking someone out of their own account on a null we cannot
    // explain is exactly how the missing 0029 grant bounced every user to
    // /onboarding for an hour. Fail open, and let the page decide.
    if (!error && !isEmailVerified(user.app_metadata?.provider, profile?.email_verified_at)) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify";
      url.search = "";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }
  }

  // Already signed in — keep them out of login/signup.
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/t/:path*",
    "/vetting/:path*",
    "/profile/:path*",
    "/billing/:path*",
    "/login",
    "/signup",
  ],
};
