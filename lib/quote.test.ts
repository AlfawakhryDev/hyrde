import { describe, expect, it } from "vitest";
import { eur, formatMoney } from "./pricing";
import {
  gate, gateFailures, noveltyBuffer, floorPrice, quote, verdict,
  DEFAULT_MARGIN_MULTIPLE, CONTRACT_CAP_UNPROVEN,
} from "./quote";

describe("floorPrice() — reproduces the cost tracker", () => {
  it("77.40 worst × 4 margin × 1 failure × 1.5 novelty = 464.40", () => {
    const f = floorPrice(eur(77.4), { marginMultiple: 4, failureLoading: 1, noveltyBuffer: 1.5 });
    expect(f.amount).toBe(46_440);
    expect(formatMoney(f)).toContain("464,40");
  });
  it("stays integer minor units", () => {
    const f = floorPrice(eur(77.4), { marginMultiple: 4, failureLoading: 1.3, noveltyBuffer: 1.2 });
    expect(Number.isInteger(f.amount)).toBe(true);
  });
  it("prices off worst cost, so a higher tail lifts the floor", () => {
    const lo = floorPrice(eur(50), { marginMultiple: 4, failureLoading: 1, noveltyBuffer: 1 });
    const hi = floorPrice(eur(200), { marginMultiple: 4, failureLoading: 1, noveltyBuffer: 1 });
    expect(hi.amount).toBeGreaterThan(lo.amount);
  });
});

describe("noveltyBuffer()", () => {
  it("is 1.5 under 3 jobs, 1.2 under 10, 1.0 once proven", () => {
    expect(noveltyBuffer(0)).toBe(1.5);
    expect(noveltyBuffer(2)).toBe(1.5);
    expect(noveltyBuffer(3)).toBe(1.2);
    expect(noveltyBuffer(9)).toBe(1.2);
    expect(noveltyBuffer(10)).toBe(1.0);
  });
});

describe("gate() — refusal is the business model", () => {
  it("accepts only when all three tests pass", () => {
    expect(gate({ verifiable: true, attributable: true, agreedUpfront: true })).toBe("ACCEPT");
  });
  it("refuses if any test fails", () => {
    expect(gate({ verifiable: false, attributable: true, agreedUpfront: true })).toBe("REFUSE");
    expect(gate({ verifiable: true, attributable: false, agreedUpfront: true })).toBe("REFUSE");
    expect(gate({ verifiable: true, attributable: true, agreedUpfront: false })).toBe("REFUSE");
  });
  it("names the failed tests", () => {
    expect(gateFailures({ verifiable: false, attributable: true, agreedUpfront: true })).toHaveLength(1);
    expect(gateFailures({ verifiable: false, attributable: false, agreedUpfront: false })).toHaveLength(3);
  });
});

describe("quote()", () => {
  it("caps exposure at €5,000 until 10 jobs of a type, then removes the cap", () => {
    expect(quote({ jobsDelivered: 1, worstCost: eur(77.4) }).cap).toEqual(CONTRACT_CAP_UNPROVEN);
    expect(quote({ jobsDelivered: 12, worstCost: eur(77.4) }).proven).toBe(true);
    expect(quote({ jobsDelivered: 12, worstCost: eur(77.4) }).cap).toBeNull();
  });
  it("defaults the margin multiple to 4", () => {
    expect(quote({ jobsDelivered: 1, worstCost: eur(77.4) }).levers.marginMultiple).toBe(DEFAULT_MARGIN_MULTIPLE);
  });
});

describe("verdict() — a type stays OFFER only while autonomous + reliable", () => {
  it("offers a clean, hands-off type", () => {
    expect(verdict({ failureRate: 0.05, avgHumanMinutes: 0 })).toBe("OFFER");
  });
  it("refuses when it fails too often", () => {
    expect(verdict({ failureRate: 0.2, avgHumanMinutes: 0 })).toBe("REFUSE");
  });
  it("refuses when it starts needing human minutes", () => {
    expect(verdict({ failureRate: 0.0, avgHumanMinutes: 30 })).toBe("REFUSE");
  });
});
