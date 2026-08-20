"use client";
import { useEffect, useState } from "react";
import SketchCard from "./SketchCard";
import { tFor, type Locale } from "@/lib/i18n";

// ── "Hire outcomes, not gigs" — the flagship differentiator, playing live ─────
// A client types an outcome -> it is scoped into a milestone plan -> milestone 1
// matches, the rest queue. Auto-loops. Hand-marked paper card that tilts to the
// cursor (see SketchCard). Locale-aware so /de renders it in German.

const MARKER = "#B5651D"; // ochre marker for hand annotations on paper

export default function OutcomeShowcase({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale);
  const OUTCOME = t("demo.oTyped");
  const MILESTONES = [
    { title: t("demo.oM1"), cat: "Design", usd: "$600", state: t("demo.oMatching"), live: true },
    { title: t("demo.oM2"), cat: "Development", usd: "$2,800", state: t("demo.oQueued"), live: false },
    { title: t("demo.oM3"), cat: "QA", usd: "$400", state: t("demo.oQueued"), live: false },
  ];

  const [phase, setPhase] = useState(0); // 0 typing · 1 scoping · 2 revealed
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (phase !== 0) return;
    setTyped(0);
    let i = 0;
    const id = setInterval(() => {
      i++; setTyped(i);
      if (i >= OUTCOME.length) { clearInterval(id); setTimeout(() => setPhase(1), 550); }
    }, 34);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === 1) { const id = setTimeout(() => setPhase(2), 1500); return () => clearTimeout(id); }
    if (phase === 2) { const id = setTimeout(() => setPhase(0), 4400); return () => clearTimeout(id); }
  }, [phase]);

  return (
    <SketchCard rotate={-1.4}>
      <style>{`
        @keyframes os-rise { from { opacity:0; transform: translateY(10px) } to { opacity:1; transform:none } }
        @keyframes os-dot { 0%,80%,100% { opacity:.25 } 40% { opacity:.9 } }
        @keyframes os-caret { 0%,100% { opacity:0 } 50% { opacity:1 } }
        @keyframes os-draw { to { stroke-dashoffset: 0 } }
        @keyframes os-ink { from { opacity:0; transform: rotate(-3deg) translateY(4px) } to { opacity:1; transform: rotate(-3deg) translateY(0) } }
      `}</style>

      {/* Header — handwritten title, no status dot */}
      <div className="flex items-end justify-between mb-4 pb-3 border-b border-[#DAD6C8]">
        <span className="text-[#1A1A14] text-[22px] leading-none" style={{ fontFamily: "var(--font-hand)" }}>{t("demo.oIntake")}</span>
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8A8677]">
          {phase === 0 ? t("demo.oPhase0") : phase === 1 ? t("demo.oPhase1") : t("demo.oPhase2")}
        </span>
      </div>

      {/* The outcome input */}
      <div className="rounded-[3px] border border-[#DAD6C8] bg-[#FCFBF4] p-4">
        <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#8A8677] mb-2">{t("demo.oInputLabel")}</div>
        <p className="text-[#1A1A14] text-[14.5px] md:text-[15px] font-medium leading-snug min-h-[2.6em]">
          {OUTCOME.slice(0, typed)}
          {phase === 0 && <span className="inline-block w-[2px] h-[1.05em] -mb-[2px] ml-0.5 bg-[#1A1A14]" style={{ animation: "os-caret 1s step-end infinite" }} />}
        </p>
      </div>

      {/* Lower region */}
      <div className="mt-4 min-h-[210px]">
        {phase === 1 && (
          <div className="flex flex-col items-center justify-center h-[210px] text-center" style={{ animation: "os-rise .4s ease both" }}>
            <div className="flex items-center gap-1.5 mb-4">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#1A1A14]" style={{ animation: `os-dot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
              ))}
            </div>
            <p className="text-[13px] text-[#6B6A5E] max-w-[260px] leading-relaxed">{t("demo.oScoping")}</p>
          </div>
        )}

        {phase === 2 && (
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#8A8677]">{t("demo.oPlan")}</p>
              <span className="text-[16px] leading-none pointer-events-none" style={{ fontFamily: "var(--font-hand)", color: MARKER, animation: "os-ink .4s ease .7s both" }} aria-hidden="true">
                {t("demo.oNote")}
              </span>
            </div>
            <div className="space-y-2">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.title}
                  className={`flex items-center gap-3 rounded-[3px] border px-3.5 py-2.5 ${m.live ? "border-[#1A1A14]/30 bg-[#FCFBF4]" : "border-[#E2DFD3] bg-transparent"}`}
                  style={{ animation: `os-rise .5s cubic-bezier(.2,.7,.2,1) both ${0.12 + i * 0.16}s` }}
                >
                  <span className="grid place-items-center h-6 w-6 shrink-0 rounded-[3px] border border-[#CFCBBC] font-mono text-[#6B6A5E] text-[11px]">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="relative inline-block max-w-full align-bottom">
                      <p className="text-[13px] text-[#1A1A14] font-medium truncate">{m.title}</p>
                      {m.live && (
                        <svg className="pointer-events-none absolute -bottom-1 left-0 w-full h-[6px]" viewBox="0 0 200 6" preserveAspectRatio="none" aria-hidden="true" style={{ color: MARKER }}>
                          <path d="M1 4 C 40 1, 70 6, 110 3 C 150 1, 180 5, 199 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ strokeDasharray: 230, strokeDashoffset: 230, animation: "os-draw .8s ease .55s forwards" }} />
                        </svg>
                      )}
                    </span>
                    <p className="text-[11px] text-[#8A8677]">{m.cat} · {m.usd}</p>
                  </div>
                  <span className={`shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] ${m.live ? "text-emerald-700" : "text-[#A5A292]"}`}>
                    {m.state}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-[#8A8677] mt-3 px-1 leading-relaxed">{t("demo.oFooter")}</p>
          </div>
        )}

        {phase === 0 && (
          <div className="flex items-center justify-center h-[210px]">
            <p className="text-[15px]" style={{ fontFamily: "var(--font-hand)", color: "#A5A292" }}>{t("demo.oPlaceholder")}</p>
          </div>
        )}
      </div>
    </SketchCard>
  );
}
