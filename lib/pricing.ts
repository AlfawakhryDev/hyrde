// ── What a milestone should cost ─────────────────────────────────────
// Quotes used to be a number the language model invented. Asking an LLM for a
// price gives you a different answer every run with no anchor: the same RZM
// rebuild came back at $4,000 once and $9,100 the next time. That is not a
// prompt problem, it is the wrong question.
//
// So we stop asking for money and ask for EFFORT, which models estimate far
// more consistently, then compute the price here from a rate table. Same
// input, same quote, every time, and every number can be explained to a client
// who asks "why".
//
// CALIBRATION: there is no payout history to fit these to yet. As of
// 2026-09-05 the platform has 28 tasks carrying an amount and ZERO ever paid,
// and those amounts came from the very LLM guessing this file replaces, so
// they are not evidence. These rates are a deliberate starting point for
// Hyrde's actual vetted supply, which is remote and MENA-weighted rather than
// US-based. Revisit them against real payouts once money has actually moved.
//
// Note these are NOT the rates on /rates and /hire/[skill]. Those come from
// SKILLS.avgRate and are Western market *reference* rates for an SEO audience
// (Engineering averages $84/hr there). What a client pays a vetted Hyrde
// freelancer is a different, lower number, and conflating the two is how you
// quote $9,100 for a $4,500 job.

export type Seniority = "junior" | "mid" | "senior";

/** Blended hourly rate for a vetted Hyrde freelancer, by task category. */
export const CATEGORY_RATE_USD: Record<string, number> = {
  Development:         45,
  Data:                50,
  Design:              40,
  Marketing:           32,
  Copywriting:         30,
  "Technical writing": 40,
  Other:               38,
};
const FALLBACK_RATE = 38;

/** Matches the junior/mid/senior split already shown on /hire rate cards. */
export const SENIORITY_MULTIPLIER: Record<Seniority, number> = {
  junior: 0.6,
  mid:    1.0,
  senior: 1.5,
};

/** Quotes are a range, not false precision. */
const SPREAD = 0.2;

const MIN_HOURS = 1;
const MAX_HOURS = 400;   // ~10 weeks of one person; beyond this the milestone is wrong

export interface MilestonePrice {
  hours: number;
  rateUsd: number;
  seniority: Seniority;
  midUsd: number;
  lowUsd: number;
  highUsd: number;
  /** One line a client can read: why this number. */
  basis: string;
}

const round50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);

export function rateFor(category: string): number {
  return CATEGORY_RATE_USD[category] ?? FALLBACK_RATE;
}

export function priceMilestone(
  category: string,
  rawHours: number,
  rawSeniority: string,
): MilestonePrice {
  const hours = Math.min(MAX_HOURS, Math.max(MIN_HOURS, Math.round(rawHours) || MIN_HOURS));
  const seniority: Seniority =
    rawSeniority === "junior" || rawSeniority === "senior" ? rawSeniority : "mid";

  const rateUsd = Math.round(rateFor(category) * SENIORITY_MULTIPLIER[seniority]);
  const mid = hours * rateUsd;

  return {
    hours,
    rateUsd,
    seniority,
    midUsd:  round50(mid),
    lowUsd:  round50(mid * (1 - SPREAD)),
    highUsd: round50(mid * (1 + SPREAD)),
    basis: `About ${hours} hours of ${category.toLowerCase()} work at $${rateUsd}/hr for a ${seniority}-level specialist.`,
  };
}
