"use client";
import { useState } from "react";
import Link from "next/link";
import {
  treeFor, selectNextQuestion, scopeConfidence, shouldStop, deriveRiskFlags,
  answerFacts, isShopify, versionFor, CONFIDENCE_TARGET, DONT_KNOW,
  type Question, type AnswerMap,
} from "@/lib/questiontree";

type Milestone = {
  title: string;
  brief: string;
  category: string;
  milestoneType?: string; // LLM-classified controlled type, passed through to create
  budgetUsd: number;
  dueInDays: number;
};

// ── Outcome intake with interrogation (spec 6-7) ────────────────────────────
// "I need my Shopify store replatformed" -> classify the archetype -> ask the
// variance-weighted questions that actually move the estimate (I-don't-know is a
// first-class answer that becomes a risk flag) -> decompose with those answers
// as hard constraints -> freeze the scope. Non-Shopify archetypes skip straight
// to naive decomposition (we only interrogate where we have calibrated
// questions). Only the first milestone is auto-matched here.
// One-tap starting points so a new client never faces a blank box.
export const PROJECT_TEMPLATES = [
  { label: "An MVP for my idea", outcome: "I need an MVP built for my product idea. It should let users sign up and use the core feature. " },
  { label: "A landing page", outcome: "I need a high-converting landing page for my product, with copy and design. " },
  { label: "A Shopify store", outcome: "I need my Shopify store set up and designed, ready to sell. " },
  { label: "A brand identity", outcome: "I need a brand identity: a logo, colour palette, and simple brand guidelines. " },
  { label: "Social content", outcome: "I need a month of social media content and a posting plan for my brand. " },
  { label: "A mobile app", outcome: "I need a mobile app built for iOS and Android for my idea. " },
];

