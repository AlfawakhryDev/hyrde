"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "./I18nProvider";
import { SlotPicker, inZone } from "@/components/task/CallScheduler";

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
  /** Chosen in the form itself, so requesting a call and picking a time is one step. */
  const [picked, setPicked] = useState<string[]>([]);
  // Prefilled from the signed-in account. They already told us who they are at
  // signup; asking again on the way to a call is friction for no information.
  const [me, setMe] = useState<{ name: string; email: string } | null>(null);
  const t = useT();

  // Loaded on MOUNT, not when the modal opens. Fetching on open meant the
  // required name/email fields rendered first and only disappeared once the
  // request came back, so the client still saw a form asking for details we
  // already had. By the time they click, this is resolved.
  useEffect(() => {
    let cancelled = false;
    // Never trap someone behind a spinner: if the lookup is slow or fails,
    // fall back to asking rather than showing a skeleton forever.
    const giveUp = setTimeout(() => { if (!cancelled) setMe(m => m ?? { name: "", email: "" }); }, 3000);
    (async () => {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { if (!cancelled) { clearTimeout(giveUp); setMe({ name: "", email: "" }); } return; }
      const { data: prof } = await supa
        .from("profiles").select("display_name").eq("id", user.id).maybeSingle();
      if (cancelled) return;
      clearTimeout(giveUp);
      setMe({
        name: (prof?.display_name as string | undefined)?.trim()
          || (user.user_metadata?.full_name as string | undefined)
          || "",
        email: user.email ?? "",
      });
    })();
    return () => { cancelled = true; clearTimeout(giveUp); };
  }, []);
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
    const name = (String(fd.get("name") ?? "").trim() || me?.name || "").trim();
    const email = (String(fd.get("email") ?? "").trim() || me?.email || "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Add your name and a valid email so we can send the invite.");
      return;
    }
    if (!picked.length) {
      setError(t("call.pickOne"));
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
    const id = created.id as string;
    await supabase.from("call_slots").insert(
      picked.map(iso => ({ call_request_id: id, starts_at: iso })),
    );
    setRequestId(id);
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
        className="w-full sm:max-w-md bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 app-sheet overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {done ? (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-1.5">
              Sent. {target.freelancerName.split(" ")[0]} will confirm a time.
            </h2>
            <p className="text-sm text-on-surface-variant max-w-[38ch] mx-auto mb-4">
              {target.freelancerName.split(" ")[0]} confirms one of your times and you&apos;ll both get the
              invite. They get your plan beforehand, so you won&apos;t have to explain it.
            </p>
            <div className="text-left rounded-xl border border-border-crisp p-3.5 mb-2">
              <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-2">{t("call.offered")}</p>
              <ul className="flex flex-col gap-1">
                {picked.map(iso => (
                  <li key={iso} className="text-[13px] text-on-surface">
                    {inZone(iso, Intl.DateTimeFormat().resolvedOptions().timeZone)}
                  </li>
                ))}
              </ul>
            </div>
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
              {me === null ? (
                <div className="rounded-xl border border-border-crisp bg-surface-container/40 p-3">
                  <div className="h-3 w-24 rounded bg-surface-container animate-pulse mb-2" />
                  <div className="h-3.5 w-48 rounded bg-surface-container animate-pulse" />
                </div>
              ) : me.email ? (
                <div className="rounded-xl border border-border-crisp bg-surface-container/40 p-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-1">{t("call.inviteGoesTo")}</p>
                  <p className="text-[13.5px] text-on-surface">
                    {me.name ? `${me.name} · ` : ""}{me.email}
                  </p>
                  <input type="hidden" name="email" value={me.email} />
                  {/* Only one input may carry `name`, or FormData reads the
                      first and we would submit an empty string. */}
                  {me.name
                    ? <input type="hidden" name="name" value={me.name} />
                    : <input name="name" required className={`${field} mt-2`} autoComplete="name" placeholder={t("call.yourName")} />}
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="bc-name" className={label}>{t("call.yourName")}</label>
                    <input id="bc-name" name="name" required className={field} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="bc-email" className={label}>{t("call.yourEmail")}</label>
                    <input id="bc-email" name="email" type="email" required className={field} autoComplete="email" placeholder="you@company.com" />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="bc-note" className={label}>{t("call.anythingElse")}</label>
                <textarea id="bc-note" name="note" rows={3} className={`${field} resize-y`} placeholder={t("call.anythingElsePh")} />
              </div>

              {/* Picking a time is part of asking for the call, not a second
                  step afterwards. Stored as UTC; rendered in each side's zone. */}
              <div>
                <label className={label}>{t("call.whenSuits")}</label>
                <SlotPicker picked={picked} onChange={setPicked} />
              </div>
            </div>

            {error && <p className="text-sm text-error mt-4">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full h-12 rounded-full bg-on-surface text-inverse-on-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {busy ? t("call.sending") : t("call.request")}
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
