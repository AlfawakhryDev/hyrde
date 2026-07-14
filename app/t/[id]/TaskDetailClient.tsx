"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  type ArenaTask, parseAiReview, taskState, formatAmount, timeAgo,
} from "@/lib/arena";
import PaymentFlow from "@/components/arena/PaymentFlow";
import TaskChat from "@/components/arena/TaskChat";

export default function TaskDetailClient({
  initialTask,
  userId,
  claimerBadges,
  attachments = [],
}: {
  initialTask: ArenaTask;
  userId: string;
  claimerBadges: { category: string; band: string; score: number }[];
  attachments?: { id: string; file_name: string; file_size: number | null; storage_path: string }[];
}) {
  const [task, setTask] = useState<ArenaTask>(initialTask);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [deliverText, setDeliverText] = useState("");
  const [showDeliver, setShowDeliver] = useState(false);
  const [nextMilestoneNote, setNextMilestoneNote] = useState("");

  const isOwner = task.poster_id === userId;
  const isMyClaim = task.claimed_by_user_id === userId; // the AI matched this task to me
  const isMatched = !!task.claimed_by_user_id;
  const canRematch = isOwner && !isMatched && task.status !== "closed";
  const canDeliver = isMyClaim && task.status !== "delivered" && task.payment_status === "unpaid";
  const canApprove = isOwner && task.status === "delivered" && task.payment_status === "unpaid";
  const state = taskState(task);
  const amount = formatAmount(task.amount_cents);
  const aiReview = parseAiReview(task.ai_review);
  // Escrow-by-information: the client sees a preview + the AI review before
  // paying; the full deliverable unlocks once payment is confirmed.
  const deliverableUnlocked = isMyClaim || task.payment_status === "paid";
  const claimStale =
    !!task.claimed_at &&
    task.status !== "delivered" &&
    task.payment_status === "unpaid" &&
    Date.now() - new Date(task.claimed_at).getTime() > 72 * 3.6e6;

  // ── Live refresh ──────────────────────────────────────────────────────────
  // deliverable_text/agent_deliverable are column-locked at the DB level (only
  // the poster, the matched freelancer, or a paid task can see them) — read
  // through get_task_full() rather than a raw select, or this 403s.
  const refetch = useCallback(async () => {
    const { data } = await supabaseBrowser().rpc("get_task_full", { p_task_id: initialTask.id });
    if (data) setTask(data as ArenaTask);
  }, [initialTask.id]);

  useEffect(() => {
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`task-${initialTask.id}`)
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter: `id=eq.${initialTask.id}` },
        () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [initialTask.id, refetch]);

  // ── Actions ───────────────────────────────────────────────────────────────
  // The client can (re)run AI matching — e.g. no vetted specialist existed when
  // the task was posted, or a previous match declined.
  async function rematch() {
    setBusy("rematch"); setError("");
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Matching failed.");
      else if (!data.matched) setError("No vetted specialist is available yet — we'll keep looking as more get vetted.");
    } catch {
      setError("Matching failed — try again.");
    }
    await refetch();
    setBusy(null);
  }

  async function deliver() {
    if (deliverText.trim().length < 10) {
      setError("Describe or paste what you're delivering.");
      return;
    }
    setBusy("deliver"); setError("");
    const { error } = await supabaseBrowser()
      .from("tasks")
      .update({ status: "delivered", deliverable_text: deliverText.trim() })
      .eq("id", task.id);
    if (error) setError(error.message);
    else setShowDeliver(false);
    await refetch();
    setBusy(null);
  }

  async function requestReview() {
    setBusy("review"); setError("");
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Review failed.");
    } catch {
      setError("Review failed — try again.");
    }
    await refetch();
    setBusy(null);
  }

  // A matched freelancer can decline; a client can reassign a match that's gone
  // 72h+ without a delivery. Either way the task returns to the matching pool.
  async function releaseClaim() {
    setBusy("release"); setError("");
    const { error } = await supabaseBrowser()
      .from("tasks")
      .update({
        claimed_by_user_id: null, claimed_at: null,
        matched_at: null, match_reason: null, match_score: null,
        status: "open",
      })
      .eq("id", task.id);
    if (error) setError(error.message);
    await refetch();
    setBusy(null);
  }

  async function approve() {
    setBusy("approve"); setError(""); setNextMilestoneNote("");
    const supabase = supabaseBrowser();
    const { error } = await supabase
      .from("tasks")
      .update({ payment_status: "approved" })
      .eq("id", task.id);
    if (error) { setError(error.message); await refetch(); setBusy(null); return; }

    // Outcome-style projects: approving a milestone auto-matches the next one
    // (sequential — the client doesn't juggle multiple freelancers up front).
    if (task.project_id && task.milestone_index !== null) {
      const { data: next } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", task.project_id)
        .eq("milestone_index", task.milestone_index + 1)
        .is("claimed_by_user_id", null)
        .maybeSingle();
      if (next) {
        try {
          const res = await fetch("/api/assign", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: next.id }),
          });
          const data = await res.json();
          setNextMilestoneNote(
            res.ok && data.matched
              ? `Milestone ${task.milestone_index + 2} matched to ${data.freelancer?.name}.`
              : "Next milestone posted — matching as soon as a specialist is available."
          );
        } catch {
          setNextMilestoneNote("Next milestone posted — it'll match shortly.");
        }
      }
    }

    await refetch();
    setBusy(null);
  }

  const DOT: Record<string, string> = {
    open: "bg-emerald-500", ai: "bg-emerald-500", claimed: "bg-amber-500",
    delivered: "bg-electric-violet", approved: "bg-emerald-500",
    paid: "bg-emerald-500", closed: "bg-outline-variant",
  };

  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section className="pt-10 mt-10 border-t border-border-crisp">
      <h2 className="text-[13px] font-medium text-on-surface-variant mb-5">{label}</h2>
      {children}
    </section>
  );

  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12">

      {/* ── Header ── */}
      <Link href="/dashboard" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
        <span aria-hidden="true">←</span> Back to dashboard
      </Link>

      {task.project_id && task.milestone_index !== null && (
        <div className="inline-flex items-center gap-1.5 mt-8 text-[12.5px] font-medium text-electric-violet">
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>stacks</span>
          Milestone {task.milestone_index + 1} of {task.milestone_total ?? "?"}
        </div>
      )}

      <p className={`text-[12.5px] text-on-surface-variant mb-3 flex flex-wrap items-center gap-x-2 ${task.project_id ? "mt-1.5" : "mt-8"}`}>
        {task.category && <span>{task.category}</span>}
        {task.category && <span aria-hidden="true">·</span>}
        <span>{timeAgo(task.created_at)}</span>
        {isOwner && <><span aria-hidden="true">·</span><span>Yours</span></>}
        {isMyClaim && <><span aria-hidden="true">·</span><span>Matched to you</span></>}
      </p>

      <h1 className="text-[36px] md:text-[46px] font-light tracking-[-0.035em] text-on-surface leading-[1.05]">
        {task.title}
      </h1>

      {/* ── Facts strip ── */}
      <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 pt-8 border-t border-border-crisp">
        <div>
          <dt className="text-[13px] text-on-surface-variant mb-1">{isMyClaim ? "Your pay" : "Amount"}</dt>
          <dd className="text-[24px] font-semibold tracking-[-0.02em] text-on-surface">{amount ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-on-surface-variant mb-1">Status</dt>
          <dd className="text-[15px] font-medium text-on-surface flex items-center gap-2 mt-2">
            <span className={`w-2 h-2 rounded-full ${DOT[state.tone] ?? "bg-outline-variant"}`} aria-hidden="true" />
            {state.label}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-on-surface-variant mb-1">Deadline</dt>
          <dd className="text-[15px] font-medium text-on-surface mt-2">
            {task.deadline
              ? new Date(task.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
              : "Flexible"}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-on-surface-variant mb-1">Matched specialist</dt>
          <dd className="text-[15px] font-medium text-on-surface mt-2">
            {isMatched
              ? claimerBadges.length > 0
                ? claimerBadges.map(b => `${b.band} · ${b.score}`).join(", ")
                : "Matched"
              : "Matching…"}
          </dd>
        </div>
      </dl>

      {/* ── Notices ── */}
      {(task.match_reason && isMatched && (isOwner || isMyClaim)) ||
      (isMyClaim && task.status !== "delivered" && task.payment_status === "unpaid") ||
      (isOwner && claimStale) ||
      (task.payment_status === "approved" && (isOwner || isMyClaim)) ? (
        <div className="border-y border-border-crisp divide-y divide-border-crisp mt-10">
          {task.match_reason && isMatched && (isOwner || isMyClaim) && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-violet shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                <span className="text-on-surface font-medium">{isMyClaim ? "Why you were matched" : "Why this specialist"}</span>
                {" — "}
                <span className="text-on-surface-variant">{task.match_reason}</span>
              </p>
            </div>
          )}
          {isMyClaim && task.status !== "delivered" && task.payment_status === "unpaid" && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface-variant flex-1 min-w-[240px]">
                Can&apos;t take this one? Decline it and the AI matches another specialist.
              </p>
              <button onClick={releaseClaim} disabled={busy !== null}
                className="text-[13px] font-medium text-on-surface-variant hover:text-error transition-colors shrink-0 disabled:opacity-60">
                <span aria-hidden="true">↳</span> {busy === "release" ? "Declining…" : "Decline this match"}
              </button>
            </div>
          )}
          {isOwner && claimStale && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                This match has gone 72h+ without a delivery.{" "}
                <span className="text-on-surface-variant">Reassign it and the AI matches someone else.</span>
              </p>
              <button onClick={releaseClaim} disabled={busy !== null}
                className="text-[13px] font-medium text-on-surface hover:text-error transition-colors shrink-0 disabled:opacity-60">
                <span aria-hidden="true">↳</span> {busy === "release" ? "Reassigning…" : "Reassign"}
              </button>
            </div>
          )}
          {task.payment_status === "approved" && (isOwner || isMyClaim) && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                Work approved.{" "}
                <span className="text-on-surface-variant">
                  {isOwner ? "Settle up in the payment section below." : "Payment is being arranged below."}
                </span>
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Next step ── */}
      {(canRematch || canDeliver || canApprove) && (
        <Section label="Next step">
          <div className="bg-surface-container-low rounded-2xl p-6">
            {canRematch && (
              <>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-on-surface mb-1.5">Finding your match</h3>
                <p className="text-[13.5px] text-on-surface-variant mb-5">
                  The AI assigns the best vetted specialist for this task automatically. If none was available when you posted, run it again — the pool grows as more people get vetted.
                </p>
                <button
                  onClick={rematch}
                  disabled={busy !== null}
                  className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {busy === "rematch" ? "Matching…" : "Run AI match"}
                </button>
              </>
            )}

            {canDeliver && !showDeliver && (
              <>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-on-surface mb-1.5">You own this task</h3>
                <p className="text-[13.5px] text-on-surface-variant mb-5">
                  When you&apos;re done, submit your deliverable to the client.
                </p>
                <button
                  onClick={() => setShowDeliver(true)}
                  className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition"
                >
                  Submit deliverable
                </button>
              </>
            )}

            {canDeliver && showDeliver && (
              <>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-on-surface mb-4">Your deliverable</h3>
                <textarea
                  value={deliverText}
                  onChange={e => setDeliverText(e.target.value)}
                  rows={6}
                  placeholder="Paste the final work, links to files, or a summary of what you completed…"
                  className="w-full rounded-xl px-4 py-3 text-sm text-on-surface bg-surface-bright focus:outline-none focus:ring-1 focus:ring-outline-variant resize-y mb-4"
                />
                <div className="flex items-center gap-4">
                  <button
                    onClick={deliver}
                    disabled={busy !== null}
                    className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                  >
                    {busy === "deliver" ? "Delivering…" : "Deliver to client"}
                  </button>
                  <button onClick={() => setShowDeliver(false)} className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                    Cancel
                  </button>
                </div>
              </>
            )}

            {canApprove && (
              <>
                <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-on-surface mb-1.5">Deliverable is in</h3>
                <p className="text-[13.5px] text-on-surface-variant mb-5">
                  Review the Pilot&apos;s work below — or let the AI check it against your brief first.
                </p>

                {aiReview ? (
                  <div className="rounded-xl bg-surface-bright p-5 mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-on-surface">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          aiReview.verdict === "approve" ? "bg-emerald-500"
                          : aiReview.verdict === "request_changes" ? "bg-error" : "bg-amber-500"
                        }`} aria-hidden="true" />
                        AI quality review
                      </span>
                      <span className="text-[15px] font-semibold text-on-surface">{aiReview.score}/100</span>
                    </div>
                    <p className="text-[13.5px] text-on-surface-variant leading-relaxed mb-2">{aiReview.summary}</p>
                    {aiReview.strengths.length > 0 && (
                      <p className="text-[13px] text-on-surface-variant">
                        <span className="text-on-surface font-medium">Strong</span> — {aiReview.strengths.join(" · ")}
                      </p>
                    )}
                    {aiReview.gaps.length > 0 && (
                      <p className="text-[13px] text-on-surface-variant mt-1">
                        <span className="text-on-surface font-medium">Gaps</span> — {aiReview.gaps.join(" · ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={requestReview}
                    disabled={busy !== null}
                    className="flex items-center gap-2 text-[13.5px] font-medium text-on-surface hover:text-electric-violet transition-colors mb-5 disabled:opacity-60"
                  >
                    {busy === "review" ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-electric-violet/30 border-t-electric-violet rounded-full animate-spin" />
                        Reviewing against your brief…
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">↳</span> Get the free AI quality review
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={approve}
                  disabled={busy !== null}
                  className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {busy === "approve" ? "Approving…" : "Approve & continue to payment"}
                </button>
                {nextMilestoneNote && (
                  <p className="text-[13px] text-emerald-600 dark:text-emerald-400 mt-3">
                    <span aria-hidden="true">↳</span> {nextMilestoneNote}
                  </p>
                )}
              </>
            )}

            {error && <p className="text-[13px] text-error mt-4">{error}</p>}
          </div>
        </Section>
      )}

      {/* ── Brief ── */}
      <Section label="Brief">
        <p className="text-[15px] text-on-surface leading-relaxed whitespace-pre-wrap max-w-[640px]">
          {task.brief}
        </p>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {attachments.map(a => (
              <a
                key={a.id}
                href={`https://nwdkgtoepffnedspabkt.supabase.co/storage/v1/object/public/task-files/${a.storage_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface hover:border-outline transition-colors"
              >
                {a.file_name}
                {a.file_size ? <span className="text-on-surface-variant font-normal">{Math.round(a.file_size / 1024)} KB</span> : null}
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* ── Deliverable ── */}
      {task.deliverable_text && (task.status === "delivered" || task.payment_status !== "unpaid") && (
        <Section label={deliverableUnlocked ? "Deliverable" : "Deliverable — preview until payment is confirmed"}>
          {deliverableUnlocked ? (
            <div className="bg-surface-container-low rounded-2xl p-6 text-[14px] text-on-surface leading-relaxed whitespace-pre-wrap">
              {task.deliverable_text}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-6">
              <div className="relative">
                <p className="text-[14px] text-on-surface leading-relaxed whitespace-pre-wrap max-h-[110px] overflow-hidden">
                  {task.deliverable_text.slice(0, 300)}
                </p>
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-container-low to-transparent" />
              </div>
              <p className="text-[13px] text-on-surface-variant mt-4 leading-relaxed max-w-[560px]">
                You're seeing a preview. Run the free AI quality review above to check it
                against your brief — then approve and pay to unlock everything. The Pilot
                only gets paid when you confirm, and you only pay for verified work.
              </p>
            </div>
          )}
        </Section>
      )}

      {/* ── Payment ── */}
      <PaymentFlow task={task} userId={userId} isOwner={isOwner} isMyClaim={isMyClaim} onPaid={refetch} />

      {/* ── Messages ── */}
      {task.claimed_by_user_id && (isOwner || isMyClaim) && (
        <TaskChat taskId={task.id} userId={userId} posterId={task.poster_id} />
      )}

    </div>
  );
}
