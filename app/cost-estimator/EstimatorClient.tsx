"use client";
import { useState } from "react";
import Link from "next/link";

type Milestone = { title: string; detail: string; low: number; high: number };
type Estimate = {
  projectType: string;
  milestones: Milestone[];
  totalLow: number; totalHigh: number;
  weeksLow: number; weeksHigh: number;
  confidence: "low" | "medium" | "high";
  assumptions: string[];
};

const usd = (n: number) => `$${n.toLocaleString()}`;

export default function EstimatorClient() {
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [est, setEst] = useState<Estimate | null>(null);

  async function run() {
    if (description.trim().length < 8) { setError("Describe what you want to build in a sentence."); return; }
    setError(""); setBusy(true); setEst(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Could not estimate that."); return; }
      setEst(data);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border-crisp bg-surface-bright p-5 md:p-7">
      <label htmlFor="est-input" className="block font-mono text-[10.5px] uppercase tracking-[0.18em] text-on-surface-variant mb-2">
        Describe what you want built
      </label>
      <textarea
        id="est-input"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        placeholder="e.g. A Roblox tycoon game with a shop and leaderboards, or an MVP for a habit-tracking app"
        className="w-full border border-border-crisp rounded-xl px-4 py-3 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet resize-y"
      />
      {error && <p className="text-sm text-error mt-2">{error}</p>}
      <button
        onClick={run}
        disabled={busy}
        className="mt-3 inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
      >
        {busy ? (
          <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Estimating…</>
        ) : "Estimate the cost"}
      </button>

      {est && (
        <div className="mt-7 pt-6 border-t border-border-crisp">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-on-surface-variant mb-1.5">{est.projectType}</p>
              <p className="font-display text-[clamp(30px,5vw,44px)] leading-none tracking-[-0.02em] text-on-surface">
                {usd(est.totalLow)} <span className="text-on-surface-variant">to</span> {usd(est.totalHigh)}
              </p>
            </div>
            <div className="text-right text-[13px] text-on-surface-variant">
              <p>{est.weeksLow} to {est.weeksHigh} weeks</p>
              <p className="capitalize">{est.confidence} confidence</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {est.milestones.map((m, i) => (
              <div key={i} className="flex items-start justify-between gap-4 rounded-xl border border-border-crisp px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13.5px] font-medium text-on-surface">{i + 1}. {m.title}</p>
                  <p className="text-[12.5px] text-on-surface-variant leading-snug mt-0.5">{m.detail}</p>
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-on-surface tabular-nums">{usd(m.low)}–{usd(m.high)}</span>
              </div>
            ))}
          </div>

          {est.assumptions.length > 0 && (
            <div className="mt-5">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-on-surface-variant mb-2">What moves this price</p>
              <ul className="space-y-1">
                {est.assumptions.map((a, i) => (
                  <li key={i} className="flex items-baseline gap-2.5 text-[13px] text-on-surface-variant leading-snug">
                    <span className="text-on-surface-variant/60">{i + 1}</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-7 rounded-xl bg-surface-container p-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px] text-on-surface max-w-[420px] leading-snug">
              Want this actually built? Post it on Hyrde and the AI matches each milestone to one interview-vetted specialist. Free to hire during early access.
            </p>
            <Link href="/signup" className="shrink-0 inline-flex items-center h-10 px-5 rounded-full bg-electric-violet text-white text-sm font-medium hover:opacity-90 transition">
              Get it built on Hyrde
            </Link>
          </div>
          <p className="text-[11.5px] text-on-surface-variant mt-3">
            Estimate only, at mid-market freelance rates. Real quotes come from the matched specialist once your scope is set.
          </p>
        </div>
      )}
    </div>
  );
}
