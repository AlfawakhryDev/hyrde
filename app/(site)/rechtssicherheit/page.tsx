import type { Metadata } from "next";
import PageHead from "@/components/site/PageHead";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Rechtssicherheit",
  description:
    "Werkvertrag statt Dienstvertrag: Wie Hyrde den Vertragsgegenstand auf ein definiertes Ergebnis verlagert und je Auftrag ein Compliance-Dossier erzeugt.",
};

const POINTS = [
  {
    h: "Werk statt Weisung",
    b: "Vertragsgegenstand ist ein definiertes Ergebnis mit Abnahmekriterien (Werkvertrag) — nicht die weisungsgebundene Erbringung von Tätigkeiten (Dienstvertrag). Meilensteine sind Ergebnisse, keine Zeiträume.",
  },
  {
    h: "Ein Unternehmen dazwischen",
    b: "Sie schließen den Vertrag mit Hyrde. Hyrde beauftragt den Spezialisten im Unterauftrag. Sie und die Einzelperson kontrahieren nie direkt.",
  },
  {
    h: "Nachweisbare Indizien",
    b: "Eigene Arbeitsmittel des Spezialisten, parallele Auftraggeber, keine Eingliederung in Ihre Betriebsabläufe. Das System weist auf Anfragen hin, die die Werkvertrags-Charakteristik gefährden würden.",
  },
  {
    h: "Compliance-Dossier",
    b: "Je Auftrag exportierbar als ein PDF: Vertrag, Abnahmeprotokolle mit Zeitstempel, Rechnungen von Hyrde, Indizien-Nachweise. Das, wonach eine Rechtsabteilung fragt.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Rechtssicherheit", path: "/rechtssicherheit" }])} />
      <PageHead
        marker="Rechtssicherheit"
        title="Der Vertrag ist das Produkt."
        intro="Hyrde ist so gebaut, dass jeder Auftrag strukturell als echter Werkvertrag ausgestaltet ist und der Nachweis dafür passiv mitentsteht."
      />
      <section className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line sm:grid-cols-2">
          {POINTS.map((p) => (
            <div key={p.h} className="bg-wv-paper p-7">
              <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-wv-ink">{p.h}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">{p.b}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 max-w-[70ch] text-[12.5px] leading-relaxed text-wv-ash">
          Hinweis: Diese Seite ist keine Rechtsberatung. Die konkrete Ausgestaltung im Einzelfall
          sowie sämtliche Vertragsvorlagen werden durch einen Fachanwalt geprüft.
        </p>
      </section>
    </>
  );
}
