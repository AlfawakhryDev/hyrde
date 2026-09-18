// ─── Deutsche (DACH) Ratgeber ───────────────────────────────────────
// Search Console (2026-09-01) zeigt echte deutsche Nachfrage: Deutschland
// lieferte 172 Impressionen, angeführt von "wordpress entwickler berlin" (53)
// und "wordpress programmierer berlin" (40) — bisher ohne passende Zielseite.
// Diese Ratgeber sind die deutschsprachige Antwort darauf. Gleiche `Guide`-
// Struktur wie EN/AR, gerendert von app/de/guides/*.
import type { Guide } from "./guides";

export const DE_GUIDES: Record<string, Guide> = {
  "wordpress-entwickler-finden": {
    slug: "wordpress-entwickler-finden",
    cluster: "client",
    clusterLabel: "Ratgeber Beauftragen",
    title: "WordPress-Entwickler finden und beauftragen: Leitfaden 2026",
    metaTitle: "WordPress-Entwickler finden & beauftragen (Berlin & DACH) 2026",
    metaDescription:
      "Wie du 2026 einen zuverlässigen WordPress-Entwickler findest: wo du suchst, wie du Können wirklich prüfst, was üblich ist an Stundensätzen und wie du dein Budget absicherst.",
    excerpt:
      "Wo du suchst, wie du Können wirklich prüfst und was ein WordPress-Entwickler in Berlin und im DACH-Raum kostet.",
    readMins: 8,
    updated: "2026-09-01",
    intro: [
      "Einen WordPress-Entwickler zu finden ist einfach. Einen zu finden, der sauber arbeitet, Termine hält und den Shop nicht beim nächsten Core-Update zerlegt, ist es nicht. Die meisten Plattformen belohnen die Menge an Bewerbungen, nicht die Qualität der Ergebnisse — die Prüfung bleibt an dir hängen.",
      "Dieser Leitfaden zeigt Schritt für Schritt, wie du 2026 im DACH-Raum beauftragst: wo du suchst, wie du Fähigkeiten vor der Zusage prüfst, welche Stundensätze realistisch sind und wie du das Projekt so aufteilst, dass dein Budget geschützt bleibt.",
    ],
    sections: [
      {
        h2: "1. Beschreibe das Ergebnis, nicht die Rolle",
        body: [
          "Der häufigste Fehler ist die Suche nach „einem WordPress-Entwickler“ statt nach einem konkreten Ergebnis. „Ein WooCommerce-Shop, der Zahlungen entgegennimmt und in unter zwei Sekunden lädt“ zieht andere Bewerber an als eine Rollenbeschreibung — und macht Angebote vergleichbar.",
          "Je klarer das Ergebnis, desto einfacher die Bewertung: Du vergleichst definierte Lieferungen statt allgemeiner Versprechen.",
        ],
      },
      {
        h2: "2. Prüfe Können, nicht das Portfolio",
        body: [
          "Portfolios lassen sich generieren, Bewertungen lassen sich sammeln. Aussagekräftiger ist eine kleine bezahlte Arbeitsprobe, die deinem echten Projekt ähnelt — oder eine Plattform, die die Fähigkeit vorab im Interview prüft.",
          "Frag nach einem konkreten ausgelieferten Projekt und geh ins Detail: Welche Entscheidung war schwierig? Wie wurde sie gelöst? Präzise Antworten trennen Profis von Selbstdarstellern.",
        ],
        bullets: [
          "Gutes Zeichen: fragt nach Hosting, Theme-Altlasten und Plugin-Stack, bevor er einen Preis nennt.",
          "Warnzeichen: identische Textbausteine als Angebot, oder ein auffällig niedriger Preis ohne Begründung.",
          "Lösung: kleine bezahlte Arbeitsprobe oder eine im Interview geprüfte Fachkraft.",
        ],
      },
      {
        h2: "3. Realistische Stundensätze im DACH-Raum",
        body: [
          "Als grobe Orientierung für 2026: einfache Theme- und Pflegearbeiten liegen etwa bei 40–65 € pro Stunde, solide Umsetzung von Design zu Template bei rund 65–95 €, und anspruchsvolle WooCommerce- oder Performance-Arbeit bei etwa 95–140 €. In Berlin, München und Zürich liegen die Sätze am oberen Rand, remote im DACH-Raum oft darunter.",
          "Sehr niedrige Angebote sind selten ein Sparerfolg: Sie deuten meist auf einen unklaren Umfang hin, der später als Nachtrag zurückkommt.",
        ],
      },
      {
        h2: "4. Teile das Projekt in Meilensteine",
        body: [
          "Zahle weder alles im Voraus noch alles am Ende. Teile das Projekt in kleine Schritte und koppele jede Zahlung an eine Lieferung, die du prüfst und freigibst. So bleibt der Schaden auf einen Meilenstein begrenzt, falls es stockt.",
          "Kurze Meilensteine machen Probleme früh sichtbar und geben dir natürliche Punkte, um den Kurs zu ändern, bevor die Kosten steigen.",
        ],
      },
      {
        h2: "5. Prüfe vor der Freigabe",
        body: [
          "Vergleiche die Lieferung vor der Zahlung Punkt für Punkt mit deinen Abnahmekriterien. Eine unabhängige Prüfung — menschlich oder KI-gestützt — findet Lücken, bevor daraus ein Streit wird. Freigeben, dann direkt bezahlen.",
        ],
      },
    ],
    faqs: [
      {
        q: "Was kostet ein WordPress-Entwickler in Deutschland?",
        a: "Als Orientierung für 2026: einfache Theme- und Pflegearbeiten etwa 40–65 € pro Stunde, solide Umsetzung rund 65–95 €, anspruchsvolle WooCommerce- oder Performance-Arbeit etwa 95–140 €. In Berlin und München liegen die Sätze am oberen Rand. Ein klar beschriebener Umfang senkt den Preis, weil er das Risiko für den Entwickler reduziert.",
      },
      {
        q: "Wo finde ich einen geprüften WordPress-Entwickler?",
        a: "Am verlässlichsten über eine Plattform, die Fähigkeiten vorab im Interview prüft, statt sich auf Sterne und Abzeichen zu verlassen. Auf Hyrde besteht jede Fachkraft ein KI-Fachinterview in ihrer Kategorie, danach wird dir automatisch genau eine passende Person vermittelt — ohne Ausschreibung und ohne Angebots-Spam.",
      },
      {
        q: "Freelancer oder Agentur für WordPress?",
        a: "Für ein abgegrenztes Projekt ist ein Freelancer meist schneller und deutlich günstiger. Eine Agentur lohnt sich, wenn du dauerhaft mehrere Gewerke, Vertretungsregelungen und feste Reaktionszeiten brauchst. Für einen Relaunch mit klarem Umfang reicht in der Regel eine geprüfte Fachkraft plus definierte Meilensteine.",
      },
      {
        q: "Wie viel sollte ich im Voraus zahlen?",
        a: "Zahle nicht den gesamten Betrag vorab. Teile das Projekt in kleine Meilensteine und koppele jede Zahlung an eine Lieferung, die du prüfst und freigibst — so bleibt dein Risiko auf einen Meilenstein begrenzt.",
      },
    ],
    cta: {
      heading: "Beauftrage ein Ergebnis, keinen Freelancer",
      body: "Beschreibe in einem Satz, was du brauchst — die KI vermittelt dir eine im Interview geprüfte Fachkraft. Im Early Access kostenlos.",
      label: "Aufgabe kostenlos posten",
      href: "/signup",
    },
    related: ["freelancer-stundensatz-deutschland", "upwork-alternative-deutschland"],
  },

  "freelancer-stundensatz-deutschland": {
    slug: "freelancer-stundensatz-deutschland",
    cluster: "client",
    clusterLabel: "Ratgeber Preise",
    title: "Was kostet ein Freelancer? Stundensätze in Deutschland 2026",
    metaTitle: "Freelancer-Stundensätze in Deutschland 2026: realistische Preise",
    metaDescription:
      "Realistische Stundensätze für Freelancer in Deutschland 2026 nach Gewerk — Entwicklung, Design, Text, Marketing, Daten — und was den Preis nach oben oder unten treibt.",
    excerpt:
      "Realistische Stundensätze nach Gewerk, was den Preis treibt, und wie du dein Projekt vorab kalkulierst.",
    readMins: 7,
    updated: "2026-09-01",
    intro: [
      "„Was kostet das?“ hat keine einzelne Antwort — der Preis hängt vom Umfang, der Erfahrung und der Komplexität ab. Realistische Bandbreiten zu kennen schützt dich aber vor zwei teuren Fehlern: zu viel zu zahlen, und ein auffällig günstiges Angebot anzunehmen, das später als Nacharbeit zurückkommt.",
      "Dieser Ratgeber gibt Orientierungswerte für Deutschland 2026 nach Gewerk, erklärt die Preistreiber, und zeigt, wann Stundensatz und wann Festpreis sinnvoller ist.",
    ],
    sections: [
      {
        h2: "Was den Preis bestimmt",
        body: [
          "Vier Faktoren dominieren: die Klarheit des Umfangs (je unklarer, desto höher der Risikoaufschlag), die Erfahrung, die technische Komplexität samt Schnittstellen, und der Termindruck. Eine präzise Beschreibung mit Abnahmekriterien ist das günstigste Mittel zur Preissenkung, weil sie das Risiko für die Fachkraft reduziert.",
        ],
      },
      {
        h2: "Orientierungswerte nach Gewerk (2026)",
        body: [
          "Richtwerte für den deutschen Markt, als Ausgangspunkt für das Gespräch, nicht als Endpreis:",
        ],
        bullets: [
          "Text und Content: etwa 50–90 € pro Stunde.",
          "Grafik und Branding: etwa 60–100 € pro Stunde.",
          "UI/UX-Design: etwa 70–120 € pro Stunde.",
          "Web- und WordPress-Entwicklung: etwa 60–120 € pro Stunde.",
          "App- und Full-Stack-Entwicklung: etwa 80–150 € pro Stunde.",
          "Daten und Analytics: etwa 80–140 € pro Stunde.",
        ],
      },
      {
        h2: "Stundensatz oder Festpreis?",
        body: [
          "Ein Festpreis ist sinnvoll, wenn der Umfang klar ist: Du bekommst eine bekannte Obergrenze, und die Zahlung hängt am Ergebnis. Ein Stundensatz passt zu offenen oder laufenden Aufgaben, verlangt aber engere Begleitung. In beiden Fällen gilt: in Meilensteine teilen und jede Zahlung an eine Lieferung koppeln.",
        ],
      },
      {
        h2: "Warum Angebote so weit auseinanderliegen",
        body: [
          "Weil jede Fachkraft den Umfang anders versteht und Risiko sowie Erfahrung anders bewertet. Ein sehr niedriges Angebot deutet meist auf ein unvollständiges Verständnis hin, ein sehr hohes auf einen Risikoaufschlag oder Plattformgebühren. Vergleiche Angebote danach, wie gut sie dein Projekt verstanden haben — nicht allein nach dem Preis.",
        ],
      },
      {
        h2: "Kalkuliere vorab statt zu schätzen",
        body: [
          "Mit dem kostenlosen Kostenrechner von Hyrde beschreibst du dein Projekt und bekommst eine Aufschlüsselung nach Meilensteinen mit realistischen Spannen und einem Zeitrahmen — ohne Anmeldung. Damit gehst du informiert in jedes Preisgespräch.",
        ],
      },
    ],
    faqs: [
      {
        q: "Was kostet ein Freelancer in Deutschland pro Stunde?",
        a: "Je nach Gewerk 2026 grob: Text 50–90 €, Grafik 60–100 €, UI/UX 70–120 €, Web-Entwicklung 60–120 €, App- und Full-Stack-Entwicklung 80–150 €, Daten 80–140 €. Ein klar beschriebener Umfang mit Abnahmekriterien senkt den Preis, weil er das Risiko reduziert.",
      },
      {
        q: "Ist ein Festpreis oder ein Stundensatz besser?",
        a: "Ein Festpreis ist besser, wenn der Umfang klar ist — er gibt dir eine bekannte Obergrenze und koppelt die Zahlung an das Ergebnis. Ein Stundensatz passt zu offenen oder laufenden Arbeiten, erfordert aber engere Begleitung und klare Meilensteine.",
      },
      {
        q: "Warum sind manche Angebote so viel günstiger?",
        a: "Meist weil der Umfang nicht vollständig verstanden wurde. Der niedrige Preis wird später über Nachträge oder Nacharbeit ausgeglichen. Bewerte Angebote danach, wie präzise sie dein Projekt erfasst haben, nicht nur nach der Zahl.",
      },
      {
        q: "Wie kalkuliere ich mein Projekt kostenlos?",
        a: "Mit dem kostenlosen Kostenrechner von Hyrde unter hyrde.net/cost-estimator: Projekt beschreiben, und du erhältst eine Aufschlüsselung nach Meilensteinen mit realistischen Kostenspannen und Zeitrahmen — ohne Anmeldung.",
      },
    ],
    cta: {
      heading: "Kenne deinen Preis in einer Minute",
      body: "Beschreibe dein Projekt und erhalte eine Aufschlüsselung nach Meilensteinen mit realistischen Spannen — kostenlos, ohne Anmeldung.",
      label: "Projektkosten schätzen",
      href: "/cost-estimator",
    },
    related: ["wordpress-entwickler-finden", "upwork-alternative-deutschland"],
  },

  "upwork-alternative-deutschland": {
    slug: "upwork-alternative-deutschland",
    cluster: "client",
    clusterLabel: "Plattform-Vergleich",
    title: "Upwork-Alternative für Deutschland: vermitteln statt ausschreiben",
    metaTitle: "Upwork-Alternative für Deutschland 2026 | Hyrde",
    metaDescription:
      "Du suchst eine Upwork- oder Fiverr-Alternative für den DACH-Raum? Der ehrliche Vergleich: Prüfung, Angebotsflut, Gebühren — und wann automatische Vermittlung besser passt.",
    excerpt:
      "Der ehrliche Vergleich zwischen Ausschreibung und automatischer Vermittlung: wer wirklich prüft und wer Provision nimmt.",
    readMins: 6,
    updated: "2026-09-01",
    intro: [
      "Upwork und Fiverr sind die Standardadresse, wenn Teams im DACH-Raum Freelancer suchen. Beide funktionieren nach dem Ausschreibungsprinzip: Du postest, dann bekommst du Angebote — und die Aufgabe, aus dieser Flut die richtige Person zu erkennen, bleibt vollständig bei dir.",
      "Dieser Vergleich stellt dem ein anderes Modell gegenüber: automatische Vermittlung, bei der Fähigkeiten vorab im Interview geprüft werden und genau eine Fachkraft zugewiesen wird. Ziel ist nicht, eine Seite schlechtzureden, sondern dir die Wahl bewusst zu machen.",
    ],
    sections: [
      {
        h2: "Wie das Ausschreibungsmodell funktioniert",
        body: [
          "Du beschreibst dein Projekt, Freelancer bewerben sich, du liest Angebote, vergleichst Profile, führst Gespräche und entscheidest. Das gibt dir viel Auswahl, verlagert aber den gesamten Prüfaufwand zu dir.",
          "Da sich alle bewerben können, belohnt das System tendenziell, wer am meisten bewirbt und am günstigsten anbietet — nicht zwingend, wer am besten liefert.",
        ],
      },
      {
        h2: "Wo es im Alltag hakt",
        body: [
          "Erstens ist die Prüfung schwach: Abzeichen und Bewertungen lassen sich sammeln, negative Bewertungen unter Druck entfernen. Zweitens kostet die Angebotssichtung echte Arbeitszeit. Drittens fallen auf beiden Seiten Gebühren an, die sich am Ende im Preis niederschlagen.",
        ],
        bullets: [
          "Die Vorauswahl liegt vollständig bei dir.",
          "Prüfsignale beruhen auf manipulierbaren Bewertungen.",
          "Gebühren und Preiswettbewerb drücken auf die Qualität.",
        ],
      },
      {
        h2: "Was automatische Vermittlung anders macht",
        body: [
          "Statt einer Ausschreibung beschreibst du das Ergebnis, und die KI vermittelt genau eine im Interview geprüfte Fachkraft aus deiner Kategorie. Es gibt keinen Bewerben-Button, also auch keine Angebotsflut. Vor der Zahlung wird die Lieferung gegen deine Beschreibung geprüft.",
          "Deine Rolle verschiebt sich damit vom Sichten von Angeboten zum Freigeben von Ergebnissen.",
        ],
      },
      {
        h2: "Gebühren und Auszahlung",
        body: [
          "Auf Hyrde behalten Freelancer 100 Prozent ihres Honorars — keine Bewerbungs- oder Gebotsgebühren, keine Plattformprovision — und das Beauftragen ist im Early Access kostenlos. Ausgezahlt wird auf dem Weg, den die Fachkraft wählt, etwa Banküberweisung, PayPal, Airtm oder USDT.",
        ],
      },
      {
        h2: "Für wen sich was eignet",
        body: [
          "Willst du viele Angebote sehen und selbst auswählen, sind die klassischen Plattformen richtig. Willst du mit möglichst wenig Sichtungsaufwand zu einem verlässlichen Ergebnis kommen und lieber eine geprüfte Fachkraft als dreißig Bewerbungen, passt die automatische Vermittlung besser.",
        ],
      },
    ],
    faqs: [
      {
        q: "Was ist die beste Upwork-Alternative in Deutschland?",
        a: "Das hängt davon ab, was du willst. Suchst du ein verlässliches Ergebnis mit wenig Sichtungsaufwand, vermittelt dir eine Plattform mit automatischer Zuweisung wie Hyrde genau eine im Interview geprüfte Fachkraft statt einer Angebotsflut — und Freelancer behalten 100 Prozent, ohne Plattformprovision.",
      },
      {
        q: "Was ist der Unterschied zwischen Ausschreibung und Vermittlung?",
        a: "Bei der Ausschreibung postest du dein Projekt und sichtest die Angebote selbst. Bei der automatischen Vermittlung beschreibst du das Ergebnis, und die KI weist dir eine vorab im Interview geprüfte Fachkraft direkt zu — ohne Bewerbungen und ohne Bieten.",
      },
      {
        q: "Fällt für Freelancer eine Provision an?",
        a: "Auf Hyrde nicht. Freelancer behalten 100 Prozent ihres Honorars, es gibt weder Bewerbungs- noch Gebotsgebühren noch eine Plattformprovision, und die Auszahlung läuft über den von ihnen gewählten Weg.",
      },
      {
        q: "Wie werden die Fachkräfte geprüft?",
        a: "Jede Fachkraft besteht vor der ersten Vermittlung ein adaptives KI-Fachinterview in ihrer Kategorie: ein reales Szenario, eine Nachfrage zur eigenen Antwort, eine Arbeitsprobe und die Vertiefung eines ausgelieferten Projekts, bewertet von 0 bis 100 nach einem strengen Raster.",
      },
    ],
    cta: {
      heading: "Vermitteln lassen statt ausschreiben",
      body: "Beschreibe dein Ergebnis und erhalte genau eine im Interview geprüfte Fachkraft. Keine Angebote, keine Provision.",
      label: "Kostenlos starten",
      href: "/signup",
    },
    related: ["wordpress-entwickler-finden", "freelancer-stundensatz-deutschland"],
  },
};

export const DE_GUIDE_SLUGS = Object.keys(DE_GUIDES);
export function getDeGuide(slug: string): Guide | null {
  return DE_GUIDES[slug] ?? null;
}
export const DE_GUIDES_LIST: Guide[] = DE_GUIDE_SLUGS.map(s => DE_GUIDES[s]);
