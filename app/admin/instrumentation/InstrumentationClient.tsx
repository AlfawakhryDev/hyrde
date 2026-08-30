"use client";
import Link from "next/link";

// Shape returned by the instrumentation_metrics() RPC. Any ratio can be null
// (cold start = no settled projects yet); the UI says so rather than faking it.
export type Metrics = {
  generated_at: string;
  plumbing: {
    scope_documents: number;
    milestones: number;
    milestone_estimates: number;
    milestone_actuals: number;
    events: number;
    risk_flags: number;
  };
  settled_projects: number;
  scope_accuracy: number | null;
  cost_variance_median_overall: number | null;
  cost_variance_by_archetype: { archetype: string; n: number; variance_median: number | null }[];
  milestone_variance_by_type: { type: string; n: number; variance_median: number | null }[];
  risk_flag_precision: number | null;
  change_order_rate: number | null;
  interrogation_completion: number | null;
};

const pct = (v: number | null) => (v == null ? "—" : `${Math.round(v * 100)}%`);
// A variance ratio of actual/estimate-midpoint. 1.00 = dead on the midpoint.
const varianceLabel = (v: number | null) => {
  if (v == null) return "—";
  const delta = Math.round((v - 1) * 100);
  const sign = delta > 0 ? "+" : "";
  return `${v.toFixed(2)}× (${sign}${delta}%)`;
};

export type TaskRequest = {
  id: string;
  created_at: string;
  user_id: string | null;
  raw_text: string;
  kind: string;
  archetype: string | null;
  status: string;
};

