import { describe, it, expect } from "vitest";
import { priceMilestone, rateFor, CATEGORY_RATE_USD } from "./pricing";

// Pricing is deliberately a formula, not a model call: a price a client
// disputes has to be explainable. These pin the formula.
describe("priceMilestone", () => {
  it("quotes a ±20% range around hours × rate, rounded to $50", () => {
    expect(priceMilestone("Development", 10, "mid")).toMatchObject({
      hours: 10, rateUsd: 45, seniority: "mid", midUsd: 450, lowUsd: 350, highUsd: 550,
    });
  });

  it("applies the seniority multipliers shown on the rate cards", () => {
    expect(priceMilestone("Development", 10, "junior").rateUsd).toBe(27); // 45 × 0.6
    expect(priceMilestone("Development", 10, "senior").rateUsd).toBe(68); // 45 × 1.5, rounded
  });

  it("treats an unknown seniority as mid rather than failing", () => {
    expect(priceMilestone("Development", 10, "wizard").seniority).toBe("mid");
  });

  it("clamps hours: nonsense becomes 1, runaway becomes 400", () => {
    expect(priceMilestone("Design", 0, "mid").hours).toBe(1);
    expect(priceMilestone("Design", Number.NaN, "mid").hours).toBe(1);
    expect(priceMilestone("Design", -5, "mid").hours).toBe(1);
    expect(priceMilestone("Design", 10_000, "mid").hours).toBe(400);
  });

  it("never quotes below $50", () => {
    const p = priceMilestone("Copywriting", 1, "junior");
    expect(Math.min(p.lowUsd, p.midUsd, p.highUsd)).toBeGreaterThanOrEqual(50);
  });

  it("keeps every range ordered low ≤ mid ≤ high", () => {
    for (const category of Object.keys(CATEGORY_RATE_USD)) {
      for (const seniority of ["junior", "mid", "senior"]) {
        for (const hours of [1, 7, 40, 400]) {
          const p = priceMilestone(category, hours, seniority);
          expect(p.lowUsd).toBeLessThanOrEqual(p.midUsd);
          expect(p.midUsd).toBeLessThanOrEqual(p.highUsd);
        }
      }
    }
  });

  it("explains the number in one sentence", () => {
    expect(priceMilestone("Development", 10, "mid").basis).toBe(
      "About 10 hours of development work at $45/hr for a mid-level specialist.",
    );
  });
});

describe("rateFor", () => {
  it("falls back to $38 for a category it has never heard of", () => {
    expect(rateFor("Basket weaving")).toBe(38);
  });
});
