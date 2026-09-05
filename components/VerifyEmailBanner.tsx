"use client";
import { useEffect, useRef, useState } from "react";

// ── "Confirm your email" ─────────────────────────────────────────────
// Signup issues a session immediately, so the first thing someone sees after
// joining is their dashboard, not a dead end. This is the reminder that their
// address is still unconfirmed, and it is also what sends the code.
//
// Asking for the code here rather than at signup is deliberate. At signup the
// request raced the session cookie and was fire-and-forget, so a failure was
// invisible — and it never ran at all for Google/GitHub/Microsoft signups. By
// the time this mounts the page has already been server-rendered from a valid
// session, and anything that goes wrong is shown instead of swallowed.
//
// The send is idempotent server-side: a code already waiting is left alone, so
// a reload cannot invalidate the one being typed.

export default function VerifyEmailBanner({ email }: { email: string }) {
  const [hidden, setHidden] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const asked = useRef(false);

  async function send(resend: boolean) {
    setError("");
    if (resend) { setBusy(true); setNote(""); }
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "We could not send the code."); return; }
      setNote(data.pending ? "A code is already in your inbox." : `Code sent to ${data.to}.`);
    } catch {
      setError("We could not reach the server to send your code.");
    } finally {
      if (resend) setBusy(false);
    }
  }

  // Strict Mode mounts twice in dev; the ref keeps that to one request.
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void send(false);
  }, []);

  async function confirm() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/verify/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) { setError(data.error ?? "Could not verify that code."); return; }
      setDone(true);
    } catch { setError("Could not reach the server."); }
    finally { setBusy(false); }
  }

  if (hidden) return null;

  if (done) {
    return (
      <div className="mb-6 rounded-xl border border-emerald-600/30 bg-emerald-500/[0.06] px-4 py-3 flex items-center gap-2.5">
        <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <p className="text-[13.5px] text-on-surface">Email confirmed. Thanks.</p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/[0.07] px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="material-symbols-outlined text-amber-600" style={{ fontSize: "18px" }}>mark_email_unread</span>
        <p className="text-[13.5px] text-on-surface flex-1 min-w-[220px]">
          Confirm your email. We sent a six digit code to <span className="font-medium">{email}</span>.
        </p>
        <button
          onClick={() => setHidden(true)}
          aria-label="Dismiss"
          className="text-on-surface-variant hover:text-on-surface"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <input
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          aria-label="Six digit verification code"
          className="w-[124px] border border-border-crisp rounded-lg px-3 py-1.5 text-[15px] tracking-[0.28em] font-mono text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
        />
        <button
          onClick={confirm}
          disabled={busy || code.length !== 6}
          className="h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Checking…" : "Confirm"}
        </button>
        <button
          onClick={() => send(true)}
          disabled={busy}
          className="text-[12.5px] text-on-surface-variant hover:text-on-surface underline underline-offset-2 disabled:opacity-60"
        >
          Send a new code
        </button>
      </div>

      {note && <p className="text-[12.5px] text-on-surface-variant mt-2">{note}</p>}
      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
    </div>
  );
}
