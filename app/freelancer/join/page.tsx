"use client";
import { useState } from "react";
import Link from "next/link";
import { SKILLS } from "@/lib/data";
import { SKILL_ASSESSMENT } from "@/content/marketing";
import { getRateFloor, risingTalentTasks } from "@/lib/services";
import type { SkillAssessmentResult, ParsedCV } from "@/lib/types";
import CvUpload from "@/components/CvUpload";

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { num: 1, label: "Basics"     },
  { num: 2, label: "Your skill" },
  { num: 3, label: "Prove it"   },
  { num: 4, label: "Your rate"  },
  { num: 5, label: "Done"       },
];

function bandColor(score: number) {
  if (score >= 90) return "text-electric-violet bg-electric-violet/10 border-electric-violet/20";
  if (score >= 75) return "text-on-surface bg-surface-container-high border-border-crisp";
  if (score >= 60) return "text-on-surface bg-surface-container-high border-border-crisp";
  return "text-on-surface-variant bg-surface-container-high border-border-crisp";
}

export default function FreelancerJoin() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    name: "", email: "", skill: "", rate: "", location: "", bio: "", portfolio: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [, setCvParsed] = useState<ParsedCV | null>(null);

  const handleCvParsed = (cv: ParsedCV) => {
    setCvParsed(cv);
    setForm(f => ({
      ...f,
      name:      cv.name      || f.name,
      email:     cv.email     || f.email,
      location:  cv.location  || f.location,
      bio:       cv.bio       || f.bio,
      portfolio: cv.portfolio || f.portfolio,
      skill:     cv.skill && SKILLS[cv.skill] ? cv.skill : f.skill,
      rate:      cv.rate      || f.rate,
    }));
  };

  // ── Assessment state ──
  const [sample, setSample] = useState("");
  const [assessing, setAssessing] = useState(false);
  const [assessError, setAssessError] = useState("");
  const [assessment, setAssessment] = useState<SkillAssessmentResult | null>(null);

  const next = () => setStep(s => Math.min(s + 1, 5) as Step);
  const back = () => setStep(s => Math.max(s - 1, 1) as Step);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const category = form.skill ? SKILLS[form.skill]?.category ?? "Engineering" : "Engineering";
  const challenge = SKILL_ASSESSMENT.challenges[category] ?? SKILL_ASSESSMENT.challenges.Engineering;

  const runAssessment = async () => {
    if (sample.trim().length < (challenge.minChars ?? 100)) return;
    setAssessing(true);
    setAssessError("");
    setAssessment(null);
    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: form.skill, sample }),
      });
      const data = await res.json();
      if (res.ok && data.assessment) setAssessment(data.assessment);
      else setAssessError(data.error ?? "Couldn't evaluate right now — try again.");
    } catch {
      setAssessError("Network error. Check your connection.");
    } finally {
      setAssessing(false);
    }
  };

  const submitProfile = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/freelancers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, assessment: assessment ?? undefined }),
      });
      if (res.status === 409) {
        setStep(5);
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "Something went wrong. Try again.");
      } else {
        setStep(5);
      }
    } catch {
      setSaveError("Network error. Check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const floor = form.skill ? getRateFloor(form.skill, "remote") : 0;

  return (
    <div className="min-h-screen bg-surface-gray flex items-start justify-center px-4 py-14">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-[11px] ai-match-gradient shadow-[0_4px_14px_rgba(91,79,207,0.35)]">
              <svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true">
                <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                  <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
                </g>
                <circle cx="256" cy="256" r="32" fill="#fff" />
              </svg>
            </span>
            <span className="text-[22px] font-bold font-headline tracking-tight text-on-surface leading-none">
              Hyrde
            </span>
          </Link>
          <p className="font-body text-on-surface-variant text-sm">Join free. Prove your skill. Keep 100%.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-body transition-colors shrink-0 ${
                step > s.num  ? "bg-electric-violet text-white"     :
                step === s.num ? "bg-tech-blue-deep text-white"     :
                "bg-surface-container-highest text-on-surface-variant"
              }`}>
                {step > s.num
                  ? <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>check</span>
                  : s.num
                }
              </div>
              <span className={`text-xs font-body hidden sm:block transition-colors ${
                step === s.num ? "text-on-surface font-semibold" : "text-on-surface-variant"
              }`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px transition-colors ${step > s.num ? "bg-electric-violet" : "bg-border-crisp"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-border-crisp p-6 shadow-sm">

          {/* Step 1 — Basics */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-1">Let&apos;s start with the basics</h2>
              <p className="font-body text-sm text-on-surface-variant mb-5">Takes 2 minutes. No reviews, no credit card.</p>
              <CvUpload onParsed={handleCvParsed} className="mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border-crisp" />
                <span className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest shrink-0">or fill manually</span>
                <div className="flex-1 h-px bg-border-crisp" />
              </div>
              <div className="space-y-4">
                {[
                  { key: "name",     type: "text",  label: "Full name",      placeholder: "Sara Rahman"         },
                  { key: "email",    type: "email", label: "Email address",  placeholder: "sara@example.com"    },
                  { key: "location", type: "text",  label: "Location",       placeholder: "Cairo, Egypt / Remote" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => update(f.key, e.target.value)}
                      className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/30"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Skill */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-1">What&apos;s your main skill?</h2>
              <p className="font-body text-sm text-on-surface-variant mb-5">We&apos;ll tailor your work sample and match you to the right jobs.</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {Object.entries(SKILLS).slice(0, 12).map(([slug, s]) => (
                  <button key={slug} onClick={() => update("skill", slug)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-xs font-body transition-colors ${
                      form.skill === slug
                        ? "border-electric-violet bg-electric-violet/10 text-electric-violet font-semibold"
                        : "border-border-crisp text-on-surface-variant hover:border-electric-violet/40"
                    }`}>
                    {s.label}
                    <span className="block text-[10px] mt-0.5 opacity-60">${s.avgRate}/hr avg</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Short bio (2–3 sentences)
                </label>
                <textarea rows={3}
                  placeholder="e.g. Senior React developer, 6 years. Ex-startup. Shipped 3 SaaS products from 0→1."
                  value={form.bio} onChange={e => update("bio", e.target.value)}
                  className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet bg-surface-gray/30 resize-none" />
              </div>
            </div>
          )}

          {/* Step 3 — Prove it (AI Skill Assessment) */}
          {step === 3 && (
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 text-electric-violet text-[10px] font-semibold font-body uppercase tracking-widest mb-3">
                <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                {SKILL_ASSESSMENT.intro.eyebrow}
              </span>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-1">{challenge.title}</h2>
              <p className="font-body text-sm text-on-surface-variant mb-4">
                A short work sample for {SKILLS[form.skill]?.label ?? "your skill"}. There&apos;s no pass or fail — a lower score still gets you in.
              </p>

              {/* The challenge */}
              <div className="bg-surface-gray rounded-lg p-4 border border-border-crisp mb-4">
                <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-1.5">Your task</p>
                <p className="text-sm font-body text-on-surface leading-relaxed">{challenge.prompt}</p>
              </div>

              {!assessment && (
                <>
                  <textarea rows={6}
                    placeholder={challenge.placeholder}
                    value={sample} onChange={e => setSample(e.target.value)}
                    className="w-full border border-border-crisp rounded-lg px-4 py-3 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet bg-surface-gray/30 resize-none" />
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs font-body text-on-surface-variant">
                      {sample.trim().length < challenge.minChars
                        ? `Write at least ${challenge.minChars} characters (${sample.trim().length})`
                        : `${sample.trim().length} characters — ready to review`}
                    </p>
                  </div>
                  {assessError && <p className="text-xs font-body text-red-500 mt-2">{assessError}</p>}
                  <button onClick={runAssessment}
                    disabled={sample.trim().length < challenge.minChars || assessing}
                    className="w-full mt-3 bg-tech-blue-deep text-white font-semibold font-body py-3 rounded-full text-sm hover:scale-[0.99] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {assessing
                      ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> AI is reviewing your work…</>
                      : <><span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span> Submit for AI review</>
                    }
                  </button>
                  <p className="text-[11px] font-body text-on-surface-variant/70 text-center mt-2">
                    {SKILL_ASSESSMENT.intro.reassurance[1]}
                  </p>
                </>
              )}

              {/* Verified profile result */}
              {assessment && (
                <div className="animate-[fadeIn_0.3s_ease]">
                  <div className={`rounded-xl border p-5 mb-3 ${bandColor(assessment.score)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <span className="text-sm font-bold font-headline text-on-surface">Verified profile</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold font-headline text-on-surface leading-none">{assessment.score}</span>
                        <span className="text-xs font-body text-on-surface-variant">/100</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold font-body bg-white/70 px-2.5 py-1 rounded-full">{assessment.band}</span>
                      <span className="text-xs font-body text-on-surface-variant">{assessment.bandBlurb}</span>
                    </div>
                    <p className="text-sm font-body text-on-surface leading-relaxed mb-3">{assessment.summary}</p>

                    {assessment.verifiedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {assessment.verifiedSkills.map(s => (
                          <span key={s} className="text-[11px] font-body bg-white/70 text-on-surface px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 text-xs font-body">
                      {assessment.strengths.length > 0 && (
                        <div>
                          <p className="font-semibold text-on-surface mb-1">Strengths</p>
                          <ul className="space-y-0.5 text-on-surface-variant">
                            {assessment.strengths.map(s => <li key={s}>· {s}</li>)}
                          </ul>
                        </div>
                      )}
                      {assessment.growthAreas.length > 0 && (
                        <div>
                          <p className="font-semibold text-on-surface mb-1">Grow next</p>
                          <ul className="space-y-0.5 text-on-surface-variant">
                            {assessment.growthAreas.map(s => <li key={s}>· {s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => { setAssessment(null); setSample(""); }}
                    className="text-xs font-semibold font-body text-on-surface-variant hover:text-electric-violet transition-colors">
                    ↺ Re-take the assessment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Rate */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold font-headline text-on-surface mb-1">Set your rate</h2>
              <p className="font-body text-sm text-on-surface-variant mb-5">
                {form.skill && SKILLS[form.skill]
                  ? `Market average for ${SKILLS[form.skill].label}: $${SKILLS[form.skill].avgRate}/hr · protected floor $${floor}/hr`
                  : "You can update this anytime."}
              </p>
              <div className="mb-5">
                <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">Hourly rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body text-sm">$</span>
                  <input type="number" placeholder="75"
                    value={form.rate} onChange={e => update("rate", e.target.value)}
                    className="w-full border border-border-crisp rounded-lg pl-8 pr-12 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet bg-surface-gray/30" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-body text-xs">/hr</span>
                </div>

                {form.rate && form.skill && SKILLS[form.skill] && (() => {
                  const rate = Number(form.rate);
                  const belowFloor = rate < floor;
                  const belowMarket = rate < SKILLS[form.skill].avgRate * 0.8;
                  if (belowFloor) {
                    return (
                      <div className="mt-2 text-xs font-body px-3 py-2 rounded-lg flex items-start gap-2 bg-error-container text-on-error-container border border-error/30">
                        <span className="material-symbols-outlined mt-0.5" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>shield</span>
                        Below Hyrde&apos;s protected floor of ${floor}/hr for {SKILLS[form.skill].label}s. We set minimum rates per skill so work stays fair — please raise it to at least ${floor}/hr.
                      </div>
                    );
                  }
                  return (
                    <div className={`mt-2 text-xs font-body px-3 py-2 rounded-lg flex items-center gap-2 ${
                      belowMarket
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : "bg-electric-violet/5 text-electric-violet border border-electric-violet/20"
                    }`}>
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                        {belowMarket ? "trending_up" : "check_circle"}
                      </span>
                      {belowMarket
                        ? `Above the floor — but you could aim for the $${SKILLS[form.skill].avgRate}/hr market average`
                        : `Competitive rate for ${SKILLS[form.skill].label}s`
                      }
                    </div>
                  );
                })()}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">Portfolio URL (optional)</label>
                <input type="url" placeholder="https://yourportfolio.com"
                  value={form.portfolio} onChange={e => update("portfolio", e.target.value)}
                  className="w-full border border-border-crisp rounded-lg px-4 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet bg-surface-gray/30" />
              </div>

              <div className="bg-surface-gray rounded-lg p-4 border border-border-crisp">
                <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-3">On a $5,000 project</p>
                <div className="flex justify-between text-xs font-body mb-1.5">
                  <span className="text-on-surface-variant">Legacy platforms take 20% from you</span>
                  <span className="text-red-500 font-semibold">−$1,000</span>
                </div>
                <div className="flex justify-between text-xs font-body">
                  <span className="text-on-surface-variant">Hyrde takes from you</span>
                  <span className="text-electric-violet font-semibold">$0</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border-crisp flex justify-between text-xs font-semibold">
                  <span className="text-on-surface">You keep</span>
                  <span className="text-electric-violet">$5,000 — all of it</span>
                </div>
                <p className="mt-2 text-[11px] font-body text-on-surface-variant leading-relaxed">Hiring is free for clients during early access, and freelancers never pay a fee — you keep 100%.</p>
              </div>
            </div>
          )}

          {/* Step 5 — Success */}
          {step === 5 && (
            <div className="py-2">
              <div className="text-center">
                <div className="w-16 h-16 ai-match-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "32px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">You&apos;re in.</h2>
                <p className="font-body text-sm text-on-surface-variant mb-5 max-w-xs mx-auto">
                  {form.name ? `Welcome, ${form.name.split(" ")[0]}. ` : ""}
                  Your AI agent is already scanning open briefs and will pitch you automatically — no bidding, ever.
                </p>
              </div>

              {/* Verified profile chip */}
              {assessment && (
                <div className="bg-electric-violet/5 rounded-lg p-4 border border-electric-violet/20 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
                      <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                      Verified · {assessment.band}
                    </span>
                    <span className="text-sm font-bold font-headline text-on-surface">{assessment.score}/100</span>
                  </div>
                </div>
              )}

              <div className="bg-surface-gray rounded-lg p-4 border border-border-crisp text-left mb-5">
                <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">Profile summary</p>
                {form.skill && SKILLS[form.skill] && (
                  <div className="flex justify-between text-xs font-body py-1.5 border-b border-border-crisp">
                    <span className="text-on-surface-variant">Skill</span>
                    <span className="font-semibold text-on-surface">{SKILLS[form.skill].label}</span>
                  </div>
                )}
                {form.rate && (
                  <div className="flex justify-between text-xs font-body py-1.5 border-b border-border-crisp">
                    <span className="text-on-surface-variant">Rate</span>
                    <span className="font-semibold text-on-surface">${form.rate}/hr</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-body py-1.5">
                  <span className="text-on-surface-variant">Your platform fee</span>
                  <span className="font-semibold text-electric-violet">$0 — you always keep 100%</span>
                </div>
              </div>

              {/* Rising-talent auditions */}
              <div className="mb-5">
                <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">
                  Rising-talent auditions · real, paid trial tasks
                </p>
                <div className="space-y-2">
                  {risingTalentTasks(form.skill).slice(0, 2).map(task => (
                    <div key={task.id} className="flex items-center justify-between bg-white rounded-lg border border-border-crisp p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold font-body text-on-surface truncate">{task.title}</p>
                        <p className="text-[11px] font-body text-on-surface-variant truncate">{task.blurb}</p>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <p className="text-sm font-bold font-headline text-electric-violet">${task.payUsd}</p>
                        <p className="text-[10px] font-body text-on-surface-variant">~{task.estimateHours}h</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/jobs"
                  className="flex-1 text-center bg-electric-violet text-white font-semibold font-body px-6 py-3 rounded-full text-sm hover:scale-[1.02] transition-transform">
                  Browse open jobs
                </Link>
                <Link href="/"
                  className="flex-1 text-center bg-white border border-border-crisp text-on-surface font-semibold font-body px-6 py-3 rounded-full text-sm hover:border-electric-violet transition-colors">
                  Back to Hyrde
                </Link>
              </div>
            </div>
          )}

          {/* Nav */}
          {step < 5 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-crisp">
              {step > 1
                ? <button onClick={back} className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">Back</button>
                : <div />
              }
              <div className="flex flex-col items-end gap-1">
                {saveError && <p className="text-xs font-body text-red-500">{saveError}</p>}
                {step === 3 && !assessment && (
                  <button onClick={next} className="text-xs font-body text-on-surface-variant hover:text-electric-violet transition-colors mb-1">
                    Skip for now — I&apos;ll prove it later
                  </button>
                )}
                <button
                  onClick={step === 4 ? submitProfile : next}
                  disabled={
                    (step === 1 && (!form.name || !form.email)) ||
                    (step === 2 && !form.skill) ||
                    saving
                  }
                  className="bg-electric-violet text-white font-semibold font-body px-6 py-2.5 rounded-full text-sm hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed">
                  {step === 4 ? (saving ? "Saving…" : "Join Hyrde") : step === 3 && assessment ? "Continue" : "Continue"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs font-body text-on-surface-variant mt-4">
          Already a member?{" "}
          <Link href="#" className="text-electric-violet hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
