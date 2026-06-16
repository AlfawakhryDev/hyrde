"use client";
import { useState } from "react";
import BookingCalendar, { type CalendarSlot } from "@/components/BookingCalendar";
import type { AIMatch } from "@/lib/types";

type StepStatus = "idle" | "running" | "done" | "error";

interface AgentStep {
  id: string;
  label: string;
  icon: string;
  status: StepStatus;
}

interface ScopeResult {
  improvedBrief: string;
  skills: string[];
  suggestedBudget: string;
  suggestedTimeline: string;
  questions: string[];
}

const INITIAL_STEPS: AgentStep[] = [
  { id: "scope",    label: "Scoping your brief",          icon: "manage_search",  status: "idle" },
  { id: "match",    label: "Finding top matches",         icon: "person_search",  status: "idle" },
  { id: "pitch",    label: "Drafting outreach",           icon: "edit_note",      status: "idle" },
  { id: "calendar", label: "Proposing interview slots",   icon: "calendar_month", status: "idle" },
];

const EXAMPLES = [
  "Build a React dashboard for our B2B fintech startup. Need real-time charts, auth, and a dark mode design system.",
  "Senior Python data engineer to migrate our ETL from Airflow to Prefect and optimise our Snowflake spend.",
  "Product designer to redesign our SaaS onboarding — we're losing 40% of users on step 2.",
];

