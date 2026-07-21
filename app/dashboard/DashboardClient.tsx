"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  type ArenaTask, type Payment, type Profile, type PayoutMethod, type Project,
  CATEGORIES, PAYOUT_METHODS, formatAmount, taskState,
} from "@/lib/arena";
import Link from "next/link";
import Tour, { type TourStep } from "@/components/Tour";
import {
  parseTaskLimitError, activeSub, pendingSub, FREE_TASKS_PER_MONTH,
  type Subscription,
} from "@/lib/billing";
import ProjectComposer from "@/components/dashboard/ProjectComposer";

export default function DashboardClient({
  userId,
  email,
  initialProfile,
  vettedBadges = [],
}: {
  userId: string;
  email: string;
  initialProfile: Profile;
  vettedBadges?: { category: string; band: string; score: number }[];
}) {
  const params = useSearchParams();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [tasks, setTasks] = useState<ArenaTask[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const incomingBrief = params.get("brief") ?? "";
  const [composerOpen, setComposerOpen] = useState(!!incomingBrief);
  const [projectComposerOpen, setProjectComposerOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(params.get("payout") === "1");
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const isPilot = profile.mode === "pilot";

  // ── Data ──────────────────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    const supabase = supabaseBrowser();
    const [{ data }, { data: pays }, { data: subRows }, { data: projRows }] = await Promise.all([
      // deliverable_text/agent_deliverable are column-locked at the DB level
      // (see get_task_full) — the dashboard list never renders them, so an
      // explicit column list avoids a 403 that select("*") would now hit.
      supabase.from("tasks").select(
        "id, created_at, client_id, title, brief, category, origin, status, agent_completion, agent_summary, poster_id, amount_cents, claimed_by_user_id, claimed_at, payment_status, stripe_payment_intent_id, mount_points, ai_review, deadline, match_reason, match_score, matched_at, project_id, milestone_index, milestone_total"
      ).order("created_at", { ascending: false }).limit(120),
      supabase.from("payments").select("*").or(`payer_id.eq.${userId},payee_id.eq.${userId}`),
      supabase.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      // RLS: poster sees their own projects; freelancers see projects via a
      // milestone task matched to them (see migration 0010).
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
    ]);
    // deliverable_text/agent_deliverable are never fetched here (see the
    // column-locked select above) — stub them so the shared ArenaTask type
    // still lines up. Nothing in the dashboard list reads either field.
    if (data) setTasks(data.map(t => ({ ...t, deliverable_text: null, agent_deliverable: null })) as ArenaTask[]);
    if (pays) setPayments(pays as Payment[]);
    if (subRows) setSubs(subRows as Subscription[]);
    if (projRows) setProjects(projRows as Project[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refetch();
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel("tasks-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  // ── Derived ───────────────────────────────────────────────────────────────
  // AI-matching model: freelancers see work assigned to them; clients see what
  // they posted. No browsing, no claiming.
  const myTasks = useMemo(() => {
    const list = isPilot
      ? tasks.filter(t => t.claimed_by_user_id === userId)
      : tasks.filter(t => t.poster_id === userId);
    const q = search.trim().toLowerCase();
    return q ? list.filter(t => t.title.toLowerCase().includes(q) || t.brief.toLowerCase().includes(q)) : list;
  }, [tasks, isPilot, userId, search]);

  const projectsById = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

  // Outcome-style intake: tasks sharing a project_id render as one collapsed
  // project card (milestone progress) instead of N separate rows.
  const { standaloneTasks, projectGroups } = useMemo(() => {
    const groups = new Map<string, ArenaTask[]>();
    const solo: ArenaTask[] = [];
    for (const t of myTasks) {
      if (t.project_id) {
        const arr = groups.get(t.project_id) ?? [];
        arr.push(t);
        groups.set(t.project_id, arr);
      } else {
        solo.push(t);
      }
    }
    for (const arr of groups.values()) arr.sort((a, b) => (a.milestone_index ?? 0) - (b.milestone_index ?? 0));
    return { standaloneTasks: solo, projectGroups: groups };
  }, [myTasks]);

  const stats = useMemo(() => {
    if (isPilot) {
      const matched = tasks.filter(t => t.claimed_by_user_id === userId);
      const delivered = matched.filter(t => t.status === "delivered" || t.payment_status !== "unpaid");
      const active = matched.filter(t => t.status !== "delivered" && t.payment_status === "unpaid");
      const earned = payments
        .filter(p => p.payee_id === userId && p.status === "confirmed")
        .reduce((sum, p) => sum + p.amount_cents, 0);
      return [
        { label: "Matched to you", value: String(matched.length) },
        { label: "Active", value: String(active.length) },
        { label: "Delivered", value: String(delivered.length) },
        { label: "Earned", value: formatAmount(earned) ?? "$0" },
      ];
    }
    const posted = tasks.filter(t => t.poster_id === userId);
    return [
      { label: "Tasks posted", value: String(posted.length) },
      { label: "Matched", value: String(posted.filter(t => t.claimed_by_user_id).length) },
      { label: "In progress", value: String(posted.filter(t => t.claimed_by_user_id && t.status !== "delivered" && t.payment_status === "unpaid").length) },
      { label: "Delivered", value: String(posted.filter(t => t.status === "delivered" || t.payment_status !== "unpaid").length) },
    ];
  }, [tasks, isPilot, userId, payments]);

  const firstName = (profile.display_name || email.split("@")[0]).split(" ")[0];
  const notMatchable = isPilot && vettedBadges.length === 0;

  // Billing (clients only). Free = FREE_TASKS_PER_MONTH posts/mo; DB trigger
  // enforces the real cap, this is just the visible usage meter.
  const currentSub = !isPilot ? activeSub(subs) : null;
  const pendingSubRow = !isPilot ? pendingSub(subs) : null;
  const postedThisMonth = useMemo(() => {
    if (isPilot) return 0;
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    return tasks.filter(t => t.poster_id === userId && new Date(t.created_at) >= start).length;
  }, [tasks, isPilot, userId]);
  const monthlyLimit = currentSub?.tier === "scale" ? null : currentSub?.tier === "pro" ? 50 : FREE_TASKS_PER_MONTH;
  const planLabel = currentSub?.tier === "scale" ? "Scale" : currentSub?.tier === "pro" ? "Pro" : "Free";
  const fmtExpiry = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const DOT: Record<string, string> = {
    open: "bg-amber-500", claimed: "bg-electric-violet", delivered: "bg-purple-500",
    approved: "bg-emerald-500", paid: "bg-emerald-500", closed: "bg-outline-variant", ai: "bg-amber-500",
  };
  const fmtDeadline = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <div className="mx-auto max-w-[1080px] px-5 md:px-8 py-12">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.035em] leading-none text-on-surface">
            {isPilot ? `Hi, ${firstName}` : "Overview"}
          </h1>
          <p className="text-[14px] text-on-surface-variant mt-3 max-w-[500px]">
            {isPilot
              ? "Work the AI matched to your vetted skills. Deliver, get paid. No bidding."
              : "Post a task and the AI assigns the best vetted specialist. No proposals, no browsing."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isPilot ? (
            <button
              data-tour="payout"
              onClick={() => setPayoutOpen(true)}
              className="h-9 px-4 rounded-full border border-border-crisp text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
            >
              Payout settings
            </button>
          ) : (
            <>
              <Link
                data-tour="plan"
                href="/billing"
                className="h-9 flex items-center gap-2 px-4 rounded-full border border-border-crisp text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${planLabel === "Free" ? "bg-outline-variant" : "bg-electric-violet"}`} aria-hidden="true" />
                {planLabel} plan
                {monthlyLimit !== null && <span className="text-on-surface-variant/70">· {postedThisMonth}/{monthlyLimit}</span>}
              </Link>
              <button
                onClick={() => setProjectComposerOpen(true)}
                className="h-9 px-4 rounded-full border border-border-crisp text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors"
              >
                New project
              </button>
              <button
                data-tour="post"
                onClick={() => setComposerOpen(true)}
                className="h-9 px-5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 transition-opacity"
              >
                Post a task
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Notices — hairline rows ── */}
      {(isPilot || payments.some(p => p.payee_id === userId && p.status === "payment_sent") || (!isPilot && (pendingSubRow || (monthlyLimit !== null && postedThisMonth >= monthlyLimit)))) && (
        <div className="border-y border-border-crisp divide-y divide-border-crisp mb-10">
          {!isPilot && pendingSubRow && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                <span className="capitalize font-medium">{pendingSubRow.tier}</span>. Awaiting your Airtm payment.{" "}
                <span className="text-on-surface-variant">Reference {pendingSubRow.reference}. We activate it as soon as the transfer lands.</span>
              </p>
              <Link href="/billing" className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors shrink-0">
                <span aria-hidden="true">↳</span> Payment details
              </Link>
            </div>
          )}
          {!isPilot && !pendingSubRow && monthlyLimit !== null && postedThisMonth >= monthlyLimit && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                You&apos;ve used all {monthlyLimit} posts on the {planLabel} plan this month.{" "}
                <span className="text-on-surface-variant">Upgrade to keep hiring. From $20/mo.</span>
              </p>
              <Link href="/billing" className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors shrink-0">
                <span aria-hidden="true">↳</span> Upgrade plan
              </Link>
            </div>
          )}
          {notMatchable && (
            <div data-tour="vetting" className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-violet shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                Pass the AI skill interview so we can match you to work.{" "}
                <span className="text-on-surface-variant">Graded like a senior practitioner. Clients see your score.</span>
              </p>
              <Link href="/vetting" className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors shrink-0">
                <span aria-hidden="true">↳</span> Get vetted
              </Link>
            </div>
          )}
          {isPilot && vettedBadges.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface-variant flex-1 min-w-[240px]">
                <span className="text-on-surface font-medium">Vetted</span>
                {". "}
                {vettedBadges.map(b => `${b.category} · ${b.band} ${b.score}`).join("  ·  ")}
                {" · "}
                <span>We email you the moment work is matched to you.</span>
              </p>
              <Link href="/vetting" className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors shrink-0">
                <span aria-hidden="true">↳</span> Add a category
              </Link>
            </div>
          )}
          {isPilot && !profile.payout_handle && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                Add payout details so clients can pay you.{" "}
                <span className="text-on-surface-variant">Airtm, InstaPay, Vodafone Cash, USDT & more.</span>
              </p>
              <button onClick={() => setPayoutOpen(true)} className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors shrink-0">
                <span aria-hidden="true">↳</span> Set up payouts
              </button>
            </div>
          )}
          {payments.some(p => p.payee_id === userId && p.status === "payment_sent") && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                Money incoming. A client marked a payment as sent.{" "}
                <span className="text-on-surface-variant">Open the task to confirm you received it.</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Stats ── */}
      <dl data-tour="stats" className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 mb-10 border-b border-border-crisp">
        {stats.map(st => (
          <div key={st.label}>
            <dt className="text-[13px] text-on-surface-variant mb-1">{st.label}</dt>
            <dd className="text-[28px] font-semibold tracking-[-0.02em] text-on-surface">{st.value}</dd>
          </div>
        ))}
      </dl>

      {/* ── List header + search ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-[15px] font-medium text-on-surface">
          {isPilot ? "My matches" : "My tasks & projects"}
        </h2>
        {myTasks.length > 0 && (
          <div className="ml-auto w-full sm:w-64">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full h-9 px-4 rounded-full bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-outline-variant"
            />
          </div>
        )}
      </div>

      {/* ── Task list ── */}
      {loading ? (
        <div className="divide-y divide-border-crisp border-t border-border-crisp">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-5">
              <div className="h-4 w-2/3 bg-surface-container rounded animate-pulse mb-2" />
              <div className="h-3 w-1/3 bg-surface-container rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : myTasks.length === 0 ? (
        <EmptyState
          isPilot={isPilot}
          matchable={!notMatchable}
          onPost={() => setComposerOpen(true)}
          onNewProject={!isPilot ? () => setProjectComposerOpen(true) : undefined}
        />
      ) : (
        <div className="divide-y divide-border-crisp border-t border-border-crisp">
          {[...projectGroups.entries()].map(([projectId, milestones]) => {
            const project = projectsById.get(projectId);
            const expanded = expandedProjects.has(projectId);
            const doneCount = milestones.filter(m => m.payment_status === "paid" || m.status === "delivered").length;
            const totalAmount = milestones.reduce((sum, m) => sum + (m.amount_cents || 0), 0);
            const currentMilestone = milestones.find(m => m.status !== "delivered" && m.payment_status !== "paid") ?? milestones[milestones.length - 1];
            return (
              <div key={projectId} className="py-5">
                <button
                  onClick={() => setExpandedProjects(s => {
                    const next = new Set(s);
                    next.has(projectId) ? next.delete(projectId) : next.add(projectId);
                    return next;
                  })}
                  className="group flex items-center gap-6 w-full text-left transition-colors hover:bg-surface-container-low -mx-3 px-3 py-1 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-on-surface truncate flex items-center gap-2">
                      <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px" }}>stacks</span>
                      {project?.title ?? "Project"}
                    </p>
                    <p className="text-[12.5px] text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{milestones.length} milestone{milestones.length === 1 ? "" : "s"}</span>
                      <span aria-hidden="true">·</span>
                      <span>{doneCount}/{milestones.length} delivered</span>
                      {!isPilot && currentMilestone && !currentMilestone.claimed_by_user_id && (
                        <><span aria-hidden="true">·</span><span className="text-electric-violet">Finding a match for milestone {(currentMilestone.milestone_index ?? 0) + 1}…</span></>
                      )}
                    </p>
                  </div>
                  {totalAmount > 0 && (
                    <span className="text-[15px] font-semibold tracking-[-0.01em] text-on-surface shrink-0">{formatAmount(totalAmount)}</span>
                  )}
                  <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-on-surface transition-colors shrink-0" style={{ fontSize: "20px" }}>
                    {expanded ? "expand_less" : "expand_more"}
                  </span>
                </button>
                {expanded && (
                  <div className="mt-3 ml-3 pl-4 border-l-2 border-border-crisp space-y-1">
                    {milestones.map(m => {
                      const state = taskState(m);
                      const amount = formatAmount(m.amount_cents);
                      return (
                        <Link key={m.id} href={`/t/${m.id}`} className="group flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg transition-colors hover:bg-surface-container-low">
                          <span className="text-[12px] text-on-surface-variant shrink-0 w-16">Milestone {(m.milestone_index ?? 0) + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13.5px] font-medium text-on-surface truncate">{m.title}</p>
                            <p className="text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${DOT[state.tone] ?? "bg-outline-variant"}`} aria-hidden="true" />
                              {state.label}
                              {m.deadline && <><span aria-hidden="true">·</span><span>Due {fmtDeadline(m.deadline)}</span></>}
                            </p>
                          </div>
                          {amount && <span className="text-[13px] font-medium text-on-surface shrink-0">{amount}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {standaloneTasks.map(t => {
            const state = taskState(t);
            const amount = formatAmount(t.amount_cents);
            return (
              <Link key={t.id} href={`/t/${t.id}`} className="group flex items-center gap-6 py-5 transition-colors hover:bg-surface-container-low -mx-3 px-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-on-surface truncate">{t.title}</p>
                  <p className="text-[12.5px] text-on-surface-variant mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {t.category && <><span>{t.category}</span><span aria-hidden="true">·</span></>}
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${DOT[state.tone] ?? "bg-outline-variant"}`} aria-hidden="true" />
                      {state.label}
                    </span>
                    {t.deadline && <><span aria-hidden="true">·</span><span>Due {fmtDeadline(t.deadline)}</span></>}
                    {!isPilot && !t.claimed_by_user_id && <><span aria-hidden="true">·</span><span className="text-electric-violet">Finding a match…</span></>}
                  </p>
                </div>
                {amount && (
                  <span className="text-[15px] font-semibold tracking-[-0.01em] text-on-surface shrink-0">{amount}</span>
                )}
                <span className="text-on-surface-variant/40 group-hover:text-on-surface transition-colors shrink-0" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* First-visit guided tour. Skippable; remembered per browser. */}
      {!loading && (
        <Tour
          storageKey={`hyrde-tour-${profile.mode}-v2`}
          steps={
            (isPilot
              ? [
                  { id: "vetting", title: "Get vetted first", body: "Pass a ~10-minute AI skill interview once. Then the AI matches you to client work automatically. No bidding." },
                  { id: "stats", title: "Your numbers, live", body: "Work matched to you, what's active, delivered, and confirmed earnings. Updating in real time." },
                  { id: "payout", title: "How you get paid", body: "Add your Airtm, InstaPay, Vodafone Cash, USDT, PayPal, or bank details so clients can pay you directly." },
                ]
              : [
                  { id: "post", title: "Post a task", body: "Describe what you need. AI structures your brief, then assigns the best vetted specialist. No proposals to sift." },
                  { id: "stats", title: "Your numbers, live", body: "Tasks posted, matched, in progress, and delivered. Updating in real time." },
                ]) as TourStep[]
          }
        />
      )}

      {composerOpen && (
        <Composer
          initialBrief={incomingBrief}
          userId={userId}
          onClose={() => setComposerOpen(false)}
          onPosted={() => { setComposerOpen(false); refetch(); }}
        />
      )}

      {projectComposerOpen && (
        <ProjectComposer
          userId={userId}
          remainingPosts={monthlyLimit === null ? null : Math.max(0, monthlyLimit - postedThisMonth)}
          onClose={() => setProjectComposerOpen(false)}
          onCreated={(projectId) => {
            setProjectComposerOpen(false);
            setExpandedProjects(s => new Set(s).add(projectId));
            refetch();
          }}
        />
      )}

      {payoutOpen && (
        <PayoutModal
          userId={userId}
          profile={profile}
          onClose={() => setPayoutOpen(false)}
          onSaved={(method, handle) => {
            setProfile(p => ({ ...p, payout_method: method, payout_handle: handle }));
            setPayoutOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Payout settings modal ────────────────────────────────────────────────────

function PayoutModal({ userId, profile, onClose, onSaved }: {
  userId: string;
  profile: Profile;
  onClose: () => void;
  onSaved: (method: PayoutMethod, handle: string) => void;
}) {
  const [method, setMethod] = useState<PayoutMethod>(profile.payout_method ?? "airtm");
  const [handle, setHandle] = useState(profile.payout_handle ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (handle.trim().length < 4) { setError("Enter the account you get paid on."); return; }
    setBusy(true); setError("");
    const { error } = await supabaseBrowser()
      .from("profiles")
      .update({ payout_method: method, payout_handle: handle.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) { setError(error.message); setBusy(false); return; }
    onSaved(method, handle.trim());
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">Payout details</h2>
          <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <p className="text-sm font-body text-on-surface-variant mb-6">
          Where clients send your money. Shown only to clients paying you for approved work.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {(Object.keys(PAYOUT_METHODS) as PayoutMethod[]).map(m => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex flex-col items-start gap-1 border rounded-xl px-3.5 py-3 text-left transition-colors ${
                method === m
                  ? "border-electric-violet bg-electric-violet/8"
                  : "border-border-crisp hover:border-electric-violet/40"
              }`}
            >
              <span className={`material-symbols-outlined ${method === m ? "text-electric-violet" : "text-on-surface-variant"}`} style={{ fontSize: "18px" }}>
                {PAYOUT_METHODS[m].icon}
              </span>
              <span className={`text-xs font-semibold font-body ${method === m ? "text-electric-violet" : "text-on-surface"}`}>
                {PAYOUT_METHODS[m].label}
              </span>
            </button>
          ))}
        </div>

        <input
          value={handle}
          onChange={e => setHandle(e.target.value)}
          placeholder={PAYOUT_METHODS[method].placeholder}
          className="w-full border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet mb-4"
        />

        {error && <p className="text-sm font-body text-error mb-3">{error}</p>}

        <button
          onClick={save}
          disabled={busy}
          className="w-full bg-electric-violet text-white text-sm font-semibold font-body px-6 py-3.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save payout details"}
        </button>
      </div>
    </div>
  );
}

// ─── Small pieces ─────────────────────────────────────────────────────────────

function EmptyState({ isPilot, matchable, onPost, onNewProject }: {
  isPilot: boolean; matchable: boolean; onPost: () => void; onNewProject?: () => void;
}) {
  return (
    <div className="border-t border-border-crisp py-16">
      <p className="text-[17px] font-medium text-on-surface mb-1.5">
        {isPilot ? "No matches yet" : "No tasks posted yet"}
      </p>
      <p className="text-[13.5px] text-on-surface-variant max-w-[440px] mb-5">
        {isPilot
          ? matchable
            ? "You're vetted. As soon as a client posts work that fits your skills, the AI matches it to you. It shows up here and you get an email with the pay and deadline. No need to keep checking."
            : "Pass the AI skill interview first. Once you're vetted, matching work comes to you automatically. You'll get an email the moment it happens."
          : "Post a single task, or describe a bigger outcome and let the AI break it into a milestone plan."}
      </p>
      {isPilot ? (
        <Link href="/vetting" className="text-[13.5px] font-medium text-on-surface hover:text-electric-violet transition-colors">
          <span aria-hidden="true">↳</span> {matchable ? "Add another category" : "Get vetted"}
        </Link>
      ) : (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <button onClick={onPost} className="text-[13.5px] font-medium text-on-surface hover:text-electric-violet transition-colors">
            <span aria-hidden="true">↳</span> Post your first task
          </button>
          {onNewProject && (
            <button onClick={onNewProject} className="text-[13.5px] font-medium text-on-surface-variant hover:text-electric-violet transition-colors">
              <span aria-hidden="true">↳</span> Or describe a bigger project
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Post-task composer (modal) ───────────────────────────────────────────────

function Composer({ userId, onClose, onPosted, initialBrief = "" }: {
  userId: string; onClose: () => void; onPosted: () => void; initialBrief?: string;
}) {
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState(initialBrief);
  const [cat, setCat] = useState<string>(CATEGORIES[0]);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [phase, setPhase] = useState<"form" | "matching" | "done" | "error">("form");
  const [matchResult, setMatchResult] = useState<{ matched: boolean; freelancer?: { name: string; band: string; score: number }; reason?: string } | null>(null);
  const [limitHit, setLimitHit] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [polishNote, setPolishNote] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const ACCEPTED = ".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.csv,.doc,.docx,.xls,.xlsx,.zip";
  const MAX_FILE_MB = 10;

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        setError(`${f.name} is over ${MAX_FILE_MB}MB. Link large files in the brief instead.`);
        continue;
      }
      if (next.length >= 5) break;
      if (!next.some(x => x.name === f.name && x.size === f.size)) next.push(f);
    }
    setFiles(next);
  }
  const [error, setError] = useState("");

  async function polish() {
    const rough = [title.trim(), brief.trim()].filter(Boolean).join(". ");
    if (rough.length < 10) {
      setError("Write a rough sentence or two first. Then the AI can shape it.");
      return;
    }
    setError(""); setPolishing(true); setPolishNote("");
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rough }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Assistant unavailable."); return; }
      setTitle(data.title || title);
      setBrief(data.brief || brief);
      if (data.category) setCat(data.category);
      if (data.budgetUsd && !budget) setBudget(String(data.budgetUsd));
      if (data.note) setPolishNote(data.note);
    } catch {
      setError("Assistant unavailable. Try again.");
    } finally {
      setPolishing(false);
    }
  }

  async function post() {
    if (title.trim().length < 6 || brief.trim().length < 20) {
      setError("Give the task a clear title and a couple of sentences of brief.");
      return;
    }
    setError("");
    setPhase("matching");

    const supabase = supabaseBrowser();
    const amountCents = Math.round(parseFloat(budget || "0") * 100) || 0;

    const { data: inserted, error: insErr } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        brief: brief.trim(),
        category: cat,
        origin: "human",
        status: "open",
        poster_id: userId,
        amount_cents: amountCents,
        deadline: deadline ? new Date(deadline).toISOString() : null,
      })
      .select()
      .single();

    if (insErr || !inserted) {
      const limit = insErr ? parseTaskLimitError(insErr.message) : null;
      setError(
        limit
          ? limit.tier === "free"
            ? `You've used your ${limit.limit} free task posts this month. Upgrade to keep hiring. From $20/mo.`
            : `You've hit your plan's ${limit.limit} posts this month. Upgrade to Scale for unlimited posting.`
          : insErr?.message ?? "Could not post the task."
      );
      setLimitHit(!!limit);
      setPhase("form");
      return;
    }

    // Upload attachments to the public task-files bucket (path starts with the
    // uploader's id — required by the storage delete policy).
    if (files.length) {
      const supa = supabaseBrowser();
      for (const f of files) {
        const path = `${userId}/${inserted.id}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
        const { error: upErr } = await supa.storage.from("task-files").upload(path, f);
        if (!upErr) {
          await supa.from("task_attachments").insert({
            task_id: inserted.id,
            uploaded_by: userId,
            file_name: f.name,
            file_size: f.size,
            storage_path: path,
            mime_type: f.type || null,
          });
        }
      }
    }

    // AI matches the task to the best vetted freelancer — no browsing, no claiming.
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: inserted.id }),
      });
      const data = await res.json();
      setMatchResult(res.ok ? data : { matched: false });
    } catch {
      setMatchResult({ matched: false });
    }
    setPhase("done");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-6" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {phase === "done" ? (
          <div className="text-center py-6">
            {matchResult?.matched ? (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 mb-4">
                  <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontVariationSettings: "'FILL' 1" }}>person_check</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Matched. {matchResult.freelancer?.name}</h2>
                <p className="text-sm text-on-surface-variant mb-2 max-w-[380px] mx-auto">{matchResult.reason}</p>
                <p className="text-[12px] text-on-surface-variant mb-6">
                  {matchResult.freelancer?.band} · {matchResult.freelancer?.score} vetting score
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 mb-4">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Task posted. Finding your match</h2>
                <p className="text-sm text-on-surface-variant mb-6 max-w-[380px] mx-auto">
                  No vetted specialist is available in this category just yet. We&apos;ll match
                  it as soon as one passes the interview. You&apos;ll see it update automatically.
                </p>
              </>
            )}
            <button onClick={onPosted} className="bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3 rounded-full hover:opacity-90">
              View my tasks
            </button>
          </div>
        ) : phase === "matching" ? (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-[3px] border-electric-violet/25 border-t-electric-violet rounded-full animate-spin mx-auto mb-5" />
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Matching you with a vetted specialist…</h2>
            <p className="text-sm text-on-surface-variant">The AI is scoring vetted freelancers against your brief.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface">Post a task</h2>
              <button onClick={onClose} aria-label="Close" className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Task title. E.g. Landing page copy for my coffee brand"
                className="border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
              />
              <textarea
                value={brief}
                onChange={e => setBrief(e.target.value)}
                rows={4}
                placeholder="Describe the work. What's the goal, the audience, the deadline? The more context, the further the AI gets."
                className="border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet resize-y"
              />

              <div className="flex items-center gap-3 -mt-1">
                <button
                  type="button"
                  onClick={polish}
                  disabled={polishing}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-electric-violet border border-electric-violet/35 rounded-lg px-3.5 py-2 hover:bg-electric-violet/5 transition disabled:opacity-60"
                >
                  {polishing ? (
                    <>
                      <span className="w-3 h-3 border-2 border-electric-violet/30 border-t-electric-violet rounded-full animate-spin" />
                      Structuring your brief…
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">↳</span> Polish with AI
                    </>
                  )}
                </button>
                {polishNote && (
                  <p className="text-[12px] text-on-surface-variant flex-1">{polishNote}</p>
                )}
              </div>

              {/* Attachments — brief context beats guesswork */}
              <div>
                <label className="inline-flex items-center gap-1.5 text-[13px] font-medium text-on-surface-variant border border-border-crisp rounded-lg px-3.5 py-2 cursor-pointer hover:border-outline transition-colors">
                  Attach files
                  <span className="text-[11px] font-normal">PDF, images, docs, zip · 10MB max</span>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED}
                    className="hidden"
                    onChange={e => { addFiles(e.target.files); e.target.value = ""; }}
                  />
                </label>
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {files.map(f => (
                      <span key={f.name + f.size} className="inline-flex items-center gap-1 bg-surface-container rounded-md px-2 py-1 text-[12px] text-on-surface">
                        {f.name}
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter(x => x !== f))}
                          aria-label={`Remove ${f.name}`}
                          className="material-symbols-outlined text-on-surface-variant hover:text-error"
                          style={{ fontSize: "14px" }}
                        >
                          close
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <select
                  value={cat}
                  onChange={e => setCat(e.target.value)}
                  className="flex-1 border border-border-crisp rounded-xl px-3 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">$</span>
                  <input
                    value={budget}
                    onChange={e => setBudget(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Budget"
                    inputMode="decimal"
                    className="w-full border border-border-crisp rounded-xl pl-7 pr-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                  />
                </div>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-on-surface-variant">Deadline (optional)</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="border border-border-crisp rounded-xl px-4 py-3 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                />
              </label>

              {error && (
                <div className="text-sm font-body text-error">
                  {error}
                  {limitHit && (
                    <Link href="/billing" className="block mt-2 text-[13.5px] font-medium text-on-surface hover:text-electric-violet transition-colors">
                      <span aria-hidden="true">↳</span> See plans &amp; upgrade
                    </Link>
                  )}
                </div>
              )}

              <button
                onClick={post}
                className="mt-1 flex items-center justify-center gap-2 bg-on-surface text-inverse-on-surface text-sm font-medium px-6 py-3.5 rounded-full hover:opacity-90 transition"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "17px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
                Post & match
              </button>
              <p className="text-[11px] font-body text-on-surface-variant text-center">
                The AI matches your task to the best vetted specialist. No bidding, no browsing.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
