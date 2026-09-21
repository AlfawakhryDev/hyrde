import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { projectBands, priceRange, hireFaqs } from "./hire-brief";
import { SKILLS, ALL_SKILL_SLUGS } from "./data";
import { CATEGORY_RATE_USD, SENIORITY_MULTIPLIER } from "./pricing";

describe("hire-brief", () => {
  it("prices three typical jobs for every skill we publish a page for", () => {
    for (const slug of ALL_SKILL_SLUGS) {
      const bands = projectBands(slug);
      expect(bands, slug).toHaveLength(3);
      for (const b of bands) {
        expect(b.price.lowUsd, `${slug}: ${b.title}`).toBeLessThan(b.price.midUsd);
        expect(b.price.midUsd, `${slug}: ${b.title}`).toBeLessThan(b.price.highUsd);
        expect(b.price.hours).toBeGreaterThan(0);
        expect(b.what.length).toBeGreaterThan(30);
      }
    }
  });

  it("quotes what a client pays here, not the Western reference rate", () => {
    // SKILLS.avgRate is an SEO reference number ($84/hr for engineering). A
    // vetted specialist blends at $45, and the buyer should see that one.
    const slug = ALL_SKILL_SLUGS.find(s => SKILLS[s].category === "Engineering")!;
    const mid = projectBands(slug).find(b => b.price.seniority === "mid")!;
    expect(mid.price.rateUsd).toBe(CATEGORY_RATE_USD.Development * SENIORITY_MULTIPLIER.mid);
    expect(mid.price.rateUsd).toBeLessThan(SKILLS[slug].avgRate);
  });

  it("spans the cheapest and dearest job in the range it advertises", () => {
    const slug = ALL_SKILL_SLUGS[0];
    const bands = projectBands(slug);
    expect(priceRange(slug)).toEqual({
      lowUsd: Math.min(...bands.map(b => b.price.lowUsd)),
      highUsd: Math.max(...bands.map(b => b.price.highUsd)),
    });
  });

  it("answers the buyer's questions with real numbers", () => {
    const slug = ALL_SKILL_SLUGS.find(s => SKILLS[s].category === "Design")!;
    const faqs = hireFaqs(slug);
    const range = priceRange(slug)!;
    expect(faqs).toHaveLength(4);
    expect(faqs[0].a).toContain(`$${range.lowUsd.toLocaleString("en-US")}`);
    expect(faqs[0].a).toContain(`$${range.highUsd.toLocaleString("en-US")}`);
    for (const f of faqs) expect(f.q.toLowerCase()).toContain(SKILLS[slug].label.toLowerCase());
  });

  it("keeps the prices in llms.txt in step with the pricing formula", () => {
    // Answer engines quote public/llms.txt. If someone re-tunes the rates and
    // forgets that file, Claude and ChatGPT keep quoting last month's prices.
    const llms = readFileSync("public/llms.txt", "utf8");
    const dev = ALL_SKILL_SLUGS.find(s => SKILLS[s].category === "Engineering")!;
    const design = ALL_SKILL_SLUGS.find(s => SKILLS[s].category === "Design")!;
    for (const slug of [dev, design]) {
      for (const b of projectBands(slug)) {
        const line = `${b.price.lowUsd.toLocaleString("en-US")} to ${b.price.highUsd.toLocaleString("en-US")} USD`;
        expect(llms, `${b.title} should be listed as "${line}"`).toContain(line);
      }
    }
  });

  it("says nothing at all about a skill we do not have", () => {
    expect(projectBands("underwater-basket-weaver")).toEqual([]);
    expect(priceRange("underwater-basket-weaver")).toBeNull();
    expect(hireFaqs("underwater-basket-weaver")).toEqual([]);
  });
});
