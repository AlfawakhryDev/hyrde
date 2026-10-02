import { describe, it, expect } from "vitest";
import { GULF_SLUGS, GULF_CITIES, getGulfCity, gulfTrades, inLocal } from "./gulf";
import { CITIES } from "./data";
import { costPage } from "./cost-to-hire";

describe("gulf", () => {
  it("covers the six Gulf cities the Arabic pages cover", () => {
    expect(GULF_SLUGS.sort()).toEqual(["abu-dhabi", "doha", "dubai", "jeddah", "kuwait-city", "riyadh"]);
    for (const slug of GULF_SLUGS) expect(CITIES[slug], slug).toBeDefined();
  });

  it("only lists trades that have a priced page to link to", () => {
    for (const slug of GULF_SLUGS) {
      const trades = gulfTrades(GULF_CITIES[slug]);
      expect(trades.length, slug).toBeGreaterThanOrEqual(5);
      for (const t of trades) expect(costPage(t.slug), `${slug}/${t.slug}`).not.toBeNull();
    }
  });

  it("gives each city its own market description", () => {
    const notes = GULF_SLUGS.map(s => GULF_CITIES[s].note);
    expect(new Set(notes).size).toBe(notes.length);
    for (const n of notes) expect(n.length).toBeGreaterThan(120);
  });

  it("converts to local money the way a person would say it", () => {
    const dubai = GULF_CITIES.dubai;        // 3.67 AED to the dollar
    expect(inLocal(350, dubai)).toBe("AED 1,300");     // 1284.5 → nearest 100
    expect(inLocal(13050, dubai)).toBe("AED 48,000");  // 47893.5 → nearest 500
    const kuwait = GULF_CITIES["kuwait-city"];  // 0.31 KWD to the dollar
    expect(inLocal(350, kuwait)).toBe("KWD 110");
  });

  it("does not answer for a city outside the Gulf set", () => {
    expect(getGulfCity("berlin")).toBeUndefined();
    expect(getGulfCity("atlantis")).toBeUndefined();
  });
});
