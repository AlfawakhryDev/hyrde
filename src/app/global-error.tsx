"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Only reached when the root layout itself fails, so nothing from the app is
// available here (no i18n, no theme, no styles): it must stand on its own.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center", color: "#14121f" }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong.</h1>
        <p dir="rtl" lang="ar" style={{ marginTop: ".25rem" }}>حدث خطأ ما.</p>
        <p style={{ marginTop: "1.5rem" }}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- after a root-layout crash a full page load is the point; <Link> would reuse the broken tree */}
          <a href="/" style={{ color: "#5B4FCF" }}>Reload Hyrde</a>
        </p>
      </body>
    </html>
  );
}
