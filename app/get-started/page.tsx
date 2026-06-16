"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import Turnstile from "@/components/Turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const POSTINGS = ["1–2 roles", "3–5 roles", "6–10 roles", "10+ roles"];
const START = ["Immediately", "Within 2 weeks", "This month", "Next quarter", "Just exploring"];

const VALUE_POINTS = [
  { icon: "bolt",          title: "A vetted shortlist in 60 seconds", body: "Describe the role — our AI returns ~5 ranked, pre-vetted candidates. No sifting 250 applications." },
  { icon: "verified",      title: "Skill proven, not claimed",        body: "Every candidate passes an AI work-sample assessment before they ever reach your shortlist." },
  { icon: "payments",      title: "Pay only when you hire",           body: "Posting, matching and shortlisting are free. A flat 8% success fee — only on a real hire." },
];

const FIELD_CLASS =
  "w-full rounded-xl border border-border-crisp bg-white px-4 py-2.5 text-sm font-body text-tech-blue-deep placeholder-on-surface-variant/40 focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/15 transition";
const LABEL_CLASS = "block text-xs font-semibold font-body text-tech-blue-deep mb-1.5";

export default function GetStartedPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", website: "", country: "",
    postingsPerMonth: "", startTiming: "", rolesNeeded: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const required = form.name && form.email && form.phone && form.company && form.postingsPerMonth && form.startTiming;

  const submit = async () => {
    setError("");
    if (!required) {
      setError("Please complete all required fields.");
      return;
    }
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Please complete the anti-spam check below.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: captchaToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        track("client_signup");
        router.push("/get-started/thanks");
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
            <span className="text-[22px] font-bold font-headline tracking-tight text-tech-blue-deep leading-none">Hyrde</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-electric-violet/10 border border-electric-violet/20 px-3 py-1 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
            <span className="text-[11px] font-semibold font-body text-electric-violet uppercase tracking-widest">Early access — onboarding now</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep leading-tight mb-3">
            Hire vetted talent,<br />matched by AI.
          </h1>
          <p className="font-body text-on-surface-variant text-base leading-relaxed mb-8 max-w-md">
            We&apos;re onboarding a first wave of founding companies. Tell us what you&apos;re hiring for and our team will reach out to activate your account.
          </p>

          <div className="space-y-4">
            {VALUE_POINTS.map(p => (
              <div key={p.title} className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-lg bg-electric-violet/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                </span>
                <div>
                  <p className="text-sm font-bold font-headline text-tech-blue-deep">{p.title}</p>
                  <p className="text-xs font-body text-on-surface-variant leading-relaxed">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: form card ── */}
        <div className="bg-white rounded-2xl border border-border-crisp shadow-sm p-6 md:p-8">
          <h2 className="text-xl font-bold font-headline text-tech-blue-deep mb-1">Request access to hire</h2>
          <p className="text-sm font-body text-on-surface-variant mb-6">Takes 90 seconds. No credit card. We&apos;ll be in touch shortly.</p>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Full name <span className="text-electric-violet">*</span></label>
                <input className={FIELD_CLASS} value={form.name} onChange={e => update("name", e.target.value)} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Work email <span className="text-electric-violet">*</span></label>
                <input type="email" className={FIELD_CLASS} value={form.email} onChange={e => update("email", e.target.value)} placeholder="jane@company.com" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Phone number <span className="text-electric-violet">*</span></label>
                <input type="tel" className={FIELD_CLASS} value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+1 555 000 0000" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Country</label>
                <input className={FIELD_CLASS} value={form.country} onChange={e => update("country", e.target.value)} placeholder="United States" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Company name <span className="text-electric-violet">*</span></label>
                <input className={FIELD_CLASS} value={form.company} onChange={e => update("company", e.target.value)} placeholder="Acme Inc." />
              </div>
              <div>
                <label className={LABEL_CLASS}>Company website</label>
                <input className={FIELD_CLASS} value={form.website} onChange={e => update("website", e.target.value)} placeholder="acme.com" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS}>Roles to hire per month <span className="text-electric-violet">*</span></label>
                <select className={`${FIELD_CLASS} appearance-none cursor-pointer`} value={form.postingsPerMonth} onChange={e => update("postingsPerMonth", e.target.value)}>
                  <option value="" disabled>Select volume…</option>
                  {POSTINGS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>When do you want to start? <span className="text-electric-violet">*</span></label>
                <select className={`${FIELD_CLASS} appearance-none cursor-pointer`} value={form.startTiming} onChange={e => update("startTiming", e.target.value)}>
                  <option value="" disabled>Select timing…</option>
                  {START.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={LABEL_CLASS}>What roles are you hiring for?</label>
              <textarea
                rows={3}
                className={`${FIELD_CLASS} resize-none`}
                value={form.rolesNeeded}
                onChange={e => update("rolesNeeded", e.target.value)}
                placeholder="e.g. Senior React engineer, product designer, growth marketer…"
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
                  Request early access
                </>
              )}
            </button>

            <p className="text-[11px] font-body text-on-surface-variant/70 text-center leading-relaxed">
              By requesting access you agree to be contacted about Hyrde. We&apos;ll never share your details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
