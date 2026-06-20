"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { SKILLS } from "@/lib/data";
import type { Job } from "@/lib/types";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function inferCategory(brief: string): string {
  const lower = brief.toLowerCase();
  if (/react|vue|angular|next|typescript|javascript|node|python|backend|api|devops|mobile|ios|android/.test(lower)) return "Engineering";
  if (/design|ux|ui|figma|brand|logo|motion/.test(lower)) return "Design";
  if (/data|analytics|ml|ai|machine learning|model|pipeline/.test(lower)) return "Data";
  if (/copy|content|writing|blog|seo|article/.test(lower)) return "Writing";
  if (/marketing|growth|social|ads|campaign/.test(lower)) return "Marketing";
  return "General";
}

interface PitchState {
  open: boolean;
  name: string;
  skill: string;
  bio: string;
  loading: boolean;
  text: string;
  copied: boolean;
}

const defaultPitch: PitchState = {
  open: false, name: "", skill: "", bio: "",
  loading: false, text: "", copied: false,
};

export default function JobBoard({ jobs }: { jobs: Job[] }) {
  const [pitches, setPitches] = useState<Record<string, PitchState>>({});
  const readerRefs = useRef<Record<string, ReadableStreamDefaultReader>>({});

  function getPitch(id: string): PitchState {
    return pitches[id] ?? { ...defaultPitch };
  }

  function setPitch(id: string, update: Partial<PitchState>) {
    setPitches(prev => ({
      ...prev,
      [id]: { ...(prev[id] ?? defaultPitch), ...update },
    }));
  }

  async function generatePitch(job: Job) {
    const p = getPitch(job.id);
    if (!p.name.trim()) return;
    setPitch(job.id, { loading: true, text: "", copied: false });

    try {
      const res = await fetch("/api/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief: job.brief,
          name: p.name,
          skill: SKILLS[p.skill]?.label || p.skill || "Freelancer",
          bio: p.bio,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      readerRefs.current[job.id] = reader;
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setPitch(job.id, { text: full, loading: false });
      }
    } catch {
      setPitch(job.id, {
        text: "Couldn't generate proposal. Check that ANTHROPIC_API_KEY is set in .env.local.",
        loading: false,
      });
    }
  }

  async function copyPitch(id: string) {
    const text = getPitch(id).text;
    await navigator.clipboard.writeText(text);
    setPitch(id, { copied: true });
    setTimeout(() => setPitch(id, { copied: false }), 2000);
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-surface-gray flex flex-col items-center justify-center px-6 py-24 text-center">
        <span className="material-symbols-outlined text-electric-violet mb-4" style={{ fontSize: "48px" }}>
          work_outline
        </span>
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">No jobs posted yet</h2>
        <p className="font-body text-on-surface-variant mb-6">Be the first client to post a project.</p>
        <Link href="/post-job"
          className="bg-electric-violet text-white font-semibold font-body px-7 py-3 rounded-full hover:scale-[1.02] transition-transform text-sm">
          Post a project
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-gray">
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 text-electric-violet text-xs font-semibold font-body mb-3">
              <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                fiber_manual_record
              </span>
              {jobs.filter(j => j.status === "open").length} live projects
            </span>
            <h1 className="text-4xl font-bold font-headline text-on-surface">Open projects</h1>
            <p className="font-body text-on-surface-variant mt-1">Write an AI proposal in seconds. No connects, no fees to apply.</p>
          </div>
          <Link href="/post-job"
            className="bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full text-sm hover:scale-[0.97] transition-transform whitespace-nowrap">
            Post a project
          </Link>
        </div>

        {/* Job list */}
        <div className="space-y-4">
          {jobs.map(job => {
            const p = getPitch(job.id);
            const category = inferCategory(job.brief);

            return (
              <div key={job.id} className="bg-white rounded-xl border border-border-crisp overflow-hidden">
                {/* Job card */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-on-surface text-sm leading-relaxed line-clamp-2">
                        {job.brief}
                      </p>
                    </div>
                    <button
                      onClick={() => setPitch(job.id, { open: !p.open })}
                      className={`shrink-0 text-xs font-semibold font-body px-4 py-2 rounded-full border transition-colors ${
                        p.open
                          ? "bg-electric-violet text-white border-electric-violet"
                          : "border-electric-violet text-electric-violet hover:bg-electric-violet/5"
                      }`}>
                      {p.open ? "Close" : "Write a pitch"}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-semibold font-body bg-electric-violet/10 text-electric-violet px-2.5 py-0.5 rounded-full">
                      {category}
                    </span>
                    {job.budget !== "unspecified" && (
                      <span className="text-xs font-body text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full">
                        {job.budget}
                      </span>
                    )}
                    <span className="text-xs font-body text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>schedule</span>
                      {timeAgo(job.postedAt)}
                    </span>
                    {job.matchCount > 0 && (
                      <span className="text-xs font-body text-on-surface-variant flex items-center gap-1">
                        <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        {job.matchCount} AI matches
                      </span>
                    )}
                  </div>
                </div>

                {/* Pitch writer panel */}
                {p.open && (
                  <div className="border-t border-border-crisp bg-surface-gray/50 p-5">
                    <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-4">
                      AI Proposal Writer
                    </p>

                    <div className="grid sm:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">
                          Your name *
                        </label>
                        <input
                          type="text"
                          placeholder="Sara Rahman"
                          value={p.name}
                          onChange={e => setPitch(job.id, { name: e.target.value })}
                          className="w-full border border-border-crisp rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-electric-violet bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">
                          Your skill
                        </label>
                        <select
                          value={p.skill}
                          onChange={e => setPitch(job.id, { skill: e.target.value })}
                          className="w-full border border-border-crisp rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-electric-violet bg-white">
                          <option value="">Select skill...</option>
                          {Object.entries(SKILLS).map(([slug, s]) => (
                            <option key={slug} value={slug}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">
                          One-liner bio
                        </label>
                        <input
                          type="text"
                          placeholder="5 yrs React, ex-Stripe"
                          value={p.bio}
                          onChange={e => setPitch(job.id, { bio: e.target.value })}
                          className="w-full border border-border-crisp rounded-lg px-3 py-2 text-sm font-body focus:outline-none focus:border-electric-violet bg-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => generatePitch(job)}
                      disabled={!p.name.trim() || p.loading}
                      className="bg-electric-violet text-white font-semibold font-body px-5 py-2.5 rounded-full text-sm hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed mb-4">
                      {p.loading
                        ? "Writing..."
                        : p.text ? "Regenerate" : "Generate proposal"}
                    </button>

                    {/* Streaming output */}
                    {(p.loading || p.text) && (
                      <div className="bg-white rounded-xl border border-border-crisp p-4">
                        {p.loading && !p.text && (
                          <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
                            <div className="w-4 h-4 border-2 border-electric-violet border-t-transparent rounded-full animate-spin" />
                            AI is writing your proposal...
                          </div>
                        )}
                        {p.text && (
                          <>
                            <p className="text-sm font-body text-on-surface leading-relaxed whitespace-pre-wrap">
                              {p.text}
                              {p.loading && (
                                <span className="inline-block w-0.5 h-4 bg-electric-violet ml-0.5 animate-pulse" />
                              )}
                            </p>
                            {!p.loading && (
                              <div className="flex gap-3 mt-4 pt-3 border-t border-border-crisp">
                                <button
                                  onClick={() => copyPitch(job.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold font-body text-electric-violet hover:underline">
                                  <span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>
                                    {p.copied ? "check_circle" : "content_copy"}
                                  </span>
                                  {p.copied ? "Copied!" : "Copy proposal"}
                                </button>
                                <Link href="/freelancer/join"
                                  className="flex items-center gap-1.5 text-xs font-semibold font-body text-on-surface hover:underline">
                                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>person_add</span>
                                  Create your profile to apply
                                </Link>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        <div className="bg-tech-blue-deep rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold font-headline text-white mb-1">Are you a client?</h2>
            <p className="font-body text-on-primary-container text-sm">Post your project and get 5 AI-matched candidates in 60 seconds.</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/post-job"
              className="px-7 py-3 bg-electric-violet text-white rounded-full text-sm font-semibold font-body hover:scale-[1.02] transition-transform whitespace-nowrap">
              Post a project
            </Link>
            <Link href="/hire"
              className="px-7 py-3 border border-white/30 text-white rounded-full text-sm font-semibold font-body hover:bg-white/10 transition-colors whitespace-nowrap">
              Browse talent
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
