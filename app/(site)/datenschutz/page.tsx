import type { Metadata } from "next";
import PageHead, { PendingLegalNotice } from "@/components/site/PageHead";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
  robots: { index: false },
};

// DSGVO skeleton — section headings only. Authored, reviewed text replaces the
// placeholders. Not machine-translated (CLAUDE.md §6). Fill after the entity and
// processing map are fixed.
const SECTIONS: [string, string][] = [
  ["Verantwortlicher", "[Verantwortliche Stelle i. S. d. Art. 4 Nr. 7 DSGVO]"],
  ["Erhebung und Verwendung", "[Welche Daten zu welchem Zweck, Rechtsgrundlage nach Art. 6 DSGVO]"],
  ["Kontaktaufnahme", "[Verarbeitung von Angaben aus dem Anfrageformular]"],
  ["Hosting & Auftragsverarbeitung", "[Dienstleister, Serverstandort, Auftragsverarbeitungsverträge]"],
  ["Speicherdauer", "[Löschfristen je Datenkategorie]"],
  ["Ihre Rechte", "[Auskunft, Berichtigung, Löschung, Datenübertragbarkeit, Widerspruch, Beschwerde]"],
];

export default function Page() {
  return (
    <>
      <PageHead marker="Rechtliches" title="Datenschutzerklärung" />
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-8 md:py-16">
        <PendingLegalNotice />
        <div className="mt-10 space-y-8">
          {SECTIONS.map(([h, b], i) => (
            <div key={h}>
              <h2 className="text-[15px] font-semibold text-wv-ink">
                <span className="mr-2 font-mono text-[12px] text-wv-mist">{String(i + 1).padStart(2, "0")}</span>
                {h}
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">{b}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
