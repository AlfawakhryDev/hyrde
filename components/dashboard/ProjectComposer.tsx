"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type Milestone = {
  title: string;
  brief: string;
  category: string;
  budgetUsd: number;
  dueInDays: number;
};

// ── Outcome-style intake ──────────────────────────────────────────────────────
// "I need an MVP" -> AI splits it into an ordered milestone plan -> each
// milestone becomes a normal `tasks` row under a `projects` parent. Only the
// first milestone is auto-matched here; later ones are matched when the
// client approves the prior one (see TaskDetailClient's approve()).
export default function ProjectComposer({
  userId,
  remainingPosts,
  onClose,
  onCreated,
}: {
  userId: string;
  remainingPosts: number | null; // null = unlimited (Scale plan)
  onClose: () => void;
  onCreated: (projectId: string) => void;
}) {
  const [phase, setPhase] = useState<"outcome" | "review" | "creating" | "done">("outcome");
  const [outcome, setOutcome] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [note, setNote] = useState("");
  const [scoping, setScoping] = useState(false);
  const [error, setError] = useState("");
  const [createdCount, setCreatedCount] = useState(0);
  const [createdProjectId, setCreatedProjectId] = useState("");
  const [firstMatch, setFirstMatch] = useState<{ matched: boolean; freelancer?: { name: string }; reason?: string } | null>(null);

  const totalUsd = milestones.reduce((s, m) => s + m.budgetUsd, 0);
  const overQuota = remainingPosts !== null && milestones.length > remainingPosts;

  async function scope() {
    if (outcome.trim().length < 10) {
      setError("Describe the outcome in a sentence or two first.");
      return;
    }
    setError(""); setScoping(true);
    try {
      const res = await fetch("/api/scope-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: outcome.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not scope this."); return; }
      setProjectTitle(data.projectTitle);
      setMilestones(data.milestones);
      setNote(data.note ?? "");
      setPhase("review");
    } catch {
      setError("The assistant is unavailable — try again.");
    } finally {
      setScoping(false);
    }
  }

  function updateMilestone(i: number, patch: Partial<Milestone>) {
    setMilestones(ms => ms.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }
  function removeMilestone(i: number) {
    setMilestones(ms => ms.filter((_, idx) => idx !== i));
  }

  async function create() {
    if (milestones.length === 0) { setError("Add at least one milestone."); return; }
    if (overQuota) { setError("You don't have enough posts left this month for all these milestones."); return; }
    setError(""); setPhase("creating");
    const supabase = supabaseBrowser();

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .insert({
        poster_id: userId,
        title: projectTitle || milestones[0].title,
        outcome_brief: outcome.trim(),
        milestone_total: milestones.length,
      })
      .select()
      .single();

    if (projErr || !project) {
      setError(projErr?.message ?? "Could not create the project.");
      setPhase("review");
      return;
    }
    setCreatedProjectId(project.id);

    let created = 0;
    let firstTaskId: string | null = null;
    const start = Date.now();
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      const { data: task, error: taskErr } = await supabase
        .from("tasks")
        .insert({
          title: m.title,
          brief: m.brief,
          category: m.category,
          origin: "human",
          status: "open",
          poster_id: userId,
          amount_cents: Math.round(m.budgetUsd * 100),
          deadline: new Date(start + m.dueInDays * 864e5).toISOString(),
          project_id: project.id,
          milestone_index: i,
          milestone_total: milestones.length,
        })
        .select("id")
        .single();
      if (taskErr || !task) {
        setError(`Created ${created} of ${milestones.length} milestones, then hit a limit. ${taskErr?.message ?? ""}`.trim());
        break;
      }
      created++;
      if (i === 0) firstTaskId = task.id;
    }
    setCreatedCount(created);

    if (created === 0) { setPhase("review"); return; }

    // Only the first milestone is matched now; later ones match once the
    // prior one is approved (see TaskDetailClient approve()).
    if (firstTaskId) {
      try {
        const res = await fetch("/api/assign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
              &ldquo;I need an MVP&rdquo; or &ldquo;I need my Shopify store redesigned&rdquo; — the AI splits it into an
              ordered milestone plan. Each milestone is matched to one vetted specialist, one at a time.
            </p>
            <textarea
              value={outcome}
              onChange={e => setOutcome(e.target.value)}
              rows={4}
              placeholder="What's the outcome you want?"
              className={input}
            />
            {error && <p className="text-sm font-body text-error mt-3">{error}</p>}
            <button
              onClick={scope}
              disabled={scoping}
              className="mt-4 flex items-center justify-center gap-2 bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3.5 rounded-full hover:opacity-90 transition disabled:opacity-60 w-full"
            >
              {scoping ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scoping your project…
                </>
              ) : (
                <>
                  <span aria-hidden="true">↳</span> Scope it with AI
                </>
              )}
            </button>
          </>
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
                    {" "}Not enough left —{" "}
                    <Link href="/billing" className="font-medium text-on-surface hover:text-electric-violet transition-colors">upgrade your plan</Link>.
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
          <div className="text-center py-10">
            <div className="w-10 h-10 border-[3px] border-electric-violet/25 border-t-electric-violet rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Setting up your project…</h2>
            <p className="text-sm text-on-surface-variant">Creating milestones and matching the first one.</p>
          </div>
        )}

        {phase === "done" && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mb-4">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>stacks</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface mb-2">
              Project created — {createdCount} milestone{createdCount === 1 ? "" : "s"}
            </h2>
            {firstMatch?.matched ? (
              <p className="text-sm text-on-surface-variant mb-2 max-w-[380px] mx-auto">
                Milestone 1 matched to <strong className="text-on-surface">{firstMatch.freelancer?.name}</strong>. {firstMatch.reason}
              </p>
            ) : (
              <p className="text-sm text-on-surface-variant mb-2 max-w-[380px] mx-auto">
                Milestone 1 is posted — we&apos;ll match it as soon as a vetted specialist is available.
              </p>
            )}
            <p className="text-[12px] text-on-surface-variant mb-6 max-w-[380px] mx-auto">
              The rest match automatically as each milestone gets approved — no need to juggle multiple freelancers up front.
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
