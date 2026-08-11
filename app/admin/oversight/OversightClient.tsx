"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export type OverviewTask = {
  id: string;
  title: string;
  category: string | null;
  amount_cents: number | null;
  status: string;
  payment_status: string | null;
  created_at: string;
  deadline: string | null;
  match_reason: string | null;
  match_score: number | null;
  project_id: string | null;
  milestone_index: number | null;
  milestone_total: number | null;
  poster_email: string | null;
  poster_name: string | null;
  freelancer_email: string | null;
  freelancer_name: string | null;
  freelancer_vetting_score: number | null;
  freelancer_vetting_band: string | null;
  freelancer_vetting_category: string | null;
};

export type OverviewStats = {
  clients: number;
  freelancers: number;
  vetted: number;
  tasks_total: number;
  tasks_matched: number;
  tasks_unmatched: number;
};

// A task is "high value" above this — the threshold where a bad match actually
// costs the client real money and deserves a human glance.
const HIGH_VALUE_CENTS = 20000; // $200

type Flag = { level: "danger" | "warn"; text: string };

// The core of this dashboard: surface matches that a human should eyeball before
// trusting them, at this early manual-review stage.
function reviewFlags(t: OverviewTask): Flag[] {
  const flags: Flag[] = [];
  const matched = !!t.freelancer_email;
  const high = (t.amount_cents ?? 0) >= HIGH_VALUE_CENTS;

  if (matched) {
    // Matched to someone with NO passing vetting in this task's category — i.e.
    // matched via the "Other" catch-all or a data gap. Biggest red flag.
    if (t.freelancer_vetting_score == null) {
      flags.push({ level: "danger", text: "Assigned freelancer has no passing vetting in this category" });
    } else {
      // Vetting is in a different category than the task (matched through "Other").
      if (t.freelancer_vetting_category && t.category && t.freelancer_vetting_category !== t.category) {
        flags.push({ level: "warn", text: `Vetted in ${t.freelancer_vetting_category}, not ${t.category}` });
      }
      // High-value task handed to a minimum-band freelancer.
      if (high && t.freelancer_vetting_band === "Vetted") {
        flags.push({ level: "warn", text: "High-value task + minimum vetting band" });
      }
    }
  } else if (high && t.status !== "closed") {
    flags.push({ level: "warn", text: "High-value task still unmatched" });
  }
  return flags;
}

const CANCELLABLE = new Set(["open", "mounted", "in_progress", "agent_attempted"]);

