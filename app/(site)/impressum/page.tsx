import type { Metadata } from "next";
import PageHead, { PendingLegalNotice } from "@/components/site/PageHead";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung nach § 5 DDG.",
  robots: { index: false },
};

// § 5 DDG mandatory-field skeleton. Placeholders in [brackets] — fill once the
// legal entity is chosen (CLAUDE.md §12.2) and the text is Fachanwalt-reviewed.
const FIELDS: [string, string][] = [
  ["Anbieter", "[Firmenname / Rechtsform]"],
  ["Anschrift", "[Straße, Hausnummer] · [PLZ Ort] · [Land]"],
  ["Vertreten durch", "[Geschäftsführung]"],
  ["Kontakt", "[E-Mail] · [Telefon]"],
  ["Registereintrag", "[Registergericht] · [Registernummer]"],
  ["Umsatzsteuer-ID", "[USt-IdNr. gem. § 27a UStG]"],
  ["Verantwortlich i. S. d. § 18 Abs. 2 MStV", "[Name, Anschrift]"],
];

export default function Page() {
  return (
    <>
      <PageHead marker="Rechtliches" title="Impressum" />
      <section className="mx-auto max-w-[820px] px-5 py-14 md:px-8 md:py-16">
        <PendingLegalNotice />
        <dl className="mt-10 divide-y divide-wv-line rounded-[4px] border border-wv-line bg-white">
          {FIELDS.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-6 py-4 sm:grid-cols-[220px_1fr] sm:gap-6">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-wv-ash">{k}</dt>
              <dd className="text-[14px] text-wv-slate">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
