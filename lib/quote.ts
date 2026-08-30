// ── Delivery pricing + Gate engine (from hyrde-cost-tracker.xlsx) ────────────
// The proprietary asset, in code. AI-autonomous fixed-price delivery is priced
// off your own cost distribution — specifically the WORST observed cost, never
// the average (on fixed price you personally absorb the tail). Money is integer
// minor units, explicit currency (§11).
//
// This is the autonomous model. It replaces the human-specialist tier pricing in
// lib/pricing.ts for delivery quoting; that file still backs the current /preise
// page until the public positioning is reworked.

import { type Money } from "./pricing";

// ── The Gate ─────────────────────────────────────────────────────────────────
// "Refusal is the business model." A job is only quotable if all three hold.
export type GateAnswers = {
  verifiable: boolean;      // objective acceptance test / test dataset exists
  attributable: boolean;    // you can prove the delivered result meets it
  agreedUpfront: boolean;   // acceptance criteria fixed before work starts
};

export function gate(a: GateAnswers): "ACCEPT" | "REFUSE" {
  return a.verifiable && a.attributable && a.agreedUpfront ? "ACCEPT" : "REFUSE";
}

/** Which gate tests failed (for the Gate Log / UI). */
export function gateFailures(a: GateAnswers): string[] {
  const f: string[] = [];
  if (!a.verifiable) f.push("1 — not verifiable (no objective acceptance test)");
  if (!a.attributable) f.push("2 — not attributable (can't prove the result meets it)");
  if (!a.agreedUpfront) f.push("3 — not agreed up front (acceptance not fixed before start)");
  return f;
}

// ── Pricing levers (the yellow cells — set deliberately, they are risk appetite) ─
export const DEFAULT_MARGIN_MULTIPLE = 4;   // 4× on worst cost is the starting point
export const DEFAULT_FAILURE_LOADING = 1;   // >1 covers jobs you deliver but never get paid for
export const RISK = { maxFailureRate: 0.15, maxHumanMinutes: 15 };
export const CONTRACT_CAP_UNPROVEN: Money = { amount: 500_000, currency: "EUR" }; // €5,000 under 10 jobs

/** Novelty buffer by jobs delivered of this type: 1.5 (<3), 1.2 (<10), 1.0 (proven). */
export function noveltyBuffer(jobsDelivered: number): number {
  if (jobsDelivered < 3) return 1.5;
  if (jobsDelivered < 10) return 1.2;
  return 1.0;
}

export type QuoteLevers = {
  marginMultiple: number;
  failureLoading: number;
  noveltyBuffer: number;
};

/**
 * Floor price = worst observed cost × margin multiple × failure loading × novelty
 * buffer. Never quote below this. (Quote Calculator: 77.40 × 4 × 1 × 1.5 = 464.40.)
 */
export function floorPrice(worstCost: Money, levers: QuoteLevers): Money {
  const mult = levers.marginMultiple * levers.failureLoading * levers.noveltyBuffer;
  return { amount: Math.round(worstCost.amount * mult), currency: worstCost.currency };
}

export type QuoteInput = {
  jobsDelivered: number;
  worstCost: Money;
  marginMultiple?: number;
  failureLoading?: number;
};

export type Quote = {
  floor: Money;
  levers: QuoteLevers;
  /** Under 10 jobs of a type, cap exposure; null once proven. */
  cap: Money | null;
  proven: boolean;
};

export function quote(input: QuoteInput): Quote {
  const levers: QuoteLevers = {
    marginMultiple: input.marginMultiple ?? DEFAULT_MARGIN_MULTIPLE,
    failureLoading: input.failureLoading ?? DEFAULT_FAILURE_LOADING,
    noveltyBuffer: noveltyBuffer(input.jobsDelivered),
  };
  const proven = input.jobsDelivered >= 10;
  return {
    floor: floorPrice(input.worstCost, levers),
    levers,
    cap: proven ? null : CONTRACT_CAP_UNPROVEN,
    proven,
  };
}

// ── Job Type Economics verdict ───────────────────────────────────────────────
// A job type earns "OFFER" only while it stays autonomous and reliable. It flips
// to "REFUSE" when it fails too often or starts needing human minutes.
export type EconInput = { failureRate: number; avgHumanMinutes: number };

export function verdict(e: EconInput): "OFFER" | "REFUSE" {
  if (e.failureRate > RISK.maxFailureRate) return "REFUSE";
  if (e.avgHumanMinutes > RISK.maxHumanMinutes) return "REFUSE";
  return "OFFER";
}
