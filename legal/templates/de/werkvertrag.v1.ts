// ⚠️ LEGAL_REVIEW_REQUIRED — see legal/templates/README.md
// German Werkvertrag template, version 1. UNREVIEWED. Every document built from
// this file renders with an "ENTWURF · rechtlich ungeprüft" mark until a
// Fachanwalt has reviewed it and the README status table says YES.
//
// This is a clause SKELETON structured to encode the CLAUDE.md §4 requirements
// (defined result, Leistungsbeschreibung + Abnahmekriterien, Abnahme-triggered
// payment, self-employment indicia, Hyrde as Auftragnehmer). It is NOT legal
// advice and NOT ready to sign. Do not add a real Rechtsträger until §12 #2 is
// settled; the Auftragnehmer block is a deliberate placeholder.
//
// Legal text lives ONLY in this file. Components render the returned ContractDoc.

import { formatMoney, PAYMENT_TERMS_DE } from "@/lib/pricing";
import { totalPrice, type ContractDoc, type EngagementInput } from "@/lib/werkvertrag";

export const WERKVERTRAG_VERSION = "de-werkvertrag-v1";

// Placeholder Auftragnehmer — the Hyrde legal entity is undecided (§12 #2).
// Rendered verbatim so the draft can never be mistaken for a real party.
const AUFTRAGNEHMER_PLACEHOLDER = [
  "Hyrde [Rechtsträger noch festzulegen — § 12 #2]",
  "[Anschrift des Rechtsträgers]",
  "[USt-IdNr.]",
];

function formatDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}

