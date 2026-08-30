// ── Engagement pricing (CLAUDE.md §4, §7, §11) ───────────────────────────────
// Single source of truth for what a client pays. Lives in config, not in JSX,
// so copy and price can move without touching components.
//
// Three rules this file encodes, all of them legal rather than commercial:
//   1. We price a RESULT, never time. No day rate or hourly figure is ever
//      shown to a client — an hourly price is the evidence of a Dienstvertrag,
//      which is the exact liability we remove (§1, §4).
//   2. Money is an integer in minor units. Never a float (§11).
//   3. Bands are floors ("ab X"), not quotes. The real price follows the
//      Leistungsbeschreibung, and no price is named before the scope is set.

export type Currency = "EUR";

/** Money as integer minor units + explicit currency (§11). */
export type Money = { amount: number; currency: Currency };

export const eur = (majorUnits: number): Money => ({
  amount: Math.round(majorUnits * 100),
  currency: "EUR",
});

/**
 * German number format, EUR, no decimals for whole amounts (§6).
 * 1800000 minor units → "18.000 €"
 */
export function formatMoney(m: Money, locale = "de-DE"): string {
  const hasCents = m.amount % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(m.amount / 100);
}

export type Billing = "per-engagement" | "per-month";

export type EngagementTier = {
  id: string;
  /** Ordinal — a Werkvertrag has genuinely ordered parts, so numbering is earned (§10). */
  index: number;
  nameDe: string;
  /** One line: what the client actually receives. */
  summaryDe: string;
  /** Price floor. The band, not a quote. */
  from: Money;
  billing: Billing;
  /** Indicative duration — a delivery estimate, never a billing unit. */
  durationDe: string;
  /** What is included. Each item must be a falsifiable statement (§7 tone). */
  includesDe: string[];
  /** Who this fits — helps a CTO self-select without a sales call. */
  fitDe: string;
};

export const ENGAGEMENT_TIERS: EngagementTier[] = [
  {
    id: "pilot",
    index: 1,
    nameDe: "Pilotauftrag",
    summaryDe:
      "Ein abgegrenztes Ergebnis, vollständig geliefert und abgenommen. Der übliche Einstieg.",
    from: eur(18_000),
    billing: "per-engagement",
    durationDe: "4–6 Wochen",
    fitDe:
      "Wenn Sie die Zusammenarbeit an einem realen, aber begrenzten Vorhaben prüfen möchten.",
    includesDe: [
      "Leistungsbeschreibung und Abnahmekriterien vor Vertragsbeginn",
      "Werkvertrag nach deutschem Recht, Hyrde als Auftragnehmer",
      "Festpreis je Meilenstein, fällig bei Abnahme",
      "Compliance-Dossier zum Auftrag als PDF",
    ],
  },
  {
    id: "projekt",
    index: 2,
    nameDe: "Projektauftrag",
    summaryDe:
      "Ein vollständiges Vorhaben, in abgenommene Meilensteine gegliedert.",
    from: eur(45_000),
    billing: "per-engagement",
    durationDe: "2–3 Monate",
    fitDe:
      "Wenn ein Vorhaben auf der Roadmap steht, aber im Team keine Kapazität dafür frei ist.",
    includesDe: [
      "Alle Leistungen des Pilotauftrags",
      "Mehrere Meilensteine mit je eigenen Abnahmekriterien",
      "Fester Ansprechpartner für die Auftragsabwicklung",
      "Gewährleistung auf das abgenommene Werk",
    ],
  },
  {
    id: "rahmen",
    index: 3,
    nameDe: "Rahmenvertrag",
    summaryDe:
      "Fortlaufend definierte Ergebnisse: je Zyklus eine eigene Leistungsbeschreibung mit eigener Abnahme.",
    from: eur(24_000),
    billing: "per-month",
    durationDe: "monatlich, mindestens 3 Monate",
    fitDe:
      "Wenn regelmäßig abgrenzbare Vorhaben anfallen und Sie den Vertragsaufwand je Auftrag vermeiden möchten.",
    includesDe: [
      "Alle Leistungen des Projektauftrags",
      "Je Zyklus definierte Ergebnisse mit eigener Abnahme",
      "Planbare Kapazität für aufeinanderfolgende Vorhaben",
      "Vorrang bei der Zuordnung von Spezialisten",
    ],
  },
];

/**
 * What the price is *not*. Stated explicitly because every one of these is a
 * marketplace convention we deliberately do not have (§1) — and because a
 * German buyer reads an unlisted fee as a hidden one.
 */
export const PRICE_EXCLUSIONS_DE: string[] = [
  "Keine Vermittlungsgebühr",
  "Keine Plattform- oder Nutzungsgebühr",
  "Kein Stundensatz und keine Zeiterfassung",
  "Keine Nachberechnung ohne schriftliche Änderung der Leistungsbeschreibung",
];

/**
 * Commitments that cost us nothing to offer and that a client can hold us to.
 * Claims must be falsifiable (§7) — each of these either happens or does not.
 */
export const COMMITMENTS_DE: { termDe: string; bodyDe: string }[] = [
  {
    termDe: "14 Tage bis zum Start",
    bodyDe:
      "Nach unterzeichnetem Werkvertrag beginnt die Arbeit am definierten Ergebnis innerhalb von 14 Tagen.",
  },
  {
    termDe: "Zahlung erst bei Abnahme",
    bodyDe:
      "Ein Meilenstein wird fällig, wenn er den vereinbarten Abnahmekriterien entspricht — nicht nach verstrichener Zeit.",
  },
  {
    termDe: "Ein Vertragspartner",
    bodyDe:
      "Sie schließen den Vertrag mit Hyrde. Zwischen Ihnen und dem Spezialisten besteht kein Vertragsverhältnis.",
  },
];

/** Payment terms — DACH standard is 30 days net (§5). */
export const PAYMENT_TERMS_DE = {
  netDays: 30,
  depositPercent: 30,
} as const;
