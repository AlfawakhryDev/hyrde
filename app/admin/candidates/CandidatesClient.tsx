"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import InterviewsPanel from "./InterviewsPanel";

export type CandidateRow = {
  user_id: string; display_name: string | null; email: string; country: string | null;
  best_score: number | null; best_band: string | null; attempts: number; passed: number;
  has_cv: boolean; has_report: boolean; report_at: string | null; joined: string;
};

type Report = {
  headline?: string; recommendation?: string; confidence?: string; confidenceWhy?: string;
  verifiedSkills?: { skill: string; evidence: string }[];
  claimedNotVerified?: string[]; deliveryRecord?: string;
  strengths?: string[]; risks?: string[]; bestFitFor?: string[]; notFitFor?: string[];
  suggestedRateUsd?: { low: number; high: number; basis: string }; nextStep?: string;
};

const VERDICT: Record<string, { label: string; cls: string }> = {
  strong_yes: { label: "Strong yes", cls: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" },
  yes: { label: "Yes", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  borderline: { label: "Borderline", cls: "bg-amber-500/12 text-amber-700 dark:text-amber-400" },
  no: { label: "No", cls: "bg-error/10 text-error" },
  insufficient_evidence: { label: "Not enough evidence", cls: "bg-surface-container text-on-surface-variant" },
};

export default function CandidatesClient({ rows }: { rows: CandidateRow[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [reports, setReports] = useState<Record<string, Report>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Whose interviews are expanded. Independent of the report panel: you often
  // want to read the raw answers precisely because you distrust the summary.
  const [iv, setIv] = useState<string | null>(null);

  async function load(userId: string) {
    const supa = supabaseBrowser();
    const { data } = await supa.from("candidate_reports").select("report").eq("user_id", userId).maybeSingle();
    if (data?.report) setReports(r => ({ ...r, [userId]: data.report as Report }));
  }

  async function generate(userId: string) {
    setBusy(userId);
    setErrors(e => ({ ...e, [userId]: "" }));
    try {
      const res = await fetch("/api/candidates/report", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors(e => ({ ...e, [userId]: data.error ?? "Could not generate." })); return; }
      setReports(r => ({ ...r, [userId]: data.report as Report }));
      setOpen(userId);
    } catch {
      setErrors(e => ({ ...e, [userId]: "Could not reach the server." }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1080px] px-5 md:px-8 py-12">
      <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.035em] leading-none text-on-surface">
        Candidates
      </h1>
      <p className="text-[14px] text-on-surface-variant mt-3 max-w-[560px]">
        Everyone who signed up to work. The report reads every interview attempt — passed
        and failed — plus their CV and what they have actually delivered here.
      </p>

      {rows.length === 0 && (
        <p className="text-[14px] text-on-surface-variant mt-10">No freelancer accounts yet.</p>
      )}

      <div className="border-y border-border-crisp divide-y divide-border-crisp mt-10">
        {rows.map(c => {
          const rep = reports[c.user_id];
          const verdict = rep?.recommendation ? VERDICT[rep.recommendation] : null;
          const isOpen = open === c.user_id;
          return (
            <div key={c.user_id} className="py-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex-1 min-w-[220px]">
                  <p className="text-[15px] font-medium text-on-surface">
                    {c.display_name || c.email.split("@")[0]}
                  </p>
                  <p className="text-[12.5px] text-on-surface-variant mt-0.5 flex flex-wrap items-center gap-x-2">
                    <span>{c.email}</span>
                    {c.country && <><span aria-hidden="true">·</span><span>{c.country}</span></>}
                    <span aria-hidden="true">·</span>
                    <span>{c.attempts} attempt{c.attempts === 1 ? "" : "s"}, {c.passed} passed</span>
                    {c.has_cv && <><span aria-hidden="true">·</span><span className="text-emerald-600">CV</span></>}
                  </p>
                </div>

                {c.best_score != null && (
                  <span className="text-[13px] text-on-surface-variant shrink-0">
                    best {c.best_score}{c.best_band ? ` · ${c.best_band}` : ""}
                  </span>
                )}

                {verdict && (
                  <span className={`text-[12px] font-medium px-2.5 py-1 rounded-full shrink-0 ${verdict.cls}`}>
                    {verdict.label}
                  </span>
                )}

                <div className="flex items-center gap-2 shrink-0">
                  {c.attempts > 0 && (
                    <button
                      onClick={() => setIv(iv === c.user_id ? null : c.user_id)}
                      aria-expanded={iv === c.user_id}
                      className="h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {iv === c.user_id ? "Hide interviews" : `Interviews (${c.attempts})`}
                    </button>
                  )}
                  {(c.has_report || rep) && (
                    <button
                      onClick={() => { if (!rep) void load(c.user_id); setOpen(isOpen ? null : c.user_id); }}
                      className="h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {isOpen ? "Hide" : "Report"}
                    </button>
                  )}
                  <button
                    onClick={() => generate(c.user_id)}
                    disabled={busy === c.user_id}
                    className="h-8 px-3.5 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90 disabled:opacity-50"
                  >
                    {busy === c.user_id ? "Reading…" : c.has_report ? "Regenerate" : "Generate"}
                  </button>
                </div>
              </div>

              {errors[c.user_id] && (
                <p className="text-[12.5px] text-error mt-2">{errors[c.user_id]}</p>
              )}

              {iv === c.user_id && <InterviewsPanel userId={c.user_id} />}
              {isOpen && rep && <ReportBody r={rep} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map(x => (
          <li key={x} className="text-[13px] text-on-surface leading-relaxed flex gap-2">
            <span className="text-on-surface-variant shrink-0" aria-hidden="true">·</span>{x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportBody({ r }: { r: Report }) {
  return (
    <div className="mt-4 rounded-xl border border-border-crisp bg-surface-container-low p-5 space-y-5">
      {r.headline && <p className="text-[15px] text-on-surface leading-relaxed">{r.headline}</p>}

      {r.confidence && (
        <p className="text-[12.5px] text-on-surface-variant">
          Confidence: <span className="text-on-surface">{r.confidence}</span>
          {r.confidenceWhy ? ` — ${r.confidenceWhy}` : ""}
        </p>
      )}

      {!!r.verifiedSkills?.length && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">
            Verified in interview
          </p>
          <ul className="space-y-1.5">
            {r.verifiedSkills.map(v => (
              <li key={v.skill} className="text-[13px] leading-relaxed">
                <span className="text-on-surface font-medium">{v.skill}</span>
                <span className="text-on-surface-variant"> — {v.evidence}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* The distinction the report exists for: a CV asserts, an interview tests. */}
      <List title="Claimed, not verified" items={r.claimedNotVerified} />

      {r.deliveryRecord && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">Delivered here</p>
          <p className="text-[13px] text-on-surface leading-relaxed">{r.deliveryRecord}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-5">
        <List title="Strengths" items={r.strengths} />
        <List title="Risks" items={r.risks} />
        <List title="Send them" items={r.bestFitFor} />
        <List title="Keep them off" items={r.notFitFor} />
      </div>

      {r.suggestedRateUsd && (
        <p className="text-[13px] text-on-surface">
          Suggested rate: <span className="font-medium">${r.suggestedRateUsd.low}–${r.suggestedRateUsd.high}/hr</span>
          <span className="text-on-surface-variant"> — {r.suggestedRateUsd.basis}</span>
        </p>
      )}

      {r.nextStep && (
        <p className="text-[13px] text-on-surface border-t border-border-crisp pt-4">
          <span className="text-on-surface-variant">Next: </span>{r.nextStep}
        </p>
      )}
    </div>
  );
}
