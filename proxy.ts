import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import ws from "ws";
import { LOCALE_COOKIE } from "@/lib/i18n";

// German-speaking market. Vercel sets `x-vercel-ip-country` (ISO 3166-1 alpha-2)
// on every edge request and overwrites any client-sent value, so it can't be
// spoofed in production. Next 15+ removed `request.geo`; reading the header is
// the dependency-free equivalent of `@vercel/functions` geolocation().
const DACH = new Set(["DE", "AT", "CH", "LI"]);

// Refreshes the Supabase auth session on every matched request and keeps the
// auth cookies in sync between the browser and the server. Also gates the
// app area (/dashboard, /onboarding, /t) behind a session.
//
// Next 16 renamed the `middleware` convention to `proxy` (same API).
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Root landing: route by locale. An explicit choice (the language switcher
  // sets hyrde_locale) always wins; otherwise DACH visitors get the German
  // homepage and everyone else the English one. Handled before the auth logic
  // since `/` is public; reversible by dropping "/" from the matcher below.
  if (path === "/") {
    const choice = request.cookies.get(LOCALE_COOKIE)?.value;
    if (choice === "en") return NextResponse.next();
    if (choice === "de") return NextResponse.redirect(new URL("/de", request.url));
    const country = request.headers.get("x-vercel-ip-country");
    if (country && DACH.has(country)) return NextResponse.redirect(new URL("/de", request.url));
    return NextResponse.next(); // no explicit choice, non-DACH → English
  }

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
    "/",
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/t/:path*",
    "/login",
    "/signup",
  ],
};
