// ── The client's real alternatives (CLAUDE.md §7) ────────────────────────────
// The comparison a CTO actually runs before buying. It lives here rather than
// in JSX because every figure is a factual claim we have to be able to defend.
//
// Two rules govern the copy below:
//   1. Claims must be falsifiable (§7). We state what structurally differs —
//      "the contract is for a result" — never "your risk is eliminated". The
//      latter is a legal opinion, and §4 reserves those for a Fachanwalt.
//   2. §7 bans the vocabulary of employment and placement for what we sell.
//      The alternatives are therefore named by what the client *does*
//      (build internally, contract an individual directly), not by job titles.

export type AlternativeId = "intern" | "direkt" | "hyrde";

export type ComparisonRow = {
  id: string;
  /** What is being compared. */
  labelDe: string;
  /** Value per alternative, keyed by AlternativeId. */
  values: Record<AlternativeId, string>;
  /** Optional footnote marker tying a figure to its source. */
  note?: string;
};

export const ALTERNATIVES: { id: AlternativeId; labelDe: string; subDe: string }[] = [
  {
    id: "intern",
    labelDe: "Interner Aufbau",
    subDe: "Eine Stelle besetzen",
  },
  {
    id: "direkt",
    labelDe: "Direktbeauftragung",
    subDe: "Externe Einzelperson",
  },
  {
    id: "hyrde",
    labelDe: "Werkvertrag mit Hyrde",
    subDe: "Definiertes Ergebnis",
  },
];

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    id: "zeit",
    labelDe: "Zeit bis zur Umsetzung",
    values: {
      intern: "im Mittel 7,7 Monate",
      direkt: "2–6 Wochen",
      hyrde: "14 Tage nach Vertragsschluss",
    },
    note: "vakanz",
  },
  {
    id: "bindung",
    labelDe: "Vertragliche Bindung",
    values: {
      intern: "unbefristet, Kündigungsschutz",
      direkt: "je Einsatz, laufend verlängert",
      hyrde: "endet mit der Abnahme",
    },
  },
  {
    id: "gegenstand",
    labelDe: "Vertragsgegenstand",
    values: {
      intern: "Arbeitsleistung nach Weisung",
      direkt: "häufig Tätigkeit, nicht Ergebnis",
      hyrde: "definiertes Ergebnis mit Abnahmekriterien",
    },
  },
  {
    id: "risiko",
    labelDe: "Scheinselbstständigkeitsrisiko",
    values: {
      intern: "entfällt — es besteht ein Arbeitsverhältnis",
      direkt: "liegt beim Auftraggeber",
      hyrde: "Vertragspartner ist ein Unternehmen, nicht die Person",
    },
  },
  {
    id: "preis",
    labelDe: "Preisbildung",
    values: {
      intern: "rund 98.000 € Vollkosten je Jahr",
      direkt: "Tagessatz, Umfang offen",
      hyrde: "Festpreis je Meilenstein",
    },
    note: "vollkosten",
  },
];

/**
 * Sources for every number above. Shown on the page — a German B2B buyer
 * checks, and an unsourced figure reads as marketing.
 */
export const COMPARISON_NOTES: Record<string, string> = {
  vakanz:
    "Durchschnittliche Vakanzzeit für IT-Fachkräfte in Deutschland; Bundesagentur für Arbeit / Bitkom, 2025.",
  vollkosten:
    "Beispielrechnung: 80.000 € Bruttojahresgehalt zuzüglich rund 22 % Arbeitgeberbeiträgen zur Sozialversicherung.",
};