export default function InstrumentationClient({
  metrics: m,
  requests = [],
  names = {},
}: {
  metrics: Metrics;
  requests?: TaskRequest[];
  names?: Record<string, string>;
}) {
  const hasData = m.settled_projects > 0;
  const fmtReqDate = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit" }).format(new Date(iso));

  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          <span aria-hidden="true">←</span> Admin
        </Link>
        <Link href="/admin/oversight" className="text-[13px] font-medium text-on-surface hover:text-electric-violet transition-colors">
          Oversight <span aria-hidden="true">→</span>
        </Link>
      </div>

      <h1 className="text-[40px] font-light tracking-[-0.035em] leading-none text-on-surface mt-8 mb-2">
        Instrumentation
      </h1>
      <p className="text-[14px] text-on-surface-variant mb-10 max-w-[560px]">
        Estimate versus actual, captured immutably on every project. Scope accuracy is the number that
        compounds as work closes. Nothing here is hand-entered.
      </p>

      {/* DEMAND SIGNAL: what clients tried to post, captured even if they churned */}
      <div className="rounded-3xl border border-border-crisp p-6 md:p-7 mb-10">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-electric-violet">Demand signals</div>
          <span className="text-[12px] text-on-surface-variant tabular-nums">{requests.length} recent</span>
        </div>
        <p className="text-[13px] text-on-surface-variant mb-5 max-w-[560px]">
          What clients started describing in the composer, captured the moment it hit the server, so
          the intent survives even when they see the plan and leave without posting. A churned request
          shows up here.
        </p>
        {requests.length === 0 ? (
          <p className="text-[13px] text-on-surface-variant">No requests captured yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border-crisp">
            {requests.map(r => (
              <div key={r.id} className="py-3 flex gap-3">
                <span className="shrink-0 text-[11px] text-on-surface-variant tabular-nums w-[52px]">{fmtReqDate(r.created_at)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 mb-0.5">
                    <span className="text-[10.5px] font-semibold uppercase tracking-wide text-on-surface-variant">{r.kind}</span>
                    {r.archetype && r.archetype !== "other" && <span className="text-[11px] text-on-surface-variant">· {r.archetype}</span>}
                    {r.user_id && names[r.user_id] && <span className="text-[11px] text-on-surface-variant">· {names[r.user_id]}</span>}
                  </div>
                  <p className="text-[13.5px] text-on-surface leading-snug line-clamp-2">{r.raw_text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRIMARY: scope accuracy */}
      <div className="rounded-3xl border border-border-crisp p-7 md:p-9 mb-6">
        <div className="text-[12px] font-semibold uppercase tracking-wide text-electric-violet mb-3">
          Scope accuracy
        </div>
        {hasData ? (
          <>
            <div className="text-[64px] leading-none font-light tracking-[-0.04em] text-on-surface">
              {pct(m.scope_accuracy)}
            </div>
            <p className="text-[13.5px] text-on-surface-variant mt-3">
              of {m.settled_projects} settled project{m.settled_projects === 1 ? "" : "s"} closed inside the
              original frozen estimate envelope.
            </p>
          </>
        ) : (
          <>
            <div className="text-[34px] leading-tight font-light tracking-[-0.02em] text-on-surface">
              No settled projects yet
            </div>
            <p className="text-[13.5px] text-on-surface-variant mt-3 max-w-[440px]">
              This lights up the moment the first project closes with all its milestones delivered.
              Capture is already running (see below), so the number will be real, not seeded.
            </p>
          </>
        )}
      </div>

      {/* Plumbing health: proves capture flows before anything closes */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-px bg-border-crisp border border-border-crisp rounded-2xl overflow-hidden mb-12">
        {([
          ["Scopes", m.plumbing.scope_documents],
          ["Milestones", m.plumbing.milestones],
          ["Estimates", m.plumbing.milestone_estimates],
          ["Actuals", m.plumbing.milestone_actuals],
          ["Events", m.plumbing.events],
          ["Risk flags", m.plumbing.risk_flags],
        ] as const).map(([label, n]) => (
          <div key={label} className="bg-surface-bright px-3 py-4 text-center">
            <div className="text-[22px] font-light text-on-surface tabular-nums">{n}</div>
            <div className="text-[11px] text-on-surface-variant mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Cost variance overall */}
      <div className="flex flex-wrap gap-4 mb-12">
        <Metric
          label="Cost variance (median)"
          value={varianceLabel(m.cost_variance_median_overall)}
          hint="Actual total vs estimate midpoint. Under 1.00× means we came in below the midpoint."
        />
        <Metric label="Risk-flag precision" value={pct(m.risk_flag_precision)} hint="Share of surfaced unknowns that actually materialized." />
        <Metric label="Change-order rate" value={m.change_order_rate == null ? "—" : m.change_order_rate.toFixed(2)} hint="Change orders per closed project." />
        <Metric label="Interrogation completion" value={pct(m.interrogation_completion)} hint="Sessions that reached a scope document. (Naive flow logs none yet.)" />
      </div>

      {/* Cost variance by archetype */}
      <Section title="Cost variance by archetype" empty={!hasData || m.cost_variance_by_archetype.length === 0}
        emptyLabel="Populates as projects close, sliced by project shape.">
        {m.cost_variance_by_archetype.map(r => (
          <Row key={r.archetype} left={r.archetype} n={r.n} value={varianceLabel(r.variance_median)} />
        ))}
      </Section>

      {/* Milestone variance by type: finds the milestone that always blows up */}
      <Section title="Milestone variance by type" empty={m.milestone_variance_by_type.length === 0}
        emptyLabel="Populates as milestones settle. Highest variance first, so the milestone that always overruns rises to the top.">
        {m.milestone_variance_by_type.map(r => (
          <Row key={r.type} left={r.type} n={r.n} value={varianceLabel(r.variance_median)} />
        ))}
      </Section>

      <p className="text-[11.5px] text-on-surface-variant mt-10">
        Generated {new Date(m.generated_at).toLocaleString()}. Estimates are immutable once frozen; these
        figures are computed live from captured actuals.
      </p>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex-1 min-w-[190px] rounded-2xl border border-border-crisp p-5">
      <div className="text-[12px] text-on-surface-variant mb-1.5">{label}</div>
      <div className="text-[26px] font-light tracking-[-0.02em] text-on-surface tabular-nums">{value}</div>
      <div className="text-[11.5px] text-on-surface-variant mt-2 leading-snug">{hint}</div>
    </div>
  );
}

function Section({ title, empty, emptyLabel, children }: {
  title: string; empty: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h2 className="text-[15px] font-medium text-on-surface mb-2">{title}</h2>
      <div className="divide-y divide-border-crisp border-y border-border-crisp">
        {empty ? <p className="py-6 text-[13.5px] text-on-surface-variant max-w-[520px]">{emptyLabel}</p> : children}
      </div>
    </div>
  );
}

function Row({ left, n, value }: { left: string; n: number; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-[13.5px] font-medium text-on-surface">{left}</span>
      <span className="flex items-center gap-4">
        <span className="text-[12px] text-on-surface-variant">n={n}</span>
        <span className="text-[13.5px] font-semibold text-on-surface tabular-nums w-[120px] text-right">{value}</span>
      </span>
    </div>
  );
}
