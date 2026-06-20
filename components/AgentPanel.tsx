"use client";
import { useState, useEffect } from "react";
import BookingCalendar, { type CalendarSlot } from "@/components/BookingCalendar";
import type { AIMatch } from "@/lib/types";

type StepStatus = "idle" | "running" | "done" | "error";
interface AgentStep { id: string; label: string; icon: string; status: StepStatus }
interface ScopeResult { improvedBrief: string; skills: string[]; suggestedBudget: string; suggestedTimeline: string; questions: string[] }

const INIT_STEPS: AgentStep[] = [
  { id: "scope",    label: "Scoping",  icon: "manage_search",  status: "idle" },
  { id: "match",    label: "Matching", icon: "person_search",  status: "idle" },
  { id: "pitch",    label: "Pitching", icon: "edit_note",      status: "idle" },
  { id: "calendar", label: "Booking",  icon: "calendar_month", status: "idle" },
];

const EXAMPLES = [
  "React dashboard developer, real-time charts, fintech startup",
  "Senior Python data engineer, ETL migration to Prefect",
  "Product designer, SaaS onboarding, 40% drop-off on step 2",
];

function generateSlots(): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (slots.length < 6) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const am = new Date(cursor); am.setHours(9, 0, 0, 0);
      slots.push({ id: `s${slots.length}`, label: `${fmt(am)}, 9:00 AM`, iso: am.toISOString(), recommended: slots.length === 0 });
      if (slots.length < 6) {
        const pm = new Date(cursor); pm.setHours(14, 0, 0, 0);
        slots.push({ id: `s${slots.length}`, label: `${fmt(pm)}, 2:00 PM`, iso: pm.toISOString() });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots.slice(0, 6);
}

interface Props { open: boolean; onClose: () => void; initialBrief?: string }

