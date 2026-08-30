import { describe, expect, it } from "vitest";
import { eur } from "./pricing";
import { totalPrice, validateEngagement, type EngagementInput } from "./werkvertrag";
import { buildWerkvertrag, WERKVERTRAG_VERSION } from "@/legal/templates/de/werkvertrag.v1";

// A complete, valid engagement to mutate in individual tests.
const base = (): EngagementInput => ({
  client: { name: "Acme GmbH", address: "Beispielstraße 1\n10115 Berlin" },
  engagementTitle: "Migration der Kernanwendung nach AWS",
  leistungsbeschreibung: "Überführung der monolithischen Anwendung in eine skalierbare AWS-Architektur.",
  milestones: [
    { title: "Zielarchitektur dokumentiert", acceptance: "Architekturdokument vom CTO abgenommen", price: eur(8_400) },
    { title: "Kernservices migriert", acceptance: "Services in Produktion, Lasttest bestanden", price: eur(19_600) },
  ],
});

describe("totalPrice()", () => {
  it("sums milestone prices as integer minor units", () => {
    const t = totalPrice(base().milestones);
    expect(t.amount).toBe(28_000_00);
    expect(Number.isInteger(t.amount)).toBe(true);
    expect(t.currency).toBe("EUR");
  });
  it("is zero for no milestones, never NaN", () => {
    expect(totalPrice([]).amount).toBe(0);
  });
});

describe("validateEngagement() — §4 refuses to open without scope + acceptance", () => {
  it("passes a complete engagement", () => {
    expect(validateEngagement(base())).toEqual([]);
  });
  it("refuses a missing Leistungsbeschreibung", () => {
    const e = base(); e.leistungsbeschreibung = "   ";
    expect(validateEngagement(e).some(x => x.field === "leistungsbeschreibung")).toBe(true);
  });
  it("refuses a milestone without an Abnahmekriterium", () => {
    const e = base(); e.milestones[1].acceptance = "";
    expect(validateEngagement(e).some(x => x.field === "milestones.1.acceptance")).toBe(true);
  });
  it("refuses zero milestones", () => {
    const e = base(); e.milestones = [];
    expect(validateEngagement(e).some(x => x.field === "milestones")).toBe(true);
  });
  it("refuses a non-positive price", () => {
    const e = base(); e.milestones[0].price = eur(0);
    expect(validateEngagement(e).some(x => x.field === "milestones.0.price")).toBe(true);
  });
});

describe("buildWerkvertrag() — rendered document", () => {
  const doc = buildWerkvertrag(base());
  const allText = [
    doc.preamble,
    ...doc.sections.flatMap(s => [s.heading, ...s.blocks.flatMap(b => typeof b === "string" ? [b] : b.list)]),
  ].join(" ");

  it("carries the version and stays a draft until reviewed (legal README)", () => {
    expect(doc.version).toBe(WERKVERTRAG_VERSION);
    expect(doc.draft).toBe(true);
  });

  it("never expresses price as time (§1, §4) — no rate anywhere in the document", () => {
    expect(allText).not.toMatch(/stundensatz|tagessatz|pro stunde|pro tag|per hour|std\.?\s*satz|\/\s*(h|std|tag)\b/i);
  });

  it("contains the mandatory structure: Leistungsbeschreibung, Abnahme, Meilensteine", () => {
    const headings = doc.sections.map(s => s.heading);
    expect(headings).toContain("Leistungsbeschreibung");
    expect(headings).toContain("Abnahme");
    expect(headings).toContain("Meilensteine und Abnahmekriterien");
  });

  it("puts Hyrde as Auftragnehmer and does not invent a legal entity (§12 #2)", () => {
    expect(doc.auftragnehmer.join(" ")).toMatch(/Hyrde/);
    expect(doc.auftragnehmer.join(" ")).toMatch(/festzulegen|Platzhalter|\[/); // placeholder, not a real Rechtsträger
  });

  it("does not use §7 banned vocabulary in the contract text", () => {
    expect(allText).not.toMatch(/freelancer|freiberufler|mitarbeiter|arbeitskraft|verstärkung|zeitarbeit|arbeitnehmerüberlassung|marktplatz|günstig|billig|outsourcing/i);
  });

  it("shows the total as the sum of milestones, in German currency format", () => {
    expect(allText).toContain("28.000");
  });
});
