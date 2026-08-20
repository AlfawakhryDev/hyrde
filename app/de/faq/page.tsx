import type { Metadata } from "next";
import Link from "next/link";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hyrde FAQ. Was es ist, wie es funktioniert, Preise" },
  description:
    "Antworten auf häufige Fragen zu Hyrde: was es ist, wie die KI-Vermittlung funktioniert, Preise, wie Freelancer geprüft werden und wie es sich von Upwork und Fiverr unterscheidet.",
  alternates: { canonical: "/de/faq", languages: altLanguages("/faq", "/de/faq") },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Was ist Hyrde?",
    a: "Hyrde ist eine KI-native Freelance-Plattform. Du beschreibst ein Ergebnis oder eine Aufgabe, und die KI vermittelt dir einen einzelnen, im Interview geprüften Spezialisten. Es gibt keine Ausschreibungen und keinen Angebots-Spam, und das Beauftragen ist im Early Access kostenlos.",
  },
  {
    q: "Wie funktioniert Hyrde?",
    a: "Du beschreibst in einem Satz, was du brauchst. Die KI zerlegt es in einen Meilenstein-Plan, kalkuliert jeden Schritt und vermittelt für jeden Meilenstein den besten geprüften Spezialisten. Eine KI prüft die Lieferung gegen deinen Auftrag, bevor du bezahlst.",
  },
  {
    q: "Was kostet Hyrde?",
    a: "Das Beauftragen ist im Early Access kostenlos. Bezahlte Kundentarife sind Pro für 20 USD pro Monat (50 Aufträge) und Scale für 200 USD pro Monat (unbegrenzt). Freelancer behalten 100 Prozent, ohne Gebühren fürs Bewerben oder Bieten.",
  },
  {
    q: "Wie werden Freelancer bei Hyrde geprüft?",
    a: "Jeder Freelancer besteht vor der Vermittlung ein adaptives KI-Fachinterview in seiner Kategorie. Es dauert etwa 10 Minuten: ein reales Szenario, eine Nachfrage zur eigenen Antwort, eine kleine Arbeitsprobe und eine Vertiefung zu einem echten Projekt, bewertet von 0 bis 100 nach einem strengen Raster.",
  },
  {
    q: "Ist Hyrde seriös und sicher?",
    a: "Ja. Freelancer werden im Interview geprüft statt per Selbstauskunft, eine KI prüft die Arbeit gegen deinen Auftrag, bevor du zahlst, und ein noch nicht vermitteltes oder laufendes Projekt kannst du jederzeit abbrechen. Gelieferte und bezahlte Arbeit ist geschützt.",
  },
  {
    q: "Wie unterscheidet sich Hyrde von Upwork oder Fiverr?",
    a: "Bei Hyrde gibt es kein Bieten und keine Angebote zum Durchsehen. Die KI vermittelt einen geprüften Spezialisten, statt dich mit Bewerbern zu überschwemmen, und Freelancer behalten 100 Prozent, weil es keine Bewerbungs- oder Bietgebühren und keine Plattformprovision gibt.",
  },
  {
    q: "Was bedeutet ein Ergebnis beauftragen?",
    a: "Statt einen Freelancer für eine einzelne Aufgabe zu beauftragen, beschreibst du das ganze Ergebnis, etwa ein MVP oder einen überarbeiteten Shopify-Shop. Hyrde zerlegt es in Meilensteine und vermittelt für jeden Schritt einen Spezialisten, sodass du einen Plan managest statt einen Stapel Freelancer.",
  },
  {
    q: "Kann ich vorab die Projektkosten schätzen?",
    a: "Ja. Der kostenlose Kostenrechner von Hyrde liefert für jedes Projekt eine Meilenstein-Aufschlüsselung mit realistischen Preisspannen und einem Zeitrahmen, ganz ohne Anmeldung.",
  },
];

export default function GermanFaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "de",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div lang="de" className="mx-auto max-w-[760px] px-5 md:px-8 pt-[124px] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">Häufige Fragen</p>
      <h1 className="font-display font-light text-on-surface leading-[1.05] tracking-[-0.015em] text-[clamp(32px,5vw,50px)]">
        Hyrde, erklärt
      </h1>
      <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-[560px] mt-4 mb-10">
        Was Hyrde ist, wie es funktioniert, was es kostet und wie es sich unterscheidet. Kurze, direkte Antworten.
      </p>

      <div className="divide-y divide-border-crisp border-y border-border-crisp">
        {FAQS.map(f => (
          <div key={f.q} className="py-6">
            <h2 className="text-[17px] font-medium text-on-surface mb-2">{f.q}</h2>
            <p className="text-[15px] text-on-surface-variant leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link href="/signup" className="inline-flex items-center h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
          Jetzt starten
        </Link>
        <Link href="/de" className="inline-flex items-center h-11 px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:border-outline transition-colors">
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
