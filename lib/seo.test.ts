import { describe, expect, it } from "vitest";
import { FAQS_DE, faqLd, breadcrumbLd, organizationLd, serviceLd, SITE } from "./seo";

const BANNED = /freelancer|freiberufler|mitarbeiter|arbeitskraft|verstärkung|zeitarbeit|arbeitnehmerüberlassung|marktplatz|günstig|billig|outsourcing/i;
const TIME_RATE = /stundensatz|tagessatz|pro stunde|pro tag|per hour|std\.?\s*satz|\/\s*(h|std|tag)\b/i;

describe("FAQS_DE — answer-engine copy obeys §7 + no time rate", () => {
  const all = FAQS_DE.flatMap((f) => [f.q, f.a]).join(" ");

  it("has real question/answer pairs", () => {
    expect(FAQS_DE.length).toBeGreaterThanOrEqual(5);
    for (const f of FAQS_DE) {
      expect(f.q.trim().length).toBeGreaterThan(0);
      expect(f.a.trim().length).toBeGreaterThan(0);
    }
  });
  it("uses no §7 banned vocabulary", () => {
    expect(all).not.toMatch(BANNED);
  });
  it("never expresses a time-based rate", () => {
    expect(all).not.toMatch(TIME_RATE);
  });
  it("has no exclamation marks (§7 tone)", () => {
    expect(all).not.toContain("!");
  });
  it("names no specific price (the §0 thesis is open)", () => {
    // No euro amounts in the FAQ copy — pricing lives on /preise only.
    expect(all).not.toMatch(/\d[\d.]*\s*€|€\s*\d/);
  });
});

describe("faqLd()", () => {
  it("builds a FAQPage with one Question per entry", () => {
    const ld = faqLd(FAQS_DE) as { "@type": string; mainEntity: unknown[] };
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity.length).toBe(FAQS_DE.length);
  });
});

describe("breadcrumbLd()", () => {
  it("numbers items from 1 and uses absolute URLs", () => {
    const ld = breadcrumbLd([{ name: "Start", path: "/" }, { name: "Preise", path: "/preise" }]) as {
      itemListElement: { position: number; item: string }[];
    };
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1].item).toBe(`${SITE}/preise`);
  });
});

describe("entity schema is on-message", () => {
  it("organization + service descriptions avoid banned vocabulary", () => {
    const text = [organizationLd.description, organizationLd.slogan, serviceLd.description].join(" ");
    expect(text).not.toMatch(BANNED);
  });
  it("organization links a real sameAs entity", () => {
    expect(organizationLd.sameAs.length).toBeGreaterThan(0);
  });
});
