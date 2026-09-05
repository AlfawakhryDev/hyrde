"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabaseBrowser } from "@/lib/supabase/client";
import CallScheduler from "@/components/task/CallScheduler";

// ── "Book a call with <freelancer>" ──────────────────────────────────────────
// NOT BookDemo. A demo sells Hyrde; this books the client onto a call with the
// ONE vetted specialist we matched to their plan. The request carries who,
// what project, which milestone, and the audited site, so whoever schedules it
// has everything without chasing the client.
//
// Modal is portalled to <body> for the same reason BookDemo is: ancestors with
// backdrop-filter would otherwise capture a fixed overlay.

export type CallTarget = {
  freelancerId: string;
  freelancerName: string;
  milestone?: string;
  projectTitle?: string;
  siteUrl?: string;
  planSummary?: string;
  budgetUsd?: number;
};

const field =
  "w-full border border-border-crisp rounded-xl px-3.5 py-2.5 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface transition-colors";
const label = "block text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-1.5 font-medium";

export default function BookCall({ target, className = "" }: { target: CallTarget; className?: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  /** Set once the request exists, so the client can pick times immediately. */
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Add your name and a valid email so we can send the invite.");
      return;
    }
    setBusy(true);
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: created, error: insErr } = await supabase.from("call_requests").insert({
      client_id: user?.id ?? null,
      freelancer_id: target.freelancerId,
      freelancer_name: target.freelancerName,
      project_title: target.projectTitle ?? null,
      milestone: target.milestone ?? null,
      site_url: target.siteUrl ?? null,
      plan_summary: target.planSummary ?? null,
      budget_usd: target.budgetUsd ?? null,
      contact_name: name,
      contact_email: email,
      note: String(fd.get("note") ?? "").trim() || null,
      // Their IANA zone, so both sides can later see each other's local time.
      client_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).select("id").single();
    setBusy(false);
    if (insErr || !created) { setError("Could not send that. Try again or email hello@hyrde.net."); return; }
    setRequestId(created.id as string);
    setDone(true);
  }

  const modal = (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label={`Book a call with ${target.freelancerName}`}
    >
      <div
        className="w-full sm:max-w-md bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-1.5">
              When suits you for {target.freelancerName.split(" ")[0]}?
            </h2>
            <p className="text-sm text-on-surface-variant max-w-[38ch] mx-auto mb-6">
              Pick the times that suit you and we&apos;ll lock one in. They get your plan beforehand, so you
              won&apos;t have to explain it.
            </p>
            {requestId && (
              <div className="text-left">
                <CallScheduler
                  callRequestId={requestId}
                  slots={[]}
                  freelancerName={target.freelancerName}
                  freelancerTimezone={null}
                  canPropose
                  canConfirm={false}
                  scheduledAt={null}
                />
              </div>
            )}
            <button onClick={() => setOpen(false)} className="mt-6 h-10 px-6 rounded-full border border-border-crisp text-on-surface text-sm font-medium hover:border-outline">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">
                Call with {target.freelancerName}
              </h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-4">
              A short intro call to confirm scope and start. We send them your plan beforehand, so the call is
              about the work, not a briefing.
            </p>

            {(target.milestone || target.siteUrl) && (
              <div className="rounded-xl border border-border-crisp bg-surface-container/40 p-3 mb-5">
                {target.projectTitle && <p className="text-[12.5px] font-medium text-on-surface">{target.projectTitle}</p>}
                {target.milestone && <p className="text-[12px] text-on-surface-variant mt-0.5">Starting with: {target.milestone}</p>}
                {target.siteUrl && <p className="text-[12px] text-on-surface-variant mt-0.5 break-all">{target.siteUrl}</p>}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="bc-name" className={label}>Your name *</label>
                <input id="bc-name" name="name" required className={field} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="bc-email" className={label}>Email for the invite *</label>
                <input id="bc-email" name="email" type="email" required className={field} autoComplete="email" placeholder="you@company.com" />
              </div>
              <div>
                <label htmlFor="bc-note" className={label}>Anything they should know?</label>
                <textarea id="bc-note" name="note" rows={3} className={`${field} resize-y`} placeholder="Optional. Deadlines, must-haves, anything off limits." />
              </div>
            </div>

            {error && <p className="text-sm text-error mt-4">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full h-12 rounded-full bg-on-surface text-inverse-on-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {busy ? "Sending…" : `Request the call`}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setDone(false); setError(""); }}
        className={className || "inline-flex items-center h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-semibold hover:opacity-90 transition-opacity"}
      >
        Book a call with {target.freelancerName.split(" ")[0]}
      </button>
      {open && typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
