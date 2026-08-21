import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import ws from "ws";
import { LOCALE_COOKIE } from "@/lib/i18n";

// Refreshes the Supabase auth session on every matched request and keeps the
// auth cookies in sync between the browser and the server. Also gates the
// app area (/dashboard, /onboarding, /t) behind a session.
//
// Next 16 renamed the `middleware` convention to `proxy` (same API).
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // German-default: a first-time visitor to the root gets the German homepage.
  // Anyone who explicitly picked English (hyrde_locale=en, set by the language
  // switcher) keeps the English root. Handled before the auth logic since `/`
  // is public; reversible by dropping "/" from the matcher below.
  if (path === "/") {
    if (request.cookies.get(LOCALE_COOKIE)?.value === "en") return NextResponse.next();
    return NextResponse.redirect(new URL("/de", request.url));
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