export function buildWerkvertrag(input: EngagementInput): ContractDoc {
  const total = totalPrice(input.milestones);
  const deposit = PAYMENT_TERMS_DE.depositPercent;
  const net = PAYMENT_TERMS_DE.netDays;
  const gerichtsstand = input.gerichtsstand?.trim() || "[Gerichtsstand]";

  const auftraggeber = [
    input.client.name,
    ...input.client.address.split("\n").map((l) => l.trim()).filter(Boolean),
    ...(input.client.contact ? [`Ansprechpartner: ${input.client.contact}`] : []),
    ...(input.client.vatId ? [`USt-IdNr.: ${input.client.vatId}`] : []),
  ];

  // § 3 — one clause line per milestone: result, acceptance criterion, fixed price.
  const milestoneBlocks = input.milestones.flatMap((m, i) => {
    const lines = [
      `Meilenstein ${i + 1} — ${m.title}`,
      `Abnahmekriterium: ${m.acceptance}`,
      `Festpreis: ${formatMoney(m.price)}, fällig bei Abnahme dieses Meilensteins.`,
    ];
    if (m.targetDate) lines.push(`Zieltermin (unverbindliche Schätzung): ${formatDate(m.targetDate)}`);
    return [{ list: lines }];
  });

  return {
    version: WERKVERTRAG_VERSION,
    draft: true, // template is unreviewed; keep true until the README says otherwise
    title: "Werkvertrag",
    auftraggeber,
    auftragnehmer: AUFTRAGNEHMER_PLACEHOLDER,
    preamble:
      `Dieser Werkvertrag (§ 631 BGB) wird geschlossen am ${formatDate(input.date)} zwischen ` +
      `dem Auftraggeber und dem Auftragnehmer über die Erbringung des nachstehend definierten Werks: ` +
      `„${input.engagementTitle}“.`,
    sections: [
      {
        n: 1,
        heading: "Vertragsgegenstand",
        blocks: [
          "Der Auftragnehmer schuldet die Herstellung eines konkret bestimmten Werks, nicht die Erbringung von Arbeitsleistung nach Weisung. Geschuldet ist der in § 2 beschriebene Erfolg, gegliedert in die Meilensteine nach § 3.",
          "Der Auftragnehmer erbringt die Leistung als selbstständiger Werkunternehmer. Er kann sich zur Erfüllung geeigneter Dritter (Spezialisten) im Unterauftrag bedienen; ein Vertragsverhältnis zwischen dem Auftraggeber und diesen Dritten entsteht dadurch nicht.",
        ],
      },
      {
        n: 2,
        heading: "Leistungsbeschreibung",
        blocks: [input.leistungsbeschreibung],
      },
      {
        n: 3,
        heading: "Meilensteine und Abnahmekriterien",
        blocks: [
          "Das Werk gliedert sich in die folgenden Meilensteine. Jeder Meilenstein ist ein abgrenzbares Ergebnis mit eigenem Abnahmekriterium und eigenem Festpreis:",
          ...milestoneBlocks,
        ],
      },
      {
        n: 4,
        heading: "Abnahme",
        blocks: [
          "Nach Fertigstellung eines Meilensteins zeigt der Auftragnehmer die Abnahmebereitschaft an. Der Auftraggeber prüft das Ergebnis anhand des in § 3 vereinbarten Abnahmekriteriums und erklärt die Abnahme ausdrücklich und schriftlich (§ 640 BGB).",
          "Maßgeblich für die Fälligkeit der Vergütung ist ausschließlich die Abnahme des jeweiligen Meilensteins, nicht aufgewendete Zeit.",
        ],
      },
      {
        n: 5,
        heading: "Vergütung",
        blocks: [
          `Die Vergütung ist ein Festpreis je Meilenstein. Die Summe der Meilensteine beträgt ${formatMoney(total)} zzgl. gesetzlicher Umsatzsteuer.`,
          `Die Vergütung bemisst sich ausschließlich nach dem abgenommenen Werk und nicht nach aufgewendeter Zeit.`,
          `${deposit} % der Gesamtvergütung sind bei Vertragsschluss als Anzahlung fällig; der verbleibende Betrag wird je Meilenstein mit dessen Abnahme fällig.`,
          `Rechnungen stellt der Auftragnehmer in Euro; das Zahlungsziel beträgt ${net} Tage netto ab Rechnungsdatum.`,
        ],
      },
      {
        n: 6,
        heading: "Leistungserbringung und Selbstständigkeit",
        blocks: [
          "Der Auftragnehmer bestimmt Zeit, Ort und Art der Leistungserbringung selbst und ist nicht in die Arbeitsorganisation des Auftraggebers eingegliedert. Er unterliegt keinem Weisungsrecht des Auftraggebers hinsichtlich der Ausführung.",
          "Der Auftragnehmer setzt eigene Betriebsmittel und eigene Infrastruktur ein. Eine Verpflichtung zur Teilnahme an internen Regelterminen des Auftraggebers, zur Nutzung von Arbeitsmitteln des Auftraggebers oder zur Berichterstattung an eine Führungskraft des Auftraggebers besteht nicht.",
          "Der Auftragnehmer ist berechtigt, gleichzeitig für weitere Auftraggeber tätig zu sein.",
        ],
      },
      {
        n: 7,
        heading: "Nutzungsrechte",
        blocks: [
          "Mit vollständiger Bezahlung des jeweiligen Meilensteins überträgt der Auftragnehmer dem Auftraggeber die ausschließlichen, zeitlich und räumlich unbeschränkten Nutzungsrechte an den in diesem Meilenstein erstellten Arbeitsergebnissen, soweit gesetzlich übertragbar.",
        ],
      },
      {
        n: 8,
        heading: "Gewährleistung",
        blocks: [
          "Es gelten die gesetzlichen Vorschriften des Werkvertragsrechts (§§ 633 ff. BGB). [Umfang, Fristen und etwaige Begrenzungen sind anwaltlich zu bestimmen — § 12 #6.]",
        ],
      },
      {
        n: 9,
        heading: "Haftung",
        blocks: [
          "Es gelten die gesetzlichen Haftungsregelungen. [Haftungsbegrenzung und Versicherungsdeckung (Berufshaftpflicht) sind anwaltlich zu bestimmen und nicht Gegenstand einer Zusicherung in dieser Fassung — § 12 #6.]",
        ],
      },
      {
        n: 10,
        heading: "Schlussbestimmungen",
        blocks: [
          "Änderungen und Ergänzungen dieses Vertrages bedürfen der Schriftform. Dies gilt auch für die Änderung der Leistungsbeschreibung; eine geänderte Leistungsbeschreibung wird als Nachtrag vereinbart.",
          `Gerichtsstand ist ${gerichtsstand}. Es gilt deutsches Recht.`,
          "Sollte eine Bestimmung dieses Vertrages unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.",
        ],
      },
    ],
    signatureLabels: [
      "Ort, Datum — Auftraggeber",
      "Ort, Datum — Auftragnehmer",
    ],
  };
}