export default function OversightClient({ tasks, stats }: { tasks: OverviewTask[]; stats: OverviewStats }) {
  const [search, setSearch] = useState("");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Admin can pull back a bad auto-match: unassigns the freelancer and closes the
  // task (server-enforced; delivered/paid work is protected).
  async function cancelTask(id: string, title: string) {
    if (!confirm(`Cancel "${title}"? This unassigns the matched specialist and closes the task.`)) return;
    setCancelling(id);
    const { error } = await supabaseBrowser().rpc("cancel_task", { p_task: id });
    setCancelling(null);
    if (error) { alert(error.message); return; }
    window.location.reload();
  }

  const withFlags = useMemo(
    () => tasks.map(t => ({ t, flags: reviewFlags(t) })),
    [tasks]
  );
  const flaggedCount = withFlags.filter(x => x.flags.length > 0).length;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withFlags.filter(({ t, flags }) => {
      if (reviewOnly && flags.length === 0) return false;
      if (!q) return true;
      return [t.title, t.poster_email, t.poster_name, t.freelancer_email, t.freelancer_name, t.category]
        .some(v => (v ?? "").toLowerCase().includes(q));
    });
  }, [withFlags, search, reviewOnly]);

  const money = (c: number | null) => (c && c > 0 ? `$${(c / 100).toLocaleString()}` : "—");
  const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const bandColor: Record<string, string> = {
    Vetted: "text-amber-600",
    Strong: "text-emerald-600",
    Exceptional: "text-electric-violet",
  };

  return (
    <div className="mx-auto max-w-[1200px] px-5 md:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          <span aria-hidden="true">←</span> Admin · billing
        </Link>
        <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border-crisp text-xs font-medium text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-violet" aria-hidden="true" /> Internal · read-only
        </span>
      </div>

      <h1 className="text-[40px] font-light tracking-[-0.035em] leading-none text-on-surface mt-8 mb-2">Oversight</h1>
      <p className="text-[14px] text-on-surface-variant mb-8 max-w-[620px]">
        Every task, who it matched to, and their vetting for that category. So a high-value task landing
        with an under-qualified freelancer gets caught by hand while we&apos;re still small.
      </p>

      {/* Stats */}
      <dl className="grid grid-cols-3 md:grid-cols-6 gap-6 pb-8 mb-8 border-b border-border-crisp">
        {[
          ["Clients", stats.clients],
          ["Freelancers", stats.freelancers],
          ["Vetted", stats.vetted],
          ["Tasks", stats.tasks_total],
          ["Matched", stats.tasks_matched],
          ["Unmatched", stats.tasks_unmatched],
        ].map(([label, val]) => (
          <div key={label as string}>
            <dt className="text-[12px] text-on-surface-variant mb-1">{label}</dt>
            <dd className="text-[24px] font-semibold tracking-[-0.02em] text-on-surface">{val as number}</dd>
          </div>
        ))}
      </dl>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search task, client, or freelancer…"
          className="h-9 px-4 rounded-full bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-outline-variant w-full sm:w-80"
        />
        <button
          onClick={() => setReviewOnly(v => !v)}
          className={`h-9 px-4 rounded-full text-[13px] font-medium transition-colors ${
            reviewOnly
              ? "bg-error/10 text-error border border-error/30"
              : "border border-border-crisp text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {reviewOnly ? "✓ " : ""}Needs review ({flaggedCount})
        </button>
        <span className="text-[12.5px] text-on-surface-variant ml-auto">{rows.length} shown</span>
      </div>

      {/* Table */}
      <div className="divide-y divide-border-crisp border-t border-border-crisp">
        {rows.length === 0 && (
          <p className="py-10 text-center text-[13.5px] text-on-surface-variant">Nothing to show.</p>
        )}
        {rows.map(({ t, flags }) => (
          <div
            key={t.id}
            className={`py-4 grid md:grid-cols-[1.4fr_1fr_1.1fr_auto] gap-x-5 gap-y-2 ${
              flags.some(f => f.level === "danger") ? "bg-error/[0.03] -mx-3 px-3 rounded-lg" : ""
            }`}
          >
            {/* Task + client */}
            <div className="min-w-0">
              <Link href={`/t/${t.id}`} className="text-[14px] font-medium text-on-surface hover:text-electric-violet transition-colors truncate block">
                {t.title}
              </Link>
              <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">
                {t.category ?? "—"} · <span className="font-medium text-on-surface">{money(t.amount_cents)}</span>
                {t.project_id && t.milestone_index != null && <> · milestone {t.milestone_index + 1}/{t.milestone_total}</>}
              </p>
              <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">
                by {t.poster_name || t.poster_email || "—"}
              </p>
            </div>

            {/* Status */}
            <div className="text-[12.5px]">
              <span className="text-on-surface capitalize">{t.status}</span>
              {t.payment_status && t.payment_status !== "unpaid" && (
                <span className="text-on-surface-variant"> · {t.payment_status}</span>
              )}
              <p className="text-on-surface-variant mt-0.5">{when(t.created_at)}</p>
            </div>

            {/* Assigned freelancer + their qualification */}
            <div className="min-w-0 text-[12.5px]">
              {t.freelancer_email ? (
                <>
                  <p className="text-on-surface font-medium truncate">{t.freelancer_name || t.freelancer_email}</p>
                  <p className="mt-0.5 truncate">
                    {t.freelancer_vetting_score != null ? (
                      <span className={bandColor[t.freelancer_vetting_band ?? ""] ?? "text-on-surface-variant"}>
                        {t.freelancer_vetting_band} · {t.freelancer_vetting_score}
                        <span className="text-on-surface-variant"> in {t.freelancer_vetting_category}</span>
                      </span>
                    ) : (
                      <span className="text-error font-medium">not vetted in this category</span>
                    )}
                  </p>
                </>
              ) : (
                <span className="text-on-surface-variant">unmatched</span>
              )}
            </div>

            {/* Flags */}
            <div className="flex flex-col items-start md:items-end gap-1">
              {flags.map((f, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    f.level === "danger" ? "bg-error/10 text-error" : "bg-amber-500/10 text-amber-600"
                  }`}
                >
                  <span aria-hidden="true">⚠</span> {f.text}
                </span>
              ))}
              {CANCELLABLE.has(t.status) && t.payment_status !== "paid" && (
                <button
                  onClick={() => cancelTask(t.id, t.title)}
                  disabled={cancelling === t.id}
                  className="mt-0.5 text-[11.5px] font-medium text-on-surface-variant hover:text-error transition-colors disabled:opacity-50"
                >
                  {cancelling === t.id ? "Cancelling…" : "Cancel task"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-on-surface-variant mt-8">
        Read-only. Reassigning or releasing a match is coming (tracked in Linear HYR-5). For now, open a
        flagged task and act from the task page, or in Supabase directly.
      </p>
    </div>
  );
}
