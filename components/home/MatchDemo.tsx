"use client";
import { useEffect, useState } from "react";

// ── The product, playing on a loop ────────────────────────────────────────────
// A client posts a task → the AI scans interview-vetted specialists → it assigns
// the single best fit, with a reason. No bidding, no browsing. This is what the
// homepage sells, shown rather than told.

const CANDIDATES = [
  { initial: "S", name: "Sara K.", band: "Strong", score: 91, best: true },
  { initial: "M", name: "Maya R.", band: "Strong", score: 86 },
  { initial: "Y", name: "Youssef A.", band: "Solid", score: 79 },
  { initial: "O", name: "Omar H.", band: "Solid", score: 71 },
];
const BEST = CANDIDATES.findIndex(c => c.best);

// phase 0 = task posted, 1 = matching, 2 = matched
const PHASE_MS = [1900, 2500, 3800];

export default function MatchDemo() {
  const [phase, setPhase] = useState(0);
  const [scan, setScan] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase(p => (p + 1) % 3), PHASE_MS[phase]);
    return () => clearTimeout(t);
  }, [phase]);

  // Sweep the "reading" highlight down the candidate list during matching.
  useEffect(() => {
    if (phase !== 1) return;
    let i = 0;
    setScan(0);
    const id = setInterval(() => { i = (i + 1) % CANDIDATES.length; setScan(i); }, 380);
    return () => clearInterval(id);
  }, [phase]);

  const phaseLabel = ["Task posted", "Matching…", "Matched"][phase];
  const winner = CANDIDATES[BEST];

  return (
    <div className="relative w-full rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-sm p-5 md:p-6 shadow-[0_24px_80px_-24px_rgba(91,79,207,0.5)]">
      <style>{`
        @keyframes hm-fade { from { opacity:0; transform: translateY(8px) } to { opacity:1; transform:none } }
        @keyframes hm-pop  { 0% { opacity:0; transform: scale(.96) } 60% { transform: scale(1.015) } 100% { opacity:1; transform: scale(1) } }
        @keyframes hm-dot  { 0%,80%,100% { opacity:.25 } 40% { opacity:1 } }
        @keyframes hm-flow { 0% { left:-30% } 100% { left:130% } }
      `}</style>

      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-white/45 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Hyrde matching engine
        </span>
        <span className="text-[11px] font-medium text-white/40 tabular-nums">{phaseLabel}</span>
      </div>

      {/* Progress rail */}
      <div className="relative h-[3px] w-full rounded-full bg-white/10 overflow-hidden mb-5">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#A99EE8] to-[#7C6FE0] transition-[width] duration-500 ease-out"
          style={{ width: phase === 0 ? "18%" : phase === 1 ? "62%" : "100%" }}
        />
      </div>

      {/* Task card — the anchor, always present */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#A99EE8] font-semibold mb-1.5">
          <span className="material-symbols-outlined text-[14px]" style={{ fontSize: "14px" }}>bolt</span>
          New client task
        </div>
        <p className="text-white text-[14.5px] md:text-[15px] font-medium leading-snug">
          Conversion copy for a fintech landing page
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2.5 text-[12px] text-white/50">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-white/70">Copywriting</span>
          <span aria-hidden="true">·</span>
          <span className="font-medium text-white/70">$450</span>
          <span aria-hidden="true">·</span>
          <span>Due Aug 3</span>
        </div>
      </div>

      {/* ── Lower region — swaps per phase (keyed to replay the entrance) ── */}
      <div key={phase} className="mt-4 min-h-[196px]" style={{ animation: "hm-fade .45s ease both" }}>

        {phase === 0 && (
          <div className="flex flex-col items-center justify-center h-[196px] text-center">
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-2 w-2 rounded-full bg-[#A99EE8]"
                  style={{ animation: `hm-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-white/55 max-w-[240px] leading-relaxed">
              The AI is reading the brief and pulling every interview-vetted specialist in
              <span className="text-white/80"> Copywriting</span>.
            </p>
          </div>
        )}

        {phase === 1 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2.5">
              Scoring vetted specialists
            </p>
            <div className="space-y-1.5">
              {CANDIDATES.map((c, i) => {
                const active = i === scan;
                return (
                  <div
                    key={c.name}
                    className={`relative flex items-center gap-3 rounded-xl border px-3 py-2 overflow-hidden transition-colors duration-200 ${
                      active ? "border-[#A99EE8]/50 bg-white/[0.07]" : "border-white/8 bg-white/[0.02]"
                    }`}
                  >
                    {active && (
                      <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#A99EE8]/15 to-transparent"
                        style={{ animation: "hm-flow 1s linear infinite" }} />
                    )}
                    <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[#6D5FD6] to-[#A99EE8] text-white text-[12px] font-semibold">
                      {c.initial}
                    </span>
                    <span className="text-[13px] text-white/85 font-medium flex-1 min-w-0 truncate">{c.name}</span>
                    <span className="text-[11px] text-white/45">{c.band}</span>
                    <span className={`text-[13px] font-semibold tabular-nums w-7 text-right ${active ? "text-[#C4BBF2]" : "text-white/70"}`}>
                      {c.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === 2 && (
          <div style={{ animation: "hm-pop .5s cubic-bezier(.2,.7,.2,1) both" }}>
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4">
              <div className="flex items-center gap-3">
                <span className="grid place-items-center h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-[#6D5FD6] to-[#A99EE8] text-white text-[15px] font-semibold">
                  {winner.initial}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-[14.5px] font-semibold truncate">{winner.name}</p>
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <p className="text-[12px] text-white/55">Copywriting · {winner.band} · {winner.score} vetting score</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-400/15 text-emerald-300 text-[11px] font-semibold px-2.5 py-1">
                  Matched
                </span>
              </div>
              <p className="text-[12.5px] text-white/60 leading-relaxed mt-3 border-t border-white/10 pt-3">
                <span className="text-white/80 font-medium">Why Sara</span>. Highest-vetted in Copywriting,
                with fintech landing-page samples in her interview.
              </p>
            </div>
            <div className="flex items-center justify-between mt-3 px-1 text-[12px]">
              <span className="text-white/45">Assigned automatically. No bidding</span>
              <span className="text-white/70 font-medium">$450 · Due Aug 3</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
