"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { IMPERSONATION_COOKIE } from "@/lib/impersonation";

// ── "You are not you" ────────────────────────────────────────────────
// The whole risk of a support session is forgetting you are in one and taking
// an action the account owner did not ask for. So this is deliberately the
// loudest thing on the page: full width, top of the viewport, above every
// modal, and not dismissable. Annoyance is the point.
//
// It carries no authority — the session cookie does. This only reads a marker
// and says out loud what that session is.

export default function ImpersonationBanner() {
  const [who, setWho] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      const m = document.cookie.match(new RegExp(`(?:^|; )${IMPERSONATION_COOKIE}=([^;]+)`));
      setWho(m ? decodeURIComponent(m[1]) : null);
    };
    read();
    const id = setInterval(read, 5000);
    return () => clearInterval(id);
  }, []);

  if (!who) return null;

  async function end() {
    await fetch("/api/admin/impersonate", { method: "DELETE" }).catch(() => {});
    await supabaseBrowser().auth.signOut().catch(() => {});
    // A full page load on purpose, not router.push: it discards every piece of
    // in-memory state that belonged to the borrowed session.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-[200] bg-amber-500 text-[#1a1200] px-4 py-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] font-medium shadow-lg"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "17px" }} aria-hidden="true">
        visibility
      </span>
      <span>
        Support session. You are signed in as <strong>{who}</strong>, not yourself.
        Anything you do here is done as them.
      </span>
      <button
        onClick={end}
        className="h-7 px-3 rounded-full bg-[#1a1200] text-amber-400 text-[12px] font-semibold hover:opacity-90"
      >
        End session
      </button>
    </div>
  );
}
