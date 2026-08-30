"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Profile } from "@/lib/arena";

type PrivateRow = { user_id: string; phone: string | null; notify_matches: boolean } | null;

// Public fields live on `profiles` (world-readable — shown next to your work).
// Phone + notification prefs live on `profile_private` (owner-only RLS).
export default function ProfileClient({
  userId,
  email,
  initialProfile,
  initialPrivate,
}: {
  userId: string;
  email: string;
  initialProfile: Profile & {
    headline?: string | null; company?: string | null; website?: string | null;
    country?: string | null; city?: string | null;
  };
  initialPrivate: PrivateRow;
}) {
  const isPilot = initialProfile.mode === "pilot";

  const [name, setName] = useState(initialProfile.display_name ?? "");
  const [headline, setHeadline] = useState(initialProfile.headline ?? "");
  const [company, setCompany] = useState(initialProfile.company ?? "");
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [website, setWebsite] = useState(initialProfile.website ?? "");
  const [country, setCountry] = useState(initialProfile.country ?? "");
  const [city, setCity] = useState(initialProfile.city ?? "");
  const [phone, setPhone] = useState(initialPrivate?.phone ?? "");
  const [notify, setNotify] = useState(initialPrivate?.notify_matches ?? true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true); setError(""); setSaved(false);
    const supabase = supabaseBrowser();
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from("profiles").update({
        display_name: name.trim() || email.split("@")[0],
        headline: headline.trim() || null,
        company: company.trim() || null,
        bio: bio.trim() || null,
        website: website.trim() || null,
        country: country.trim() || null,
        city: city.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq("id", userId),
      supabase.from("profile_private").upsert({
        user_id: userId,
        phone: phone.trim() || null,
        notify_matches: notify,
        updated_at: new Date().toISOString(),
      }),
    ]);
    if (e1 || e2) setError((e1 ?? e2)!.message);
    else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    setBusy(false);
  }

  const input =
    "w-full border border-border-crisp rounded-lg px-4 py-3 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10";
  const label = "text-[13px] font-medium text-on-surface";
  const hint = "text-[12px] text-on-surface-variant mt-1";

  const Section = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
    <section className="pt-10 mt-10 border-t border-border-crisp grid md:grid-cols-[220px_1fr] gap-6">
      <div>
        <h2 className="text-[15px] font-medium text-on-surface">{title}</h2>
        {sub && <p className="text-[12.5px] text-on-surface-variant mt-1.5 leading-relaxed">{sub}</p>}
      </div>
      <div className="flex flex-col gap-5 max-w-[440px]">{children}</div>
    </section>
  );

  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12">
      <Link href="/dashboard" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
        <span aria-hidden="true">←</span> Back to dashboard
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-4 mt-8">
        <div>
          <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.035em] leading-none text-on-surface">Profile</h1>
          <p className="text-[14px] text-on-surface-variant mt-3">
            {isPilot
              ? "What clients see next to your matched work. Plus how we reach you."
              : "What freelancers see on your tasks. Plus how we reach you."}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border-crisp text-xs font-medium text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-violet" aria-hidden="true" />
          {isPilot ? "Freelancer account" : "Client account"} · {email}
        </span>
      </div>

      <Section title="Identity" sub="Public. Shown wherever your name appears.">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Display name</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={input} />
        </label>
        {isPilot ? (
          <label className="flex flex-col gap-1.5">
            <span className={label}>Headline</span>
            <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. Conversion copywriter. Fintech & SaaS" className={input} />
            <span className={hint}>One line clients see next to your vetting badge.</span>
          </label>
        ) : (
          <label className="flex flex-col gap-1.5">
            <span className={label}>Company</span>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company or team name" className={input} />
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={label}>Bio</span>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            placeholder={isPilot ? "A few sentences about the work you do best. The AI also uses this to match you." : "A few sentences about what you're building."}
            className={`${input} resize-y`} />
          {isPilot && <span className={hint}>The matching engine reads this. Specifics get you better-fit work.</span>}
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={label}>Website</span>
          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://…" className={input} />
        </label>
      </Section>

      <Section title="Location" sub="Public. Helps with timezone expectations.">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className={label}>Country</span>
            <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Egypt" className={input} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={label}>City</span>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Cairo" className={input} />
          </label>
        </div>
      </Section>

      <Section title="Contact" sub="Private. Only you can see this. Never shown publicly.">
        <label className="flex flex-col gap-1.5">
          <span className={label}>Phone <span className="ml-1.5 rounded-full bg-surface-container px-2 py-0.5 text-[10.5px] font-semibold text-on-surface-variant uppercase tracking-wide">Private</span></span>
          <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+20 1x xxx xxxx" className={input} autoComplete="tel" />
        </label>
      </Section>

      <Section title="Notifications" sub="So you never miss work.">
        <button
          type="button"
          role="switch"
          aria-checked={notify}
          onClick={() => setNotify(n => !n)}
          className="flex items-center justify-between gap-4 rounded-xl border border-border-crisp px-4 py-3.5 text-left hover:border-outline transition-colors"
        >
          <span>
            <span className="block text-[14px] font-medium text-on-surface">Email me when work is matched to me</span>
            <span className="block text-[12.5px] text-on-surface-variant mt-0.5">
              The moment the AI assigns {isPilot ? "you a task" : "your task"}, you get an email with the pay, deadline, and link.
            </span>
          </span>
          <span className={`relative shrink-0 w-10 h-6 rounded-full transition-colors ${notify ? "bg-electric-violet" : "bg-surface-container-high"}`} aria-hidden="true">
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notify ? "translate-x-[18px]" : "translate-x-0.5"}`} />
          </span>
        </button>
      </Section>

      <div className="flex items-center gap-4 pt-10 mt-10 border-t border-border-crisp">
        <button
          onClick={save}
          disabled={busy}
          className="h-11 px-7 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
        {saved && <span className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400">Saved ✓</span>}
        {error && <span className="text-[13px] text-error">{error}</span>}
      </div>
    </div>
  );
}