export default function AgentPanel({ open, onClose, initialBrief = "" }: Props) {
  const [brief, setBrief]         = useState(initialBrief);
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const [steps, setSteps]         = useState<AgentStep[]>(INIT_STEPS);
  const [logLines, setLogLines]   = useState<string[]>([]);
  const [scope, setScope]         = useState<ScopeResult | null>(null);
  const [matches, setMatches]     = useState<AIMatch[]>([]);
  const [pitch, setPitch]         = useState("");
  const [pitchDone, setPitchDone] = useState(false);
  const [slots, setSlots]         = useState<CalendarSlot[]>([]);

  useEffect(() => { if (initialBrief) setBrief(initialBrief); }, [initialBrief]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const log   = (msg: string) => setLogLines(l => [...l, msg]);
  const patch = (id: string, s: StepStatus) =>
    setSteps(prev => prev.map(st => st.id === id ? { ...st, status: s } : st));

  const reset = () => {
    setSteps(INIT_STEPS); setLogLines([]); setScope(null);
    setMatches([]); setPitch(""); setPitchDone(false);
    setSlots([]); setDone(false); setRunning(false);
  };

  const run = async () => {
    if (!brief.trim() || running) return;
    reset();
    await new Promise(r => setTimeout(r, 60));
    setRunning(true);

    // ── Scope ──
    patch("scope", "running"); log("→ Analysing brief…");
    let scopeData: ScopeResult | null = null;
    try {
      const res = await fetch("/api/scope", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief }) });
      scopeData = await res.json();
      setScope(scopeData);
      patch("scope", "done");
      log(`✓ ${scopeData!.skills?.join(", ")} · ${scopeData!.suggestedBudget}`);
    } catch { patch("scope", "error"); log("⚠ Scope fallback"); }

    // ── Match ──
    patch("match", "running"); log("→ Searching talent pool…");
    let topMatches: AIMatch[] = [];
    try {
      const res = await fetch("/api/match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief, budget: scopeData?.suggestedBudget }) });
      const data = await res.json();
      topMatches = data.matches ?? [];
      setMatches(topMatches);
      patch("match", "done");
      log(`✓ ${topMatches.length} candidates ranked — top: ${topMatches[0]?.score ?? "n/a"}`);
    } catch { patch("match", "error"); log("⚠ Match fallback"); }

    // ── Pitch streaming ──
    patch("pitch", "running");
    const top = topMatches[0];
    if (top) {
      log(`→ Drafting pitch for ${top.name}…`);
      try {
        const res = await fetch("/api/pitch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brief, name: top.name, skill: top.skill, bio: top.bio }) });
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        let text = "";
        if (reader) {
          while (true) {
            const { done: d, value } = await reader.read();
            if (d) break;
            text += dec.decode(value);
            setPitch(text);
          }
        }
        setPitchDone(true); patch("pitch", "done"); log("✓ Outreach drafted");
      } catch { patch("pitch", "error"); log("⚠ Pitch failed"); }
    } else { patch("pitch", "done"); log("⚡ Skipped — no match"); }

    // ── Calendar ──
    patch("calendar", "running"); log("→ Generating interview slots…");
    await new Promise(r => setTimeout(r, 400));
    setSlots(generateSlots());
    patch("calendar", "done"); log("✓ Slots ready — first is AI-recommended");

    setDone(true); setRunning(false);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[199]" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[440px] bg-white z-[200] flex flex-col shadow-2xl" style={{ animation: "slideInRight 0.22s ease" }}>

        {/* Header */}
        <div className="bg-tech-blue-deep px-5 py-4 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg ai-match-gradient flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold font-headline text-white leading-none">Hyrde AI Agent</p>
            <p className="text-[10px] font-body text-white/40 tracking-wide mt-0.5">Scope · Match · Pitch · Book</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-white/70" style={{ fontSize: "18px" }}>close</span>
          </button>
        </div>

        {/* Brief input */}
        <div className="px-4 pt-4 pb-3 border-b border-border-crisp shrink-0 bg-surface-gray/40">
          <textarea
            rows={2}
            value={brief}
            onChange={e => setBrief(e.target.value)}
            disabled={running}
            placeholder="Describe the role or task…"
            className="w-full border border-border-crisp rounded-xl px-3 py-2.5 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-white resize-none disabled:opacity-50 mb-2 transition-colors"
          />

          {/* Example pills */}
          {!running && !done && (
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setBrief(ex)}
                  className="text-[10px] font-body text-electric-violet bg-electric-violet/8 border border-electric-violet/20 px-2 py-0.5 rounded-full hover:bg-electric-violet/15 transition-colors truncate max-w-[180px]"
                >
                  {ex.split(",")[0]}…
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={run}
              disabled={!brief.trim() || running}
              className="flex-1 flex items-center justify-center gap-1.5 bg-electric-violet text-white font-semibold font-body text-xs py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? (
                <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Running agent…</>
              ) : (
                <><span className="material-symbols-outlined" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>Run agent</>
              )}
            </button>
            {(running || done) && (
              <button
                onClick={reset}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-border-crisp text-on-surface-variant hover:text-electric-violet hover:border-electric-violet/40 transition-colors text-sm font-semibold"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Step track + log (dark terminal) */}
          {(running || done) && (
            <div className="bg-tech-blue-deep px-4 py-3 agent-scan shrink-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {steps.map(st => (
                  <div key={st.id} className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold font-body transition-all ${
                    st.status === "done"    ? "bg-electric-violet text-white" :
                    st.status === "running" ? "bg-white/10 text-electric-violet border border-electric-violet/40" :
                    st.status === "error"   ? "bg-red-500/20 text-red-400" :
                    "bg-white/6 text-white/25"
                  }`}>
                    {st.status === "running" ? (
                      <span className="w-2 h-2 border border-electric-violet border-t-transparent rounded-full animate-spin" />
                    ) : st.status === "done" ? (
                      <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>check</span>
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>{st.icon}</span>
                    )}
                    {st.label}
                  </div>
                ))}
              </div>
              <div className="space-y-0.5 max-h-14 overflow-y-auto">
                {logLines.map((l, i) => (
                  <p key={i} className="text-[9px] font-mono text-white/30 leading-relaxed">{l}</p>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {(running || done) && (
            <div className="p-4 space-y-4">

              {/* Scope */}
              {scope && (
                <div className="bg-white rounded-xl border border-border-crisp p-4 animate-fadeup">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>manage_search</span>
                    <span className="text-[10px] font-semibold font-body text-electric-violet uppercase tracking-widest">Scope analysis</span>
                  </div>
                  <p className="text-xs font-body text-on-surface leading-relaxed mb-2">{scope.improvedBrief}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[scope.skills?.join(", ") || "—", scope.suggestedBudget, scope.suggestedTimeline].map((s, i) => (
                      <span key={i} className="text-[10px] font-body bg-surface-gray text-on-surface-variant px-2 py-1 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Shortlist */}
              {matches.length > 0 && (
                <div className="animate-fadeup">
                  <p className="text-[10px] font-semibold font-body text-electric-violet uppercase tracking-widest mb-2">AI Shortlist</p>
                  <div className="space-y-2">
                    {matches.map((m, i) => (
                      <div key={m.id} className={`p-3 rounded-xl border ${i === 0 ? "border-electric-violet/30 bg-electric-violet/5" : "border-border-crisp bg-white"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold font-headline text-on-surface">
                                {i === 0 ? m.name : `Candidate ${String.fromCharCode(65 + i)}`}
                              </span>
                              {i === 0 && <span className="text-[8px] font-bold bg-electric-violet text-white px-1.5 py-0.5 rounded-full">Top</span>}
                            </div>
                            <p className="text-[10px] font-body text-on-surface-variant">{m.skill} · ${m.rate}/hr · {m.location}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold font-headline text-on-surface leading-none">{m.score}</p>
                            <p className="text-[9px] font-body text-on-surface-variant">%</p>
                          </div>
                        </div>
                        <p className="text-[10px] font-body text-on-surface-variant leading-relaxed line-clamp-2">{m.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming pitch */}
              {pitch && (
                <div className="bg-white rounded-xl border border-border-crisp p-4 animate-fadeup">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                    <span className="text-[10px] font-semibold font-body text-electric-violet uppercase tracking-widest">AI outreach</span>
                    {!pitchDone && <span className="text-[9px] font-body text-on-surface-variant animate-pulse ml-auto">writing…</span>}
                  </div>
                  <p className="text-xs font-body text-on-surface leading-relaxed whitespace-pre-wrap">
                    {pitch}{!pitchDone && <span className="caret" />}
                  </p>
                </div>
              )}

              {/* Booking calendar */}
              {slots.length > 0 && (
                <div className="animate-fadeup">
                  <BookingCalendar slots={slots} brief={brief} compact />
                </div>
              )}

              {/* Done */}
              {done && (
                <div className="bg-electric-violet/5 border border-electric-violet/20 rounded-xl p-4 text-center animate-fadeup">
                  <span className="material-symbols-outlined text-electric-violet mb-1 block" style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="text-sm font-bold font-headline text-on-surface">Agent complete</p>
                  <p className="text-[10px] font-body text-on-surface-variant mt-0.5">Matched · Outreach drafted · Interview ready</p>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!running && !done && (
            <div className="flex flex-col items-center justify-center h-52 px-8 text-center">
              <span className="material-symbols-outlined text-electric-violet/20 mb-3" style={{ fontSize: "44px" }}>auto_awesome</span>
              <p className="text-sm font-semibold font-headline text-on-surface mb-1">Ready to hire</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                Describe a role above and the agent will scope it, find vetted matches, draft outreach, and book an interview.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
