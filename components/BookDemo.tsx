"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "./I18nProvider";

// "Book a demo" — one component, two placements. The trigger button is styled
// by `variant`; clicking it opens a modal that captures the request into
// public.demo_requests (public insert, admin-only read). Colours follow the
// page's neutral tokens (on-surface / border-crisp), never the brand violet.
//
// The modal is portalled to <body>: the navbar pill uses backdrop-blur (a
// backdrop-filter), which would otherwise make this fixed overlay position
// relative to the pill instead of the viewport — that was the "buggy navbar"
// where the modal opened clipped up near the top.

type Variant = "nav" | "hero";

const TRIGGER: Record<Variant, string> = {
  // Outlined neutral pill — distinct from the filled Sign-up button, sits calmly in the pill nav.
  nav: "inline-flex items-center h-8 px-3.5 rounded-full border border-border-crisp text-on-surface text-[13px] font-semibold hover:bg-surface-container transition-colors",
  // On the dark hero: a clear outlined-white CTA, prominent without a second solid pill next to it.
  hero: "inline-flex items-center gap-2 h-[52px] px-7 rounded-full border border-white/30 text-white text-[15px] font-semibold hover:bg-white/10 transition-colors",
};

const labelCls = "block text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-1.5 font-medium";
const fieldCls =
  "w-full border border-border-crisp rounded-xl px-3.5 py-2.5 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface transition-colors";

export default function BookDemo({ variant = "nav", label }: { variant?: Variant; label?: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const data = new FormData(e.currentTarget);
    if ((data.get("website") as string)?.trim()) { setDone(true); return; } // honeypot
    const name = (data.get("name") as string).trim();
    const email = (data.get("email") as string).trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("book.errValidate"));
      return;
    }
    setBusy(true);
    const { error } = await supabaseBrowser().from("demo_requests").insert({
      name,
      email,
      company: (data.get("company") as string).trim() || null,
      note: (data.get("note") as string).trim() || null,
      source: variant,
    });
    setBusy(false);
    if (error) { setError(t("book.errGeneric")); return; }
    setDone(true);
  }

  const modal = (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Book a demo"
    >
      <div
        className="w-full sm:max-w-md bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-4 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-1.5">{t("book.doneTitle")}</h2>
            <p className="text-sm text-on-surface-variant max-w-[34ch] mx-auto">{t("book.doneBody")}</p>
            <button onClick={() => setOpen(false)} className="mt-6 h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90">{t("book.close")}</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">{t("book.title")}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={t("book.close")} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-5">{t("book.blurb")}</p>

            <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
              <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="bd-name" className={labelCls}>{t("book.name")}</label>
                <input id="bd-name" name="name" required className={fieldCls} autoComplete="name" />
              </div>
              <div>
                <label htmlFor="bd-email" className={labelCls}>{t("book.email")}</label>
                <input id="bd-email" name="email" type="email" required className={fieldCls} autoComplete="email" placeholder={t("book.emailPh")} />
              </div>
              <div>
                <label htmlFor="bd-company" className={labelCls}>{t("book.company")}</label>
                <input id="bd-company" name="company" className={fieldCls} autoComplete="organization" />
              </div>
              <div>
                <label htmlFor="bd-note" className={labelCls}>{t("book.see")}</label>
                <textarea id="bd-note" name="note" rows={3} className={`${fieldCls} resize-y`} placeholder={t("book.seePh")} />
              </div>
            </div>

            {error && <p className="text-sm text-error mt-4">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full h-12 rounded-full bg-on-surface text-inverse-on-surface text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {busy ? t("book.sending") : t("book.submit")}
            </button>
            <p className="text-[11.5px] text-on-surface-variant mt-3 text-center">{t("book.agree")}</p>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setDone(false); setError(""); }} className={TRIGGER[variant]}>
        {label ?? t("book.cta")}
      </button>
      {open && typeof document !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}
