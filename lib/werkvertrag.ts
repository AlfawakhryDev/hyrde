// ── Werkvertrag generator — logic (CLAUDE.md §4, §8 item 3, §11) ─────────────
// Pure, testable core for the internal Werkvertrag tool. Types + validation +
// money maths live here; the German legal TEXT lives in a versioned template
// under legal/templates/{locale}/ and is never inlined into a component.
//
// §4 hard rule encoded here: the system must REFUSE to open an engagement
// without a written Leistungsbeschreibung and explicit Abnahmekriterien per
// milestone. A milestone is a RESULT, never a time period, and price is never a
// rate — see the copy test in werkvertrag.test.ts.

import { type Money, type Currency } from "./pricing";

export type Party = {
  /** Legal name of the company. */
  name: string;
  /** Full postal address, newlines allowed. */
  address: string;
  /** Contact person + role, optional. */
  contact?: string;
  /** VAT id (USt-IdNr), optional; drives reverse-charge later. */
  vatId?: string;
};

export type MilestoneInput = {
  /** The delivered result — "Auth-Flow implementiert…", never "Sprint 2". */
  title: string;
  /** Abnahmekriterien — how acceptance is judged. Required (§4). */
  acceptance: string;
  /** Fixed price for this result. Money = integer minor units (§11). */
  price: Money;
  /** Indicative delivery date (ISO), optional. A date estimate, never a billing unit. */
  targetDate?: string;
};

export type EngagementInput = {
  client: Party;
  /** Short title of the engagement. */
  engagementTitle: string;
  /** Leistungsbeschreibung — the scope of work. Required (§4). */
  leistungsbeschreibung: string;
  milestones: MilestoneInput[];
  /** Gerichtsstand / place of jurisdiction, optional (defaults in template). */
  gerichtsstand?: string;
  /** Contract date (ISO), optional (defaults to today in the template). */
  date?: string;
};

/** Sum of milestone prices. Integer minor units, single currency (§11). */
export function totalPrice(milestones: MilestoneInput[]): Money {
  const currency: Currency = "EUR";
  const amount = milestones.reduce((sum, m) => {
    if (m.price.currency !== currency) {
      throw new Error(`Mixed currency: expected ${currency}, got ${m.price.currency}`);
    }
    return sum + m.price.amount;
  }, 0);
  return { amount, currency };
}

export type ValidationError = { field: string; messageDe: string };

/**
 * §4: an engagement cannot be opened without a Leistungsbeschreibung and an
 * explicit Abnahmekriterium for every milestone. Returns the list of reasons it
 * cannot be generated; empty list = ok to render.
 */
export function validateEngagement(input: EngagementInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const blank = (s: string | undefined) => !s || s.trim().length === 0;

  if (blank(input.client.name)) errors.push({ field: "client.name", messageDe: "Auftraggeber (Firmenname) fehlt." });
  if (blank(input.client.address)) errors.push({ field: "client.address", messageDe: "Anschrift des Auftraggebers fehlt." });
  if (blank(input.engagementTitle)) errors.push({ field: "engagementTitle", messageDe: "Titel des Auftrags fehlt." });
  if (blank(input.leistungsbeschreibung))
    errors.push({ field: "leistungsbeschreibung", messageDe: "Leistungsbeschreibung fehlt — ohne sie darf kein Auftrag eröffnet werden (§ 4)." });

  if (input.milestones.length === 0) {
    errors.push({ field: "milestones", messageDe: "Mindestens ein Meilenstein ist erforderlich." });
  }
  input.milestones.forEach((m, i) => {
    if (blank(m.title)) errors.push({ field: `milestones.${i}.title`, messageDe: `Meilenstein ${i + 1}: Ergebnis (Titel) fehlt.` });
    if (blank(m.acceptance)) errors.push({ field: `milestones.${i}.acceptance`, messageDe: `Meilenstein ${i + 1}: Abnahmekriterium fehlt — Pflichtfeld (§ 4).` });
    if (!Number.isInteger(m.price.amount) || m.price.amount <= 0)
      errors.push({ field: `milestones.${i}.price`, messageDe: `Meilenstein ${i + 1}: Festpreis muss ein positiver Betrag sein.` });
  });

  return errors;
}

// ── Rendered contract document (what a template returns) ─────────────────────
// A structured document, not HTML strings, so the render component stays generic
// and legal text stays in the template file.
export type ContractBlock = string | { list: string[] };
export type ContractSection = { n: number; heading: string; blocks: ContractBlock[] };
export type ContractDoc = {
  version: string;
  /** ENTWURF mark until the template is Fachanwalt-reviewed (see legal README). */
  draft: boolean;
  title: string;
  auftraggeber: string[]; // rendered lines
  auftragnehmer: string[];
  preamble: string;
  sections: ContractSection[];
  signatureLabels: string[];
};
