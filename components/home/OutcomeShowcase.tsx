"use client";
import { useEffect, useState } from "react";

// ── "Hire outcomes, not gigs" — the flagship differentiator, playing live ─────
// A client types an outcome → the AI scopes it into a milestone plan →
// milestone 1 matches, the rest queue. Auto-loops (no interaction needed) so
// a first-time visitor / investor grasps the model in one glance.

const OUTCOME = "I need an MVP for a habit-tracking app";

const MILESTONES = [
  { title: "UI/UX design. Figma screens", cat: "Design", usd: "$600", state: "Matching now", tone: "violet" },
  { title: "Build the app from the designs", cat: "Development", usd: "$2,800", state: "Queued", tone: "muted" },
  { title: "QA, bug-fix & launch", cat: "QA", usd: "$400", state: "Queued", tone: "muted" },
];

// phase 0 typing · 1 scoping · 2 milestones revealed (held)
export default function OutcomeShowcase() {
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState(0);

  // Type the outcome out, then advance.
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

  // Scoping → reveal → hold → loop.
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
    <div className="relative w-full rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-sm p-5 md:p-6 shadow-[0_24px_80px_-24px_rgba(91,79,207,0.5)]">
      <style>{`
        @keyframes os-rise { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes os-dot { 0%,80%,100% { opacity:.25 } 40% { opacity:1 } }
        @keyframes os-flow { 0% { left:-30% } 100% { left:130% } }
      `}</style>

      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-white/45 font-medium">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Hyrde. Outcome intake
        </span>
        <span className="text-[11px] font-medium text-white/40">
          {phase === 0 ? "You describe it" : phase === 1 ? "AI scoping…" : "Milestone plan"}
        </span>
      </div>

      {/* The outcome input */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#A99EE8] font-semibold mb-2">
          <span className="material-symbols-outlined text-[14px]" style={{ fontSize: "14px" }}>target</span>
          The outcome you want
        </div>
        <p className="text-white text-[14.5px] md:text-[15px] font-medium leading-snug min-h-[2.6em]">
          {OUTCOME.slice(0, typed)}
          {phase === 0 && <span className="text-electric-violet">▍</span>}
        </p>
      </div>

      {/* Lower region */}
      <div className="mt-4 min-h-[210px]">
        {phase === 1 && (
          <div className="flex flex-col items-center justify-center h-[210px] text-center" style={{ animation: "os-rise .4s ease both" }}>
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-2 w-2 rounded-full bg-[#A99EE8]" style={{ animation: `os-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-white/55 max-w-[260px] leading-relaxed">
              Breaking your outcome into an ordered plan. Each milestone handed to one vetted specialist.
            </p>
          </div>
        )}

        {phase === 2 && (
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2.5">
              3 milestones · matched in order
            </p>
            <div className="space-y-2">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.title}
                  className="relative flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-2.5 overflow-hidden"
                  style={{ animation: `os-rise .5s cubic-bezier(.2,.7,.2,1) both ${0.12 + i * 0.16}s` }}
                >
                  {m.tone === "violet" && (
                    <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#A99EE8]/12 to-transparent" style={{ animation: "os-flow 1.4s linear infinite" }} />
                  )}
                  <span className="grid place-items-center h-6 w-6 shrink-0 rounded-full bg-white/[0.06] text-white/70 text-[11px] font-semibold">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-white/85 font-medium truncate">{m.title}</p>
                    <p className="text-[11px] text-white/40">{m.cat} · {m.usd}</p>
                  </div>
                  <span className={`shrink-0 rounded-full text-[10.5px] font-semibold px-2.5 py-1 ${
                    m.tone === "violet" ? "bg-[#A99EE8]/15 text-[#C4BBF2]" : "bg-white/[0.06] text-white/45"
                  }`}>
                    {m.state}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-white/40 mt-3 px-1">
              Milestone 1 matches now. The rest match automatically as each is approved.
            </p>
          </div>
        )}

        {phase === 0 && (
          <div className="flex items-center justify-center h-[210px]">
            <p className="text-[12.5px] text-white/30">Not &ldquo;a React developer.&rdquo; The whole outcome.</p>
          </div>
        )}
      </div>
    </div>
  );
}
