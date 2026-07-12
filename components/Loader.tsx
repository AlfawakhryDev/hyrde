import { HyrdeMark } from "@/components/Logo";

// ── o11-style loading language ────────────────────────────────────────────────
// Quiet and monochrome: the mark breathing above a hairline that sweeps.
// No spinners, no color noise — loading should feel like the brand pausing.

export function BrandLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-28" role="status" aria-label={label}>
      <span className="text-on-surface animate-[hyrde-breathe_1.6s_ease-in-out_infinite]">
        <HyrdeMark size={26} />
      </span>
      <span className="relative block h-px w-40 overflow-hidden bg-border-crisp">
        <span className="absolute inset-y-0 w-1/3 bg-on-surface/60 animate-[hyrde-sweep_1.1s_ease-in-out_infinite]" />
      </span>
      <span className="sr-only">{label}…</span>
    </div>
  );
}

// Hairline-row skeleton, shaped like the dashboard/task lists.
export function RowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border-crisp border-t border-border-crisp" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-5">
          <div className="h-4 w-2/3 max-w-[420px] rounded bg-surface-container animate-pulse mb-2.5" />
          <div className="h-3 w-1/3 max-w-[220px] rounded bg-surface-container animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// Tiny inline spinner for buttons (inherits currentColor).
export function InlineSpinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current/25 border-t-current animate-spin"
      aria-hidden="true"
    />
  );
}
