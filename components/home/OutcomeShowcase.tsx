"use client";
import { useEffect, useState } from "react";

// ── "Hire outcomes, not gigs" — the flagship differentiator, playing live ─────
// A client types an outcome -> the AI scopes it into a milestone plan ->
// milestone 1 matches, the rest queue. Auto-loops so a first-time visitor grasps
// the model in one glance. Styled as a precise spec panel, not a glassy demo.

const OUTCOME = "I need an MVP for a habit-tracking app";

const MILESTONES = [
  { title: "UI/UX design, Figma screens", cat: "Design", usd: "$600", state: "Matching now", live: true },
  { title: "Build the app from the designs", cat: "Development", usd: "$2,800", state: "Queued", live: false },
  { title: "QA, bug-fix and launch", cat: "QA", usd: "$400", state: "Queued", live: false },
];

// phase 0 typing · 1 scoping · 2 milestones revealed (held)
export default function OutcomeShowcase() {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (phase !== 0) return;
    setTyped(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(i);
      if (i >= OUTCOME.length) {
        clearInterval(id);
        setTimeout(() => setPhase(1), 550);
      }
    }, 34);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 1) {
      const t = setTimeout(() => setPhase(2), 1500);
      return () => clearTimeout(t);
    }
    if (phase === 2) {
      const t = setTimeout(() => setPhase(0), 4200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="relative w-full rounded-[10px] border border-white/12 bg-[#17160F] p-5 md:p-6 shadow-[0_28px_70px_-34px_rgba(0,0,0,0.9)]">
      <style>{`
        @keyframes os-rise { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes os-dot { 0%,80%,100% { opacity:.2 } 40% { opacity:.9 } }
        @keyframes os-caret { 0%,100% { opacity:0 } 50% { opacity:1 } }
      `}</style>

      {/* Panel header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Outcome intake
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
          {phase === 0 ? "You describe it" : phase === 1 ? "Scoping" : "Milestone plan"}
        </span>
      </div>

      {/* The outcome input */}
      <div className="rounded-[6px] border border-white/10 bg-white/[0.02] p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40 mb-2">The outcome you want</div>
        <p className="text-white text-[14.5px] md:text-[15px] font-medium leading-snug min-h-[2.6em]">
          {OUTCOME.slice(0, typed)}
          {phase === 0 && <span className="inline-block w-[2px] h-[1.05em] -mb-[2px] ml-0.5 bg-white/70" style={{ animation: "os-caret 1s step-end infinite" }} />}
        </p>
      </div>

      {/* Lower region */}
      <div className="mt-4 min-h-[210px]">
        {phase === 1 && (
          <div className="flex flex-col items-center justify-center h-[210px] text-center" style={{ animation: "os-rise .4s ease both" }}>
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-white/70" style={{ animation: `os-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-white/50 max-w-[260px] leading-relaxed">
              Breaking your outcome into an ordered plan. Each milestone handed to one vetted specialist.
            </p>
          </div>
        )}

        {phase === 2 && (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40 mb-3">
              3 milestones, matched in order
            </p>
            <div className="space-y-2">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.title}
                  className={`flex items-center gap-3 rounded-[6px] border px-3.5 py-2.5 ${m.live ? "border-white/20 bg-white/[0.04]" : "border-white/8 bg-white/[0.015]"}`}
                  style={{ animation: `os-rise .5s cubic-bezier(.2,.7,.2,1) both ${0.12 + i * 0.16}s` }}
                >
                  <span className="grid place-items-center h-6 w-6 shrink-0 rounded-[4px] border border-white/12 font-mono text-white/60 text-[11px]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white/85 font-medium truncate">{m.title}</p>
                    <p className="text-[11px] text-white/40">{m.cat} · {m.usd}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${m.live ? "text-emerald-300" : "text-white/40"}`}>
                    {m.live && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    {m.state}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-white/40 mt-3 px-1 leading-relaxed">
              Milestone 1 matches now. The rest match automatically as each is approved.
            </p>
          </div>
        )}

        {phase === 0 && (
          <div className="flex items-center justify-center h-[210px]">
            <p className="text-[12.5px] text-white/30 italic">Not &ldquo;a React developer.&rdquo; The whole outcome.</p>
          </div>
        )}
      </div>
    </div>
  );
}