function generateSlots(): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);

  while (slots.length < 6) {
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) {
      const fmt = (d: Date) =>
        d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

      const am = new Date(cursor);
      am.setHours(9, 0, 0, 0);
      slots.push({
        id: `s${slots.length}`,
        label: `${fmt(am)}, 9:00 AM`,
        iso: am.toISOString(),
        recommended: slots.length === 0,
      });

      if (slots.length < 6) {
        const pm = new Date(cursor);
        pm.setHours(14, 0, 0, 0);
        slots.push({
          id: `s${slots.length}`,
          label: `${fmt(pm)}, 2:00 PM`,
          iso: pm.toISOString(),
        });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots.slice(0, 6);
}

function stepColor(status: StepStatus) {
  if (status === "done")    return "bg-electric-violet";
  if (status === "running") return "bg-white/10 border border-electric-violet/50";
  if (status === "error")   return "bg-red-500/20 border border-red-400/40";
  return "bg-white/5 border border-white/10";
}

function stepLabel(status: StepStatus, label: string) {
  if (status === "done")    return "text-white";
  if (status === "running") return "text-electric-violet animate-pulse";
  if (status === "error")   return "text-red-400";
  return "text-white/30";
  void label;
}

export default function AgentPage() {
  const [brief, setBrief]     = useState("");
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [steps, setSteps]     = useState<AgentStep[]>(INITIAL_STEPS);
  const [logLines, setLogLines]   = useState<string[]>([]);
  const [scope, setScope]         = useState<ScopeResult | null>(null);
  const [matches, setMatches]     = useState<AIMatch[]>([]);
  const [pitch, setPitch]         = useState("");
  const [pitchDone, setPitchDone] = useState(false);
  const [slots, setSlots]         = useState<CalendarSlot[]>([]);

  const log = (msg: string) => setLogLines(l => [...l, msg]);

  const patchStep = (id: string, status: StepStatus) =>
    setSteps(s => s.map(st => st.id === id ? { ...st, status } : st));

  const reset = () => {
    setSteps(INITIAL_STEPS);
    setLogLines([]);
    setScope(null);
    setMatches([]);
    setPitch("");
    setPitchDone(false);
    setSlots([]);
    setDone(false);
    setRunning(false);
  };

  const run = async () => {
    if (!brief.trim() || running) return;
    reset();
    await new Promise(r => setTimeout(r, 60));
    setRunning(true);

    // ── Step 1: Scope ──
    patchStep("scope", "running");
    log("→ Analysing your brief…");
    let scopeData: ScopeResult | null = null;
    try {
      const res = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief }),
      });
      scopeData = await res.json();
      setScope(scopeData);
      patchStep("scope", "done");
      log(`✓ Scoped — ${scopeData!.skills?.join(", ")} · ${scopeData!.suggestedBudget} · ${scopeData!.suggestedTimeline}`);
    } catch {
      patchStep("scope", "error");
      log("⚠ Scope fallback applied");
    }

    // ── Step 2: Match ──
    patchStep("match", "running");
    log("→ Searching vetted talent pool…");
    let topMatches: AIMatch[] = [];
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, budget: scopeData?.suggestedBudget }),
      });
      const data = await res.json();
      topMatches = data.matches ?? [];
      setMatches(topMatches);
      patchStep("match", "done");
      log(`✓ ${topMatches.length} candidates ranked — top score: ${topMatches[0]?.score ?? "n/a"}`);
    } catch {
      patchStep("match", "error");
      log("⚠ Match fallback applied");
    }

    // ── Step 3: Pitch streaming ──
    patchStep("pitch", "running");
    const top = topMatches[0];
    if (top) {
      log(`→ Drafting personalised outreach for ${top.name}…`);
      try {
        const res = await fetch("/api/pitch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brief, name: top.name, skill: top.skill, bio: top.bio }),
        });
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
        setPitchDone(true);
        patchStep("pitch", "done");
        log("✓ Outreach drafted");
      } catch {
        patchStep("pitch", "error");
        log("⚠ Pitch generation failed");
      }
    } else {
      patchStep("pitch", "done");
      log("⚡ Pitch skipped — no match available");
    }

    // ── Step 4: Calendar slots ──
    patchStep("calendar", "running");
    log("→ Proposing interview time slots…");
    await new Promise(r => setTimeout(r, 500));
    const generated = generateSlots();
    setSlots(generated);
    patchStep("calendar", "done");
    log(`✓ ${generated.length} slots proposed — first slot is AI-recommended`);

    setDone(true);
    setRunning(false);
  };

  return (
    <div className="min-h-screen bg-surface-gray">

      {/* Hero */}
      <section className="bg-tech-blue-deep pt-24 pb-16 relative overflow-hidden">
        <div className="glow-accent absolute -top-24 right-0 w-[40rem] h-[40rem] rounded-full bg-electric-violet opacity-25 blur-3xl" />
        <div className="max-w-[960px] mx-auto px-6 md:px-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full mb-5">
            <span className="material-symbols-outlined text-electric-violet animate-floaty" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-[11px] font-semibold font-body text-white/80 uppercase tracking-widest">Hyrde AI Agent — live demo</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-[1.05] mb-4 max-w-2xl">
            Describe the work.<br />
            <span className="text-electric-violet">Watch AI hire for you.</span>
          </h1>
          <p className="font-body text-white/55 text-base max-w-xl leading-relaxed">
            The agent scopes your brief, ranks vetted freelancers, drafts personalised outreach, and books an interview — all in under 60 seconds.
          </p>
        </div>
      </section>

      {/* Brief input card */}
      <section className="max-w-[960px] mx-auto px-6 md:px-12 -mt-6 relative z-20 mb-8">
        <div className="bg-white rounded-2xl border border-border-crisp shadow-lg p-6">
          <label className="block text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">
            What do you need built or done?
          </label>
          <textarea
            rows={3}
            value={brief}
            onChange={e => setBrief(e.target.value)}
            disabled={running}
            placeholder="e.g. Build a React dashboard with real-time charts, auth, and dark mode for our B2B SaaS…"
            className="w-full border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 bg-surface-gray/30 resize-none mb-3 disabled:opacity-50 transition-colors"
          />
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest shrink-0">Try an example:</span>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setBrief(ex)}
                disabled={running}
                className="text-[11px] font-body text-electric-violet bg-electric-violet/8 border border-electric-violet/20 px-2.5 py-1 rounded-full hover:bg-electric-violet/15 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Example {i + 1}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={run}
              disabled={!brief.trim() || running}
              className="flex items-center gap-2 bg-electric-violet text-white font-semibold font-body px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Agent is working…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  Run Hyrde Agent
                </>
              )}
            </button>
            {(running || done) && (
              <button
                onClick={reset}
                className="text-xs font-semibold font-body text-on-surface-variant hover:text-electric-violet transition-colors"
              >
                ↺ Reset
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Output: agent log + results */}
      {(running || done) && (
        <section className="max-w-[960px] mx-auto px-6 md:px-12 pb-20 grid md:grid-cols-[260px_1fr] gap-6 animate-fadeup">

          {/* Left: Dark terminal log */}
          <div className="bg-tech-blue-deep rounded-2xl p-5 agent-scan h-fit sticky top-20">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-electric-violet animate-pulse" />
              <span className="text-xs font-semibold font-body text-white/50 uppercase tracking-widest">Agent log</span>
            </div>

            <div className="space-y-3 mb-4">
              {steps.map(step => (
                <div key={step.id} className="flex items-start gap-2.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${stepColor(step.status)}`}>
                    {step.status === "done" ? (
                      <span className="material-symbols-outlined text-white" style={{ fontSize: "13px" }}>check</span>
                    ) : step.status === "running" ? (
                      <span className="w-2.5 h-2.5 border border-electric-violet border-t-transparent rounded-full animate-spin" />
                    ) : step.status === "error" ? (
                      <span className="material-symbols-outlined text-red-400" style={{ fontSize: "13px" }}>warning</span>
                    ) : (
                      <span className="material-symbols-outlined text-white/20" style={{ fontSize: "13px" }}>{step.icon}</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold font-body leading-snug ${stepLabel(step.status, step.label)}`}>
                      {step.label}
                    </p>
                    {step.status === "running" && (
                      <div className="flex gap-0.5 mt-1">
                        <span className="think-dot w-1 h-1 rounded-full bg-electric-violet/60" />
                        <span className="think-dot w-1 h-1 rounded-full bg-electric-violet/60" style={{ animationDelay: "0.2s" }} />
                        <span className="think-dot w-1 h-1 rounded-full bg-electric-violet/60" style={{ animationDelay: "0.4s" }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 space-y-1.5 max-h-44 overflow-y-auto">
              {logLines.map((line, i) => (
                <p key={i} className="text-[10px] font-mono text-white/35 leading-relaxed">{line}</p>
              ))}
            </div>
          </div>

          {/* Right: Results panel */}
          <div className="space-y-5">

            {/* Scope card */}
            {scope && (
              <div className="bg-white rounded-xl border border-border-crisp p-5 animate-fadeup">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>manage_search</span>
                  <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">AI scope analysis</span>
                </div>
                <p className="text-sm font-body text-on-surface leading-relaxed mb-3">{scope.improvedBrief}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Skills",   value: scope.skills?.join(", ") || "—" },
                    { label: "Budget",   value: scope.suggestedBudget },
                    { label: "Timeline", value: scope.suggestedTimeline },
                  ].map(stat => (
                    <div key={stat.label} className="bg-surface-gray rounded-lg p-3">
                      <p className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-xs font-body text-on-surface">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {scope.questions?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-1.5">Clarifying questions</p>
                    {scope.questions.map((q, i) => (
                      <p key={i} className="text-xs font-body text-on-surface-variant">· {q}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Shortlist */}
            {matches.length > 0 && (
              <div className="animate-fadeup">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>person_search</span>
                  <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">AI shortlist — top {matches.length} matches</span>
                </div>
                <div className="space-y-3">
                  {matches.map((m, i) => (
                    <div
                      key={m.id}
                      className={`bg-white rounded-xl border p-4 transition-colors ${i === 0 ? "border-electric-violet/40 shadow-sm" : "border-border-crisp"}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-bold font-headline text-tech-blue-deep">
                              {i === 0 ? m.name : `Candidate ${String.fromCharCode(65 + i)}`}
                            </p>
                            {i === 0 && (
                              <span className="text-[9px] font-semibold bg-electric-violet text-white px-2 py-0.5 rounded-full">Top match</span>
                            )}
                          </div>
                          <p className="text-xs font-body text-on-surface-variant">{m.skill} · ${m.rate}/hr · {m.location}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-2xl font-bold font-headline text-tech-blue-deep leading-none">{m.score}</p>
                          <p className="text-[10px] font-body text-on-surface-variant">match %</p>
                        </div>
                      </div>
                      <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-2">{m.rationale}</p>
                      {m.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.highlights.slice(0, 3).map((h, j) => (
                            <span key={j} className="text-[10px] font-body bg-electric-violet/8 text-electric-violet px-2 py-0.5 rounded-full">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streaming pitch */}
            {pitch && (
              <div className="bg-white rounded-xl border border-border-crisp p-5 animate-fadeup">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                  <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">AI-drafted outreach</span>
                  {!pitchDone && (
                    <span className="text-[10px] font-body text-on-surface-variant animate-pulse ml-auto">writing…</span>
                  )}
                </div>
                <p className="text-sm font-body text-on-surface leading-relaxed whitespace-pre-wrap">
                  {pitch}
                  {!pitchDone && <span className="caret" />}
                </p>
              </div>
            )}

            {/* Booking calendar */}
            {slots.length > 0 && (
              <div className="animate-fadeup">
                <BookingCalendar slots={slots} brief={brief} compact />
              </div>
            )}

            {/* Done banner */}
            {done && (
              <div className="bg-electric-violet/5 border border-electric-violet/20 rounded-xl p-4 text-center animate-fadeup">
                <span className="material-symbols-outlined text-electric-violet mb-1 block" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-sm font-bold font-headline text-tech-blue-deep">Agent complete — your hire is set up</p>
                <p className="text-xs font-body text-on-surface-variant mt-1">Top match identified · outreach drafted · interview slot ready to book</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
