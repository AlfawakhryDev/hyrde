"use client";
import { useState } from "react";

// ── Verify your email ────────────────────────────────────────────────
// Six digits, typed once. Runs on our own SendGrid path rather than Supabase
// Auth's confirmation link, so it needs no SMTP configured in a dashboard.
//
// Deliberately not a hard gate. Signup already hands out a session, and
// blocking the pilot client behind a code she has not read yet would cost
// more than the verification is worth today. It nudges; it does not lock.

export default function VerifyEmail({ email, onVerified }: { email: string; onVerified?: () => void }) {
  const [phase, setPhase] = useState<"idle" | "sent" | "done">("idle");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function send() {
    setBusy(true); setError(""); setNote("");
    try {
      const res = await fetch("/api/verify/send", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not send the code."); return; }
      setPhase("sent");
      setNote(`Code sent to ${data.to}. It expires in ${data.expiresInMinutes} minutes.`);
    } catch {
      setError("Could not reach the server.");
    } finally { setBusy(false); }
  }

  async function confirm() {
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/verify/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) { setError(data.error ?? "Could not verify that code."); return; }
      setPhase("done");
      onVerified?.();
    } catch {
      setError("Could not reach the server.");
    } finally { setBusy(false); }
  }

  if (phase === "done") {
    return (
      <div className="rounded-xl border border-border-crisp bg-surface-container/40 p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        <p className="text-[13.5px] text-on-surface">Email verified.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-crisp p-4">
      <p className="text-[13.5px] font-medium text-on-surface mb-1">Verify your email</p>
      <p className="text-[12.5px] text-on-surface-variant mb-3">
        {phase === "sent"
          ? note
          : <>We&apos;ll send a six digit code to <span className="text-on-surface">{email}</span>.</>}
      </p>

      {phase === "sent" && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            aria-label="Six digit verification code"
            className="w-[132px] border border-border-crisp rounded-lg px-3 py-2 text-[15px] tracking-[0.3em] font-mono text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
          />
          <button
            onClick={confirm}
            disabled={busy || code.length !== 6}
            className="h-10 px-5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Verify"}
          </button>
        </div>
      )}

      <button
        onClick={send}
        disabled={busy}
        className={phase === "sent"
          ? "text-[12.5px] text-on-surface-variant hover:text-on-surface underline underline-offset-2 disabled:opacity-60"
          : "h-10 px-5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 disabled:opacity-60"}
      >
        {busy && phase !== "sent" ? "Sending…" : phase === "sent" ? "Send a new code" : "Send me a code"}
      </button>

      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
    </div>
  );
}
