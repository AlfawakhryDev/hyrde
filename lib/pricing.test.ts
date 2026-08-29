import { describe, expect, it } from "vitest";
import {
  ENGAGEMENT_TIERS,
  eur,
  formatMoney,
  type Money,
} from "./pricing";

// CLAUDE.md §11: every financial calculation gets a unit test. Currency
// formatting counts — German format differs from the en-US default in both
// separators and symbol position, and getting it wrong reads as amateur to
// the exact buyer we are selling to.

describe("eur()", () => {
  it("stores minor units as an integer, never a float", () => {
    expect(eur(18_000).amount).toBe(1_800_000);
    expect(Number.isInteger(eur(24_000).amount)).toBe(true);
  });

  it("does not lose a cent to binary floating point", () => {
    // 0.1 + 0.2 === 0.30000000000000004 is the classic failure this guards.
    expect(eur(0.1 + 0.2).amount).toBe(30);
    expect(eur(1234.56).amount).toBe(123_456);
  });

  it("always carries an explicit currency", () => {
    expect(eur(1).currency).toBe("EUR");
  });
});

describe("formatMoney()", () => {
  it("uses German separators and a trailing symbol", () => {
    // German: dot as thousands separator, symbol after the number.
    const out = formatMoney(eur(18_000));
    expect(out).toContain("18.000");
    expect(out).toContain("€");
    expect(out.indexOf("€")).toBeGreaterThan(out.indexOf("18.000"));
  });

  it("omits decimals for whole amounts", () => {
    expect(formatMoney(eur(45_000))).not.toContain(",00");
  });

  it("shows two decimals only when there are cents", () => {
    expect(formatMoney(eur(1234.56))).toContain(",56");
  });

  it("formats zero without throwing", () => {
    expect(formatMoney(eur(0))).toContain("0");
  });

  it("is driven by the passed locale, not the host default", () => {
    // Guards against a server in a non-DE locale silently rendering US format.
    const de = formatMoney(eur(18_000), "de-DE");
    const en = formatMoney(eur(18_000), "en-US");
    expect(de).not.toBe(en);
    expect(de).toContain("18.000");
    expect(en).toContain("18,000");
  });
});

describe("ENGAGEMENT_TIERS", () => {
  it("never exposes an hourly or day rate to a client (§1, §4)", () => {
    // An hourly price is the evidence of a Dienstvertrag. It must not appear
    // anywhere in client-facing pricing copy, in any casing.
    const banned = /stundensatz|tagessatz|pro stunde|per hour|\/\s*(h|std)\b/i;
    for (const tier of ENGAGEMENT_TIERS) {
      const copy = [
        tier.nameDe,
        tier.summaryDe,
        tier.durationDe,
        tier.fitDe,
        ...tier.includesDe,
      ].join(" ");
      expect(copy, `tier ${tier.id} leaks a time-based rate`).not.toMatch(banned);
    }
  });

  it("avoids the §7 banned vocabulary in client-facing copy", () => {
    const banned =
      /freelancer|freiberufler|mitarbeiter|personal\b|arbeitskraft|verstärkung|zeitarbeit|personalvermittlung|arbeitnehmerüberlassung|marktplatz|günstig|billig|outsourcing/i;
    for (const tier of ENGAGEMENT_TIERS) {
      const copy = [
        tier.nameDe,
        tier.summaryDe,
        tier.fitDe,
        ...tier.includesDe,
      ].join(" ");
      expect(copy, `tier ${tier.id} uses banned vocabulary`).not.toMatch(banned);
    }
  });

  it("has no exclamation marks (§7 tone)", () => {
    for (const tier of ENGAGEMENT_TIERS) {
      expect([tier.summaryDe, tier.fitDe].join(" ")).not.toContain("!");
    }
  });

  it("is ordered and uniquely identified", () => {
    expect(ENGAGEMENT_TIERS.map((t) => t.index)).toEqual([1, 2, 3]);
    const ids = new Set(ENGAGEMENT_TIERS.map((t) => t.id));
    expect(ids.size).toBe(ENGAGEMENT_TIERS.length);
  });

  it("prices every tier as a positive integer amount in EUR", () => {
    for (const tier of ENGAGEMENT_TIERS) {
      const m: Money = tier.from;
      expect(Number.isInteger(m.amount)).toBe(true);
      expect(m.amount).toBeGreaterThan(0);
      expect(m.currency).toBe("EUR");
    }
  });

  it("keeps the phase-1 ICP deal size in view (§2: €15k–60k entry)", () => {
    const pilot = ENGAGEMENT_TIERS.find((t) => t.id === "pilot");
    expect(pilot?.from.amount).toBeGreaterThanOrEqual(15_000_00);
    expect(pilot?.from.amount).toBeLessThanOrEqual(60_000_00);
  });
});
