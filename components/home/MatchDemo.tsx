"use client";
import { useEffect, useState } from "react";

// ── The product, playing on a loop ────────────────────────────────────────────
// A client posts a task -> the AI scans interview-vetted specialists -> it assigns
// the single best fit, with a reason. No bidding, no browsing. Styled as a precise
// spec panel to match the rest of the page.

const CANDIDATES = [
  { initial: "S", name: "Sara K.", band: "Strong", score: 91, best: true },
  { initial: "M", name: "Maya R.", band: "Strong", score: 86 },
  { initial: "Y", name: "Youssef A.", band: "Solid", score: 79 },
  { initial: "O", name: "Omar H.", band: "Solid", score: 71 },
];
const BEST = CANDIDATES.findIndex(c => c.best);
const PHASE_MS = [1900, 2500, 3800];

export default function MatchDemo() {
  const [phase, setPhase] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % 3), PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 1) return;
    let i = 0;
    setScan(0);
    const id = setInterval(() => { i = (i + 1) % CANDIDATES.length; setScan(i); }, 380);
    return () => clearInterval(id);
  }, [phase]);

  const phaseLabel = ["Task posted", "Matching", "Matched"][phase];
  const winner = CANDIDATES[BEST];

  return (
    <div className="relative w-full rounded-[10px] border border-white/12 bg-[#17160F] p-5 md:p-6 shadow-[0_28px_70px_-34px_rgba(0,0,0,0.9)]">
      <style>{`
        @keyframes hm-fade { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
        @keyframes hm-pop  { 0% { opacity:0; transform: scale(.97) } 60% { transform: scale(1.01) } 100% { opacity:1; transform: scale(1) } }
        @keyframes hm-dot  { 0%,80%,100% { opacity:.2 } 40% { opacity:.9 } }
        @keyframes hm-draw { to { stroke-dashoffset: 0 } }
        @keyframes hm-ink  { from { opacity:0; transform: rotate(-4deg) translateY(4px) } to { opacity:1; transform: rotate(-4deg) translateY(0) } }
      `}</style>

      {/* Panel header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Matching engine
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35 tabular-nums">{phaseLabel}</span>
      </div>

      {/* Progress rail */}
      <div className="relative h-px w-full bg-white/10 overflow-hidden mb-5">
        <div
          className="absolute inset-y-0 left-0 bg-white/70 transition-[width] duration-500 ease-out"
          style={{ width: phase === 0 ? "18%" : phase === 1 ? "62%" : "100%" }}
        />
      </div>

      {/* Task card — always present */}
      <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-1.5">New client task</div>
        <p className="text-white text-[14.5px] md:text-[15px] font-medium leading-snug">
          Conversion copy for a fintech landing page
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[12px] text-white/50">
          <span className="inline-flex items-center rounded-[4px] border border-white/10 bg-white/[0.04] px-2 py-0.5 text-white/70">Copywriting</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-white/70">$450</span>
          <span aria-hidden="true">·</span>
          <span>Due Aug 3</span>
        </div>
      </div>

      {/* Lower region — swaps per phase */}
      <div key={phase} className="mt-4 min-h-[196px]" style={{ animation: "hm-fade .45s ease both" }}>

        {phase === 0 && (
          <div className="flex flex-col items-center justify-center h-[196px] text-center">
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" style={{ animation: `hm-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-white/50 max-w-[240px] leading-relaxed">
              The AI is reading the brief and pulling every interview-vetted specialist in
              <span className="text-white/80"> Copywriting</span>.
            </p>
          </div>
        )}

        {phase === 1 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-3">Scoring vetted specialists</p>
            <div className="space-y-1.5">
              {CANDIDATES.map((c, i) => {
                const active = i === scan;
                return (
                  <div
                    key={c.name}
                    className={`flex items-center gap-3 rounded-[6px] border px-3 py-2 transition-colors duration-200 ${
                      active ? "border-white/25 bg-white/[0.06]" : "border-white/8 bg-white/[0.015]"
                    }`}
                  >
                    <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full border border-white/15 bg-white/[0.05] text-white/80 text-[12px] font-semibold">
                      {c.initial}
                    </span>
                    <span className="text-[13px] text-white/85 font-medium flex-1 min-w-0 truncate">{c.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-white/40">{c.band}</span>
                    <span className={`text-[13px] font-semibold tabular-nums w-7 text-right ${active ? "text-white" : "text-white/60"}`}>
                      {c.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="relative" style={{ animation: "hm-pop .5s cubic-bezier(.2,.7,.2,1) both" }}>
            {/* handwritten margin note, marked by hand next to the pick */}
            <span
              className="absolute -top-3 right-1 z-10 font-[var(--font-hand)] text-[#E6BC63] text-[17px] leading-none pointer-events-none"
              style={{ fontFamily: "var(--font-hand)", animation: "hm-ink .4s ease .85s both" }}
              aria-hidden="true"
            >
              the one best fit
            </span>
            <div className="rounded-[6px] border border-emerald-400/25 bg-emerald-400/[0.05] p-4">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full border border-white/15 bg-white/[0.06] text-white text-[15px] font-semibold">
                  {winner.initial}
                </span>
                <div className="flex-1 min-w-0">
                  {/* hand-drawn circle around the pick, drawn in after the match lands */}
                  <span className="relative inline-flex items-center gap-1.5">
                    <svg className="pointer-events-none absolute -left-2.5 -right-2.5 -top-1.5 -bottom-1.5 w-[calc(100%+20px)] h-[calc(100%+12px)] text-[#E6BC63]" viewBox="0 0 140 44" preserveAspectRatio="none" aria-hidden="true">
                      <path d="M70 5 C 26 4, 7 13, 6 22 C 5 33, 46 40, 76 39 C 122 38, 135 26, 130 16 C 125 8, 96 5, 60 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: "hm-draw .8s ease .5s forwards" }} />
                    </svg>
                    <p className="text-white text-[14.5px] font-semibold truncate">{winner.name}</p>
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </span>
                  <p className="text-[12px] text-white/55">Copywriting · {winner.band} · {winner.score} vetting score</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Matched
                </span>
              </div>
              <p className="text-[12.5px] text-white/60 leading-relaxed mt-3 border-t border-white/10 pt-3">
                <span className="text-white/80 font-medium">Why Sara.</span> Highest-vetted in Copywriting,
                with fintech landing-page samples in her interview.
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 px-1 text-[12px]">
              <span className="text-white/45">Assigned automatically. No bidding.</span>
              <span className="text-white/70 font-medium">$450 · Due Aug 3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
