// ── Structured data + SEO/AEO helpers (CLAUDE.md §7, §10) ────────────────────
// One source for the schema.org entities and the German FAQ. Everything here is
// German, on-message (no §7 banned vocabulary, no time-based rate, no invented
// guarantee), and carries no specific prices (the §0 pricing thesis is open).

export const SITE = "https://hyrde.net";
const REPO = "https://github.com/AlfawakhryDev/hyrde";
const DACH = ["DE", "AT", "CH"];

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hyrde",
  url: SITE,
  description:
    "Hyrde liefert definierte Software- und Engineering-Ergebnisse zum Festpreis per Werkvertrag, mit klaren Abnahmekriterien und einem Compliance-Dossier je Auftrag.",
  slogan: "Definierte Ergebnisse. Festpreis. Ohne Scheinselbstständigkeitsrisiko.",
  areaServed: DACH,
  knowsAbout: [
    "Werkvertrag",
    "Scheinselbstständigkeit",
    "Festpreis-Softwareentwicklung",
    "Cloud-Engineering",
    "Data-Engineering",
    "KI-Systeme",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "abdelrahman@hyrde.net",
    contactType: "sales",
    availableLanguage: ["de", "en"],
  },
  sameAs: [REPO], // public source repo — a real, verifiable entity link
};

export const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Werkleistung — definierte Software- und Engineering-Ergebnisse",
  serviceType: "Festpreis-Werkvertrag für Software- und Engineering-Ergebnisse",
  provider: { "@type": "Organization", name: "Hyrde", url: SITE },
  areaServed: DACH,
  audience: { "@type": "BusinessAudience", audienceType: "Unternehmen im DACH-Raum (Cloud, KI, Data)" },
  description:
    "Ein definiertes Ergebnis zum Festpreis, per Werkvertrag mit Abnahmekriterien, umgesetzt von geprüften Spezialisten. Sie beauftragen Hyrde, nicht eine Einzelperson.",
};

export const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hyrde",
  url: SITE,
  inLanguage: "de-DE",
};

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE}${it.path}`,
    })),
  };
}

export type Faq = { q: string; a: string };

// The questions a DACH CTO actually asks. BLUF answers, quotable by answer
// engines; the homepage renders these as visible content that backs the schema.
export const FAQS_DE: Faq[] = [
  {
    q: "Was ist ein Werkvertrag und wie adressiert er das Scheinselbstständigkeitsrisiko?",
    a: "Ein Werkvertrag schuldet ein definiertes, abgenommenes Ergebnis — keine weisungsgebundene Arbeitszeit. Weil ein Unternehmen (Hyrde) als Auftragnehmer auftritt und das Werk über Abnahmekriterien definiert ist, entfällt das Muster, das als Scheinselbstständigkeit eingeordnet wird. Der Auftrag wird strukturell als echter Werkvertrag ausgestaltet; ein Risiko wird nicht per Zusicherung eliminiert.",
  },
  {
    q: "Wie entsteht der Festpreis?",
    a: "Sie beschreiben das gewünschte Ergebnis. Wir antworten mit einer Leistungsbeschreibung, Abnahmekriterien je Meilenstein und einem Festpreis. Erst wenn der Umfang schriftlich steht, wird ein Preis genannt, und er ändert sich nur mit der Leistungsbeschreibung.",
  },
  {
    q: "Wer setzt die Arbeit um?",
    a: "Im Fachinterview geprüfte Spezialisten, die Hyrde im Unterauftrag beauftragt. Sie schließen den Vertrag mit Hyrde, nicht mit einer Einzelperson — zwischen Ihnen und dem Spezialisten steht ein Unternehmen.",
  },
  {
    q: "Wie schnell kann ein Auftrag starten?",
    a: "In der Regel innerhalb von etwa zwei Wochen nach Klärung der Leistungsbeschreibung — deutlich schneller als eine Neubesetzung, die eine IT-Stelle im Mittel 7,7 Monate offen lässt.",
  },
  {
    q: "Was enthält das Compliance-Dossier?",
    a: "Je Auftrag: den unterzeichneten Werkvertrag mit Leistungsbeschreibung und Abnahmekriterien, Abnahmeprotokolle mit Zeitstempel, Nachweise zur selbstständigen Leistungserbringung und Rechnungen von Hyrde. Als ein PDF exportierbar.",
  },
  {
    q: "In welchen Bereichen liefert Hyrde?",
    a: "Cloud-, KI- und Data-Engineering: Architektur und Migration, Daten-Pipelines, ML- und KI-Systeme, Plattform und DevOps, Backend und APIs.",
  },
];

export function faqLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
