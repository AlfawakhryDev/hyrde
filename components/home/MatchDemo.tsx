"use client";
import { useEffect, useState } from "react";
import SketchCard from "./SketchCard";

// ── The product, playing on a loop ────────────────────────────────────────────
// Post a task -> the AI scans vetted specialists -> it assigns the single best
// fit, marked by hand. Drawn as a paper sketch card that tilts to the cursor.

const MARKER = "#B5651D"; // ochre marker for hand annotations on paper

const CANDIDATES = [
  { initial: "S", name: "Sara K.", band: "Strong", score: 91, best: true },
  { initial: "M", name: "Maya R.", band: "Strong", score: 86 },
  { initial: "Y", name: "Youssef A.", band: "Solid", score: 79 },
  { initial: "O", name: "Omar H.", band: "Solid", score: 71 },
];
const BEST = CANDIDATES.findIndex(c => c.best);
const PHASE_MS = [1900, 2500, 4200];

export default function MatchDemo() {
  const [phase, setPhase] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % 3), PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 1) return;
    let i = 0; setScan(0);
    const id = setInterval(() => { i = (i + 1) % CANDIDATES.length; setScan(i); }, 380);
    return () => clearInterval(id);
  }, [phase]);

  const phaseLabel = ["task posted", "matching", "matched"][phase];
  const winner = CANDIDATES[BEST];

  return (
    <SketchCard rotate={1.2}>
      <style>{`
        @keyframes hm-fade { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
        @keyframes hm-pop  { 0% { opacity:0; transform: scale(.97) } 60% { transform: scale(1.01) } 100% { opacity:1; transform: scale(1) } }
        @keyframes hm-dot  { 0%,80%,100% { opacity:.25 } 40% { opacity:.9 } }
        @keyframes hm-draw { to { stroke-dashoffset: 0 } }
        @keyframes hm-ink  { from { opacity:0; transform: rotate(-4deg) translateY(4px) } to { opacity:1; transform: rotate(-4deg) translateY(0) } }
      `}</style>

      {/* Header — handwritten title, no status dot */}
      <div className="flex items-end justify-between mb-4 pb-3 border-b border-[#DAD6C8]">
        <span className="text-[#1A1A14] text-[22px] leading-none" style={{ fontFamily: "var(--font-hand)" }}>Matching engine</span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8A8677] tabular-nums">{phaseLabel}</span>
      </div>

      {/* Progress rail */}
      <div className="relative h-px w-full bg-[#DAD6C8] overflow-hidden mb-5">
        <div className="absolute inset-y-0 left-0 bg-[#1A1A14] transition-[width] duration-500 ease-out"
          style={{ width: phase === 0 ? "18%" : phase === 1 ? "62%" : "100%" }} />
      </div>

      {/* Task card */}
      <div className="rounded-[3px] border border-[#DAD6C8] bg-[#FCFBF4] p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#8A8677] mb-1.5">new client task</div>
        <p className="text-[#1A1A14] text-[14.5px] md:text-[15px] font-medium leading-snug">Conversion copy for a fintech landing page</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[12px] text-[#8A8677]">
          <span className="inline-flex items-center rounded-[3px] border border-[#CFCBBC] px-2 py-0.5 text-[#57564A]">Copywriting</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-[#57564A]">$450</span>
          <span aria-hidden="true">·</span>
          <span>Due Aug 3</span>
        </div>
      </div>

      {/* Lower region */}
      <div key={phase} className="mt-4 min-h-[196px]" style={{ animation: "hm-fade .45s ease both" }}>
        {phase === 0 && (
          <div className="flex flex-col items-center justify-center h-[196px] text-center">
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#1A1A14]" style={{ animation: `hm-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-[#6B6A5E] max-w-[240px] leading-relaxed">
              Reading the brief and pulling every interview-vetted specialist in <span className="text-[#1A1A14] font-medium">Copywriting</span>.
            </p>
          </div>
        )}

        {phase === 1 && (
          <div>
            <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8A8677] mb-3">scoring vetted specialists</p>
            <div className="space-y-1.5">
              {CANDIDATES.map((c, i) => {
                const active = i === scan;
                return (
                  <div key={c.name} className={`flex items-center gap-3 rounded-[3px] border px-3 py-2 transition-colors duration-200 ${active ? "border-[#1A1A14]/35 bg-[#FCFBF4]" : "border-[#E2DFD3] bg-transparent"}`}>
                    <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full border border-[#CFCBBC] bg-[#FCFBF4] text-[#57564A] text-[12px] font-semibold">{c.initial}</span>
                    <span className="text-[13px] text-[#1A1A14] font-medium flex-1 min-w-0 truncate">{c.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#8A8677]">{c.band}</span>
                    <span className={`text-[13px] font-semibold tabular-nums w-7 text-right ${active ? "text-[#1A1A14]" : "text-[#8A8677]"}`}>{c.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="relative" style={{ animation: "hm-pop .5s cubic-bezier(.2,.7,.2,1) both" }}>
            <span className="absolute -top-3 right-1 z-10 text-[17px] leading-none pointer-events-none" style={{ fontFamily: "var(--font-hand)", color: MARKER, animation: "hm-ink .4s ease .85s both" }} aria-hidden="true">
              the one best fit
            </span>
            <div className="rounded-[3px] border border-emerald-700/30 bg-emerald-700/[0.06] p-4">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full border border-[#CFCBBC] bg-[#FCFBF4] text-[#1A1A14] text-[15px] font-semibold">{winner.initial}</span>
                <div className="flex-1 min-w-0">
                  <span className="relative inline-flex items-center gap-1.5">
                    <svg className="pointer-events-none absolute -left-2.5 -right-2.5 -top-1.5 -bottom-1.5 w-[calc(100%+20px)] h-[calc(100%+12px)]" viewBox="0 0 140 44" preserveAspectRatio="none" aria-hidden="true" style={{ color: MARKER }}>
                      <path d="M70 5 C 26 4, 7 13, 6 22 C 5 33, 46 40, 76 39 C 122 38, 135 26, 130 16 C 125 8, 96 5, 60 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: "hm-draw .8s ease .5s forwards" }} />
                    </svg>
                    <p className="text-[#1A1A14] text-[14.5px] font-semibold truncate">{winner.name}</p>
                    <span className="material-symbols-outlined text-emerald-700 text-[16px]" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </span>
                  <p className="text-[12px] text-[#6B6A5E]">Copywriting · {winner.band} · {winner.score} vetting score</p>
                </div>
                <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-emerald-700">matched</span>
              </div>
              <p className="text-[12.5px] text-[#57564A] leading-relaxed mt-3 border-t border-[#D6D9CC] pt-3">
                <span className="text-[#1A1A14] font-medium">Why Sara.</span> Highest-vetted in Copywriting, with fintech landing-page samples in her interview.
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 px-1 text-[12px]">
              <span className="text-[#8A8677]">Assigned automatically. No bidding.</span>
              <span className="text-[#57564A] font-medium">$450 · Due Aug 3</span>
            </div>
          </div>
        )}
      </div>
    </SketchCard>
  );
}
