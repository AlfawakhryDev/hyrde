import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { COST_SLUGS, costPage, allCostPages } from "./cost-to-hire";
import { SKILLS } from "./data";

describe("cost-to-hire", () => {
  it("only publishes pages for trades we actually sell", () => {
    for (const slug of COST_SLUGS) expect(SKILLS[slug], slug).toBeDefined();
  });

  it("gives every trade its own jobs, not one template repeated", () => {
    // Sixteen pages describing the same three jobs is the thin content that put
    // the old hire pages at position 60.
    const titles = COST_SLUGS.flatMap(s => costPage(s)!.bands.map(b => b.title));
    const duplicated = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(new Set(duplicated), `repeated job titles: ${[...new Set(duplicated)].join("; ")}`).toEqual(new Set());
  });

  it("prices every job, cheapest job inside the advertised range", () => {
    for (const slug of COST_SLUGS) {
      const p = costPage(slug)!;
      expect(p.bands).toHaveLength(3);
      for (const b of p.bands) {
        expect(b.price.lowUsd).toBeLessThan(b.price.highUsd);
        expect(b.what.length).toBeGreaterThan(40);
      }
      expect(p.lowUsd).toBe(Math.min(...p.bands.map(b => b.price.lowUsd)));
      expect(p.highUsd).toBe(Math.max(...p.bands.map(b => b.price.highUsd)));
      expect(p.hourly.junior).toBeLessThan(p.hourly.mid);
      expect(p.hourly.mid).toBeLessThan(p.hourly.senior);
      expect(p.drivers.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("answers the cost question with the numbers, not with 'it depends'", () => {
    const p = costPage("wordpress-developer")!;
    const [cost] = p.faqs;
    expect(cost.q).toContain("cost");
    expect(cost.a).toContain(`$${p.lowUsd.toLocaleString("en-US")}`);
    expect(cost.a).toContain(`$${p.highUsd.toLocaleString("en-US")}`);
    expect(p.faqs).toHaveLength(4);
  });

  it("lists the hub cheapest first", () => {
    const lows = allCostPages().map(p => p.lowUsd);
    expect(lows).toEqual([...lows].sort((a, b) => a - b));
  });

  it("keeps the trade table in llms.txt in step with the code", () => {
    // Answer engines read public/llms.txt. A rate change must not leave them
    // quoting last month's prices.
    const llms = readFileSync("public/llms.txt", "utf8");
    for (const p of allCostPages()) {
      const line = `${p.label}: ${p.lowUsd.toLocaleString("en-US")} to ${p.highUsd.toLocaleString("en-US")} USD`;
      expect(llms, `llms.txt should list "${line}"`).toContain(line);
    }
  });

  it("has nothing to say about a trade with no page", () => {
    expect(costPage("bookkeeper")).toBeNull();
  });
});
