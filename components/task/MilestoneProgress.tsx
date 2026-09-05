"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Progress the client can watch without asking ─────────────────────
// The specialist posts where they are; the client sees it on the milestone and
// on their dashboard. This exists so "where is my website" is answered by
// looking, not by emailing someone.
//
// Deliberately not a chat. One number, one line, append-only. RLS lets only
// the matched specialist insert, and only the two people on the task read.

export type ProgressEntry = {
  id: string; percent: number; note: string | null; created_at: string;
};

const STEPS = [
  { pct: 10,  label: "Started" },
  { pct: 25,  label: "Underway" },
  { pct: 50,  label: "Halfway" },
  { pct: 75,  label: "Nearly done" },
  { pct: 90,  label: "In review" },
];

export function ProgressBar({ percent, className = "" }: { percent: number; className?: string }) {
  return (
    <div className={`h-1.5 rounded-full bg-surface-container overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full bg-on-surface transition-[width] duration-500"
        style={{ width: `${Math.max(2, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

export default function MilestoneProgress({
  taskId, userId, initial, canReport,
}: {
  taskId: string;
  userId: string;
  initial: ProgressEntry[];
  /** Only the matched specialist reports. The client reads. */
  canReport: boolean;
}) {
  const [entries, setEntries] = useState<ProgressEntry[]>(initial);
  const [note, setNote] = useState("");
  const [pct, setPct] = useState<number>(initial[0]?.percent ?? 10);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const latest = entries[0];

  async function post() {
    setBusy(true); setError("");
    const { data, error: e } = await supabaseBrowser()
      .from("milestone_progress")
      .insert({ task_id: taskId, author_id: userId, percent: pct, note: note.trim() || null })
      .select("id, percent, note, created_at")
      .single();
    setBusy(false);
    if (e || !data) { setError("Could not post that update."); return; }
    setEntries(prev => [data as ProgressEntry, ...prev]);
    setNote("");
  }

  const when = (iso: string) =>
    new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      .format(new Date(iso));

  return (
    <div>
      {latest ? (
        <>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-[15px] font-semibold text-on-surface tabular-nums">{latest.percent}%</span>
            <span className="text-[12px] text-on-surface-variant">Updated {when(latest.created_at)}</span>
          </div>
          <ProgressBar percent={latest.percent} className="mb-3" />
          {latest.note && (
            <p className="text-[13.5px] text-on-surface leading-relaxed mb-3">{latest.note}</p>
          )}
        </>
      ) : (
        <p className="text-[13px] text-on-surface-variant mb-3">
          {canReport
            ? "Post your first update so the client can see where things stand."
            : "No update yet. The specialist posts progress as they work."}
        </p>
      )}

      {entries.length > 1 && (
        <details className="mb-3">
          <summary className="text-[12.5px] text-on-surface-variant cursor-pointer">
            Earlier updates ({entries.length - 1})
          </summary>
          <div className="flex flex-col gap-2 mt-2 pl-3 border-l border-border-crisp">
            {entries.slice(1).map(e => (
              <div key={e.id}>
                <span className="text-[12px] text-on-surface-variant tabular-nums">{e.percent}% · {when(e.created_at)}</span>
                {e.note && <p className="text-[13px] text-on-surface leading-snug">{e.note}</p>}
              </div>
            ))}
          </div>
        </details>
      )}

      {canReport && (
        <div className="border-t border-border-crisp pt-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {STEPS.map(s => (
              <button
                key={s.pct}
                type="button"
                onClick={() => setPct(s.pct)}
                className={`h-7 px-3 rounded-full text-[12px] font-medium transition-colors ${
                  pct === s.pct
                    ? "bg-on-surface text-inverse-on-surface"
                    : "border border-border-crisp text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            maxLength={300}
            placeholder="One line on what's done and what's next. Optional."
            className="w-full border border-border-crisp rounded-lg px-3 py-2 text-[13px] text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface resize-y"
          />
          <button
            onClick={post}
            disabled={busy}
            className="mt-2 h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Posting…" : "Post update"}
          </button>
          {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
