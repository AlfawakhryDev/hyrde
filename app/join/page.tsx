"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import Turnstile from "@/components/Turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const EXPERIENCE = ["Less than 1 year", "1–3 years", "3–5 years", "5+ years"];

const VALUE_POINTS = [
  { icon: "payments",  title: "Free forever — keep 100%",        body: "No connects, no proposals, no pay-to-apply. Clients pay the 8% fee, never you." },
  { icon: "bolt",      title: "Jobs come to you",                 body: "Your AI agent scans new briefs and pitches you automatically. No bidding, ever." },
  { icon: "verified",  title: "Get matched on proven skill",      body: "Stand out with an AI-verified profile instead of fighting 250 other applicants." },
];

const FIELD_CLASS =
  "w-full rounded-xl border border-border-crisp bg-white px-4 py-2.5 text-sm font-body text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/15 transition";
const LABEL_CLASS = "block text-xs font-semibold font-body text-on-surface mb-1.5";

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", skill: "", experience: "", phone: "", location: "",
    portfolio: "", knowsClients: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const required = form.name && form.email && form.skill;

  const submit = async () => {
    setError("");
    if (!required) {
      setError("Please fill in your name, email, and main skill.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the anti-spam check below.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/freelancer-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        track("freelancer_signup");
        router.push("/join/thanks");
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSaving(false);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-gray pt-16">
      <div className="max-w-[1180px] mx-auto px-6 md:px-12 py-12 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-start">

        {/* ── Left: value panel ── */}
        <div className="lg:sticky lg:top-24">
          <Link href="/" className="inline-flex items-center gap-2 mb-7">
            <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-[11px] ai-match-gradient shadow-[0_4px_14px_rgba(91,79,207,0.35)]">
              <svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true">
                <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                  <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
                </g>
                <circle cx="256" cy="256" r="32" fill="#fff" />
              </svg>
            </span>
            <span className="text-[22px] font-bold font-headline tracking-tight text-on-surface leading-none">Hyrde</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-electric-violet/10 border border-electric-violet/20 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
            <span className="text-[11px] font-semibold font-body text-electric-violet uppercase tracking-widest">Free to join — onboarding now</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-headline text-on-surface leading-tight mb-3">
            Get hired by AI,<br />not by bidding.
          </h1>
          <p className="font-body text-on-surface-variant text-base leading-relaxed mb-8 max-w-md">
            Join the first wave of founding freelancers. Tell us what you do and your AI agent starts bringing the right jobs to you — no proposals to send, ever.
          </p>

          <div className="space-y-4">
            {VALUE_POINTS.map(p => (
              <div key={p.title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-electric-violet/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                </span>
                <div>
                  <p className="text-sm font-bold font-headline text-on-surface">{p.title}</p>
                  <p className="text-xs font-body text-on-surface-variant leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form card ── */}
        <div className="bg-white rounded-2xl border border-border-crisp shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold font-headline text-on-surface mb-1">Join as a freelancer</h2>
          <p className="text-sm font-body text-on-surface-variant mb-6">Takes 60 seconds. Free forever. No credit card.</p>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Full name <span className="text-electric-violet">*</span></label>
                <input className={FIELD_CLASS} value={form.name} onChange={e => update("name", e.target.value)} placeholder="Sara Rahman" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Email <span className="text-electric-violet">*</span></label>
                <input type="email" className={FIELD_CLASS} value={form.email} onChange={e => update("email", e.target.value)} placeholder="sara@example.com" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Your main skill <span className="text-electric-violet">*</span></label>
                <input className={FIELD_CLASS} value={form.skill} onChange={e => update("skill", e.target.value)} placeholder="e.g. React developer, UX designer" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Experience</label>
                <select className={`${FIELD_CLASS} appearance-none cursor-pointer`} value={form.experience} onChange={e => update("experience", e.target.value)}>
                  <option value="" disabled>Select…</option>
                  {EXPERIENCE.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Phone number</label>
                <input type="tel" className={FIELD_CLASS} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Location</label>
                <input className={FIELD_CLASS} value={form.location} onChange={e => update("location", e.target.value)} placeholder="Cairo, Egypt / Remote" />
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>Portfolio or LinkedIn</label>
              <input className={FIELD_CLASS} value={form.portfolio} onChange={e => update("portfolio", e.target.value)} placeholder="https://…" />
            </div>

            <div className="rounded-xl border border-electric-violet/25 bg-electric-violet/5 p-4">
              <label className={LABEL_CLASS}>
                Know any companies that are hiring?
                <span className="ml-1.5 font-normal text-on-surface-variant normal-case">Refer them — we&apos;ll do the rest.</span>
              </label>
              <textarea
                rows={2}
                className={`${FIELD_CLASS} resize-none`}
                value={form.knowsClients}
                onChange={e => update("knowsClients", e.target.value)}
                placeholder="Company name + who to reach (optional). Help us grow the pool of jobs for everyone."
              />
            </div>

            {TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken("")}
              />
            )}

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <span className="material-symbols-outlined text-red-500" style={{ fontSize: "16px" }}>error</span>
                <p className="text-xs font-body text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-electric-violet text-white font-semibold font-body text-sm py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: "16px" }}>progress_activity</span>
                  Submitting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Join free
                </>
              )}
            </button>

            <p className="text-[11px] font-body text-on-surface-variant/70 text-center leading-relaxed">
              By joining you agree to be contacted about Hyrde. We&apos;ll never share your details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
