"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// "Book a demo" — one component, three placements. The trigger button is styled
// by `variant`; clicking it opens a modal that captures the request into
// public.demo_requests (public insert, admin-only read). Impossible to miss:
// the navbar button, a big hero button, and a floating always-on-screen button
// all reuse this.

type Variant = "nav" | "hero" | "float";

const TRIGGER: Record<Variant, string> = {
  nav: "inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-electric-violet text-white text-[13px] font-semibold hover:bg-[#4a3fc7] transition-colors shadow-[0_2px_12px_rgba(91,79,207,0.35)]",
  hero: "inline-flex items-center gap-2 h-[52px] px-7 rounded-full bg-electric-violet text-white text-[15px] font-semibold hover:bg-[#4a3fc7] transition-colors shadow-[0_10px_34px_-6px_rgba(91,79,207,0.6)]",
  float:
    "fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2 h-[52px] pl-5 pr-6 rounded-full bg-electric-violet text-white text-[14.5px] font-semibold shadow-[0_12px_40px_-6px_rgba(91,79,207,0.7)] hover:bg-[#4a3fc7] hover:scale-[1.03] transition-all animate-floaty",
};

const labelCls = "block text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-1.5 font-medium";
const fieldCls =
  "w-full border border-border-crisp rounded-xl px-3.5 py-2.5 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet transition-colors";

export default function BookDemo({ variant = "nav", label = "Book a demo" }: { variant?: Variant; label?: string }) {
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
      setError("Please add your name and a valid email.");
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
    if (error) { setError("Something went wrong. Please try again or email hello@hyrde.net."); return; }
    setDone(true);
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setDone(false); setError(""); }} className={TRIGGER[variant]}>
        {variant === "float" && <span className="material-symbols-outlined" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>event</span>}
        {label}
      </button>

      {open && (
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
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-1.5">Thanks — you&apos;re on the list.</h2>
                <p className="text-sm text-on-surface-variant max-w-[34ch] mx-auto">We&apos;ll reach out to schedule your demo, usually within a day.</p>
                <button onClick={() => setOpen(false)} className="mt-6 h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90">Close</button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <div className="flex items-center justify-between mb-1.5">
                  <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">Book a demo</h2>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <p className="text-[13px] text-on-surface-variant mb-5">A quick walkthrough of how Hyrde matches vetted specialists to your work. Leave your details and we&apos;ll set up a time.</p>

                <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
                  <label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="bd-name" className={labelCls}>Name *</label>
                    <input id="bd-name" name="name" required className={fieldCls} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="bd-email" className={labelCls}>Work email *</label>
                    <input id="bd-email" name="email" type="email" required className={fieldCls} autoComplete="email" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label htmlFor="bd-company" className={labelCls}>Company</label>
                    <input id="bd-company" name="company" className={fieldCls} autoComplete="organization" />
                  </div>
                  <div>
                    <label htmlFor="bd-note" className={labelCls}>What do you want to see?</label>
                    <textarea id="bd-note" name="note" rows={3} className={`${fieldCls} resize-y`} placeholder="Optional — the tasks or outcomes you're considering." />
                  </div>
                </div>

                {error && <p className="text-sm text-error mt-4">{error}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="mt-6 w-full h-12 rounded-full bg-electric-violet text-white text-sm font-semibold hover:bg-[#4a3fc7] transition-colors disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Request my demo"}
                </button>
                <p className="text-[11.5px] text-on-surface-variant mt-3 text-center">By requesting, you agree we may contact you about your demo.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