export default function ProjectComposer({
  remainingPosts,
  onClose,
  onCreated,
  initialOutcome = "",
}: {
  remainingPosts: number | null; // null = unlimited (Scale plan)
  onClose: () => void;
  onCreated: (projectId: string) => void;
  initialOutcome?: string;
}) {
  const [phase, setPhase] = useState<
    "outcome" | "classifying" | "confirm" | "interrogate" | "scoping" | "review" | "creating" | "done"
  >("outcome");
  const [outcome, setOutcome] = useState(initialOutcome);
  const [projectTitle, setProjectTitle] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // Interrogation state
  const [archetype, setArchetype] = useState<string>("other");
  const [disambiguation, setDisambiguation] = useState<string[]>([]);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [askedKeys, setAskedKeys] = useState<Set<string>>(new Set());
  const [multiSel, setMultiSel] = useState<string[]>([]);

  // Create/done state
  const [createdCount, setCreatedCount] = useState(0);
  const [createdProjectId, setCreatedProjectId] = useState("");
  const [firstMatch, setFirstMatch] = useState<{ matched: boolean; freelancer?: { name: string }; reason?: string } | null>(null);

  const totalUsd = milestones.reduce((s, m) => s + m.budgetUsd, 0);
  const overQuota = remainingPosts !== null && milestones.length > remainingPosts;

  // ── Step 1: classify ──
  async function submitOutcome() {
    if (outcome.trim().length < 10) { setError("Describe the outcome in a sentence or two first."); return; }
    setError(""); setPhase("classifying");
    try {
      const res = await fetch("/api/classify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: outcome.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not read that."); setPhase("outcome"); return; }
      const slug = String(data.archetype_slug ?? "other");
      const conf = Number(data.confidence ?? 0);
      setArchetype(slug);
      setDisambiguation(Array.isArray(data.disambiguation_questions) ? data.disambiguation_questions : []);

      // Every project gets interrogated. Only ask the Shopify confirm when the
      // classifier is unsure AND leaning Shopify (specialized vs generic tree).
      if (isShopify(slug) && conf < 0.7) setPhase("confirm");
      else beginInterrogation(slug);
    } catch {
      // Classifier down: fall through to naive scoping so creation never blocks.
      runScope("other", [], []);
    }
  }

  function beginInterrogation(slug: string) {
    setArchetype(slug);
    setAnswers({}); setAskedKeys(new Set()); setMultiSel([]);
    setError(""); setPhase("interrogate");
  }

  // ── Step 2: interrogate ──
  const tree = treeFor(archetype);
  const currentQ: Question | null = phase === "interrogate" ? selectNextQuestion(tree, answers) : null;
  const confidence = scopeConfidence(tree, answers);
  const progress = Math.min(1, confidence / CONFIDENCE_TARGET);

  function recordAndAdvance(q: Question, value: string | string[]) {
    const na: AnswerMap = { ...answers, [q.key]: value };
    const ak = new Set(askedKeys); ak.add(q.key);
    setAnswers(na); setAskedKeys(ak); setMultiSel([]);
    if (shouldStop(tree, na, ak.size)) finalizeInterrogation(na, ak);
  }

  function toggleMulti(value: string) {
    // "none" and "I'm not sure" are exclusive; picking either clears the rest.
    if (value === "none" || value === DONT_KNOW) { setMultiSel([value]); return; }
    setMultiSel(sel => {
      const without = sel.filter(v => v !== "none" && v !== DONT_KNOW);
      return without.includes(value) ? without.filter(v => v !== value) : [...without, value];
    });
  }

  async function finalizeInterrogation(na: AnswerMap, ak: Set<string>) {
    const facts = answerFacts(tree, na);
    const risks = deriveRiskFlags(tree, na, ak).map(r => r.description);
    await runScope(archetype, facts, risks);
  }

  // ── Step 3: decompose (scope), using interrogation answers as constraints ──
  async function runScope(slug: string, facts: string[], risks: string[]) {
    setError(""); setPhase("scoping");
    try {
      const res = await fetch("/api/scope-project", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: outcome.trim(), archetype: slug, facts, risks }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not scope this."); setPhase("interrogate"); return; }
      setProjectTitle(data.projectTitle);
      setMilestones(data.milestones);
      setNote(data.note ?? "");
      setPhase("review");
    } catch {
      setError("The assistant is unavailable. Try again.");
      setPhase("outcome");
    }
  }

  function updateMilestone(i: number, patch: Partial<Milestone>) {
    setMilestones(ms => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }
  function removeMilestone(i: number) {
    setMilestones(ms => ms.filter((_, idx) => idx !== i));
  }

  // Build the interrogation record persisted with the scope.
  function interrogationPayload() {
    if (tree.length === 0) return null;
    const asked = tree.filter(q => answers[q.key] !== undefined);
    if (asked.length === 0) return null;
    return {
      archetype,
      question_set_version: versionFor(archetype),
      confidence: scopeConfidence(tree, answers),
      answers: asked.map(q => {
        const v = answers[q.key];
        const isDK = Array.isArray(v) ? v.includes(DONT_KNOW) : v === DONT_KNOW;
        return { key: q.key, text: q.text, type: q.type, value: v, answered: !isDK, variance_weight: q.variance_weight };
      }),
      risk_flags: deriveRiskFlags(tree, answers, askedKeys),
    };
  }

  // ── Step 4: commit ──
  async function create() {
    if (milestones.length === 0) { setError("Add at least one milestone."); return; }
    if (overQuota) { setError("You don't have enough posts left this month for all these milestones."); return; }
    setError(""); setPhase("creating");

    let firstTaskId: string | null = null;
    try {
      const res = await fetch("/api/create-project", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectTitle, outcome: outcome.trim(), milestones, interrogation: interrogationPayload() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not create the project."); setPhase("review"); return; }
      setCreatedProjectId(data.projectId);
      setCreatedCount(data.createdCount);
      firstTaskId = data.firstTaskId ?? null;
    } catch {
      setError("Could not reach the server. Try again."); setPhase("review"); return;
    }

    if (firstTaskId) {
      try {
        const res = await fetch("/api/assign", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: firstTaskId }),
        });
        const data = await res.json();
        setFirstMatch(res.ok ? data : { matched: false });
      } catch {
        setFirstMatch({ matched: false });
      }
    }
    setPhase("done");
  }

  const input =
    "w-full border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet resize-y";

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        className="w-full sm:max-w-xl bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {phase === "outcome" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">Describe a bigger outcome</h2>
              <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-[13px] text-on-surface-variant mb-5">
              &ldquo;I need an MVP&rdquo; or &ldquo;I need my Shopify store replatformed&rdquo;. We ask a few sharp questions,
              then split it into an ordered milestone plan. Each milestone is matched to one vetted specialist.
            </p>
            <textarea
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              rows={4}
              placeholder="What's the outcome you want?"
              className={input}
            />
            {/* One-tap starters, so there's never a blank page */}
            <div className="mt-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-2">Start from an example</p>
              <div className="flex flex-wrap gap-2">
                {PROJECT_TEMPLATES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setOutcome(t.outcome)}
                    className="rounded-full border border-border-crisp px-3 py-1.5 text-[12.5px] font-medium text-on-surface-variant hover:border-electric-violet hover:text-on-surface transition-colors"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-sm font-body text-error mt-3">{error}</p>}
            <button
              onClick={submitOutcome}
              className="mt-4 flex items-center justify-center gap-2 bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3.5 rounded-full hover:opacity-90 transition disabled:opacity-60 w-full"
            >
              Continue
            </button>
          </>
        )}

        {phase === "classifying" && (
          <Spinner title="Reading your request" sub="Working out what kind of project this is." />
        )}

        {phase === "confirm" && (
          <>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Quick check</h2>
            <p className="text-[13px] text-on-surface-variant mb-5">
              {disambiguation[0] ?? "Is this a Shopify store project?"} Knowing this loads the right questions.
            </p>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => beginInterrogation("shopify")}
                className="text-left rounded-xl border border-border-crisp px-4 py-3.5 text-sm font-medium text-on-surface hover:border-electric-violet transition">
                Yes, it&apos;s a Shopify store
              </button>
              <button onClick={() => beginInterrogation("other")}
                className="text-left rounded-xl border border-border-crisp px-4 py-3.5 text-sm font-medium text-on-surface hover:border-electric-violet transition">
                No, something else
              </button>
            </div>
          </>
        )}

        {phase === "interrogate" && currentQ && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-electric-violet">Scoping questions</span>
              <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {/* confidence progress */}
            <div className="h-1.5 w-full rounded-full bg-surface-container mb-6 overflow-hidden">
              <div className="h-full bg-electric-violet transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>

            <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-on-surface leading-snug mb-1.5">{currentQ.text}</h2>
            {currentQ.help && <p className="text-[12.5px] text-on-surface-variant mb-5">{currentQ.help}</p>}

            {currentQ.type === "single_select" ? (
              <div className="flex flex-col gap-2.5 mt-4">
                {currentQ.options.map(o => (
                  <button key={o.value} onClick={() => recordAndAdvance(currentQ, o.value)}
                    className={`text-left rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                      o.value === DONT_KNOW
                        ? "border-dashed border-border-crisp text-on-surface-variant hover:border-electric-violet hover:text-on-surface"
                        : "border-border-crisp text-on-surface hover:border-electric-violet"
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-5">
                  {currentQ.options.map(o => {
                    const active = multiSel.includes(o.value);
                    return (
                      <button key={o.value} onClick={() => toggleMulti(o.value)}
                        className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${
                          active ? "border-electric-violet bg-electric-violet/10 text-on-surface" : "border-border-crisp text-on-surface-variant hover:text-on-surface"
                        }`}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => recordAndAdvance(currentQ, multiSel.length ? multiSel : [DONT_KNOW])}
                  className="w-full bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3.5 rounded-full hover:opacity-90 transition">
                  Continue
                </button>
              </div>
            )}

            <button onClick={() => finalizeInterrogation(answers, askedKeys)}
              className="mt-5 text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition">
              Skip the rest and scope now
            </button>
          </>
        )}

        {phase === "scoping" && (
          <Spinner title="Scoping your project" sub="Turning what you told us into a priced milestone plan." />
        )}

        {phase === "review" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">{projectTitle}</h2>
              <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {note && <p className="text-[13px] text-on-surface-variant mb-5">{note}</p>}

            <div className="flex flex-col gap-3 mb-4">
              {milestones.map((m, i) => (
                <div key={i} className="rounded-xl border border-border-crisp p-4">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-electric-violet">Milestone {i + 1}</span>
                    <button onClick={() => removeMilestone(i)} aria-label={`Remove milestone ${i + 1}`} className="text-on-surface-variant hover:text-error">
                      <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>delete</span>
                    </button>
                  </div>
                  <input
                    value={m.title}
                    onChange={e => updateMilestone(i, { title: e.target.value })}
                    className="w-full border border-border-crisp rounded-lg px-3 py-2 text-sm font-medium text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet mb-2"
                  />
                  <textarea
                    value={m.brief}
                    onChange={e => updateMilestone(i, { brief: e.target.value })}
                    rows={2}
                    className="w-full border border-border-crisp rounded-lg px-3 py-2 text-[13px] text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet resize-y mb-2"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-on-surface-variant">$</span>
                      <input
                        value={m.budgetUsd}
                        onChange={e => updateMilestone(i, { budgetUsd: Math.max(0, Number(e.target.value.replace(/\D/g, "")) || 0) })}
                        inputMode="numeric"
                        className="w-full border border-border-crisp rounded-lg pl-6 pr-2 py-2 text-[13px] text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                      />
                    </div>
                    <div className="relative flex-1">
                      <input
                        value={m.dueInDays}
                        onChange={e => updateMilestone(i, { dueInDays: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) })}
                        inputMode="numeric"
                        className="w-full border border-border-crisp rounded-lg px-3 py-2 text-[13px] text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-on-surface-variant pointer-events-none">days</span>
                    </div>
                    <span className="shrink-0 flex items-center text-[12px] text-on-surface-variant px-2">{m.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between py-3 border-t border-border-crisp mb-1">
              <span className="text-[13px] text-on-surface-variant">Total across {milestones.length} milestone{milestones.length === 1 ? "" : "s"}</span>
              <span className="text-[16px] font-semibold text-on-surface">${totalUsd.toLocaleString()}</span>
            </div>

            {remainingPosts !== null && (
              <p className={`text-[12px] mb-3 ${overQuota ? "text-error" : "text-on-surface-variant"}`}>
                This uses {milestones.length} of your {remainingPosts} remaining post{remainingPosts === 1 ? "" : "s"} this month.
                {overQuota && (
                  <>
                    {" "}Not enough left.{" "}
                    <Link href="/billing" className="font-medium text-on-surface hover:text-electric-violet transition-colors">Upgrade your plan</Link>.
                  </>
                )}
              </p>
            )}

            {error && <p className="text-sm font-body text-error mb-3">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setPhase("outcome")} className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors px-2">
                Back
              </button>
              <button
                onClick={create}
                disabled={overQuota || milestones.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3.5 rounded-full hover:opacity-90 transition disabled:opacity-60"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "17px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Create project &amp; match milestone 1
              </button>
            </div>
          </>
        )}

        {phase === "creating" && (
          <Spinner title="Setting up your project" sub="Creating milestones and matching the first one." />
        )}

        {phase === "done" && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mb-4">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>stacks</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface mb-2">
              Project created. {createdCount} milestone{createdCount === 1 ? "" : "s"}
            </h2>
            {firstMatch?.matched ? (
              <p className="text-sm text-on-surface-variant mb-2 max-w-[380px] mx-auto">
                Milestone 1 matched to <strong className="text-on-surface">{firstMatch.freelancer?.name}</strong>. {firstMatch.reason}
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant mb-2 max-w-[380px] mx-auto">
                Milestone 1 is posted. We&apos;ll match it as soon as a vetted specialist is available.
              </p>
            )}
            <p className="text-[12px] text-on-surface-variant mb-6 max-w-[380px] mx-auto">
              The rest match automatically as each milestone gets approved. No need to juggle multiple freelancers up front.
            </p>
            <button
              onClick={() => onCreated(createdProjectId)}
              className="bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3 rounded-full hover:opacity-90"
            >
              View my project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="text-center py-10">
      <div className="w-10 h-10 border-[3px] border-electric-violet/25 border-t-electric-violet rounded-full animate-spin mx-auto mb-5" />
      <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">{title}</h2>
      <p className="text-sm text-on-surface-variant">{sub}</p>
    </div>
  );
}
