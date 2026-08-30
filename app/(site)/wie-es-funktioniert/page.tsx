import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import JsonLd from "@/components/site/JsonLd";
import { breadcrumbLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Wie es funktioniert",
  description:
    "Vom definierten Ergebnis zur Abnahme: Leistungsbeschreibung und Abnahmekriterien, Festpreis-Werkvertrag mit Meilensteinen, Zahlung erst nach Abnahme.",
};

const STEPS = [
  {
    n: "§ 1",
    title: "Leistung definieren",
    body: "Sie umreißen das gewünschte Ergebnis. Gemeinsam schärfen wir es zu einer Leistungsbeschreibung mit ausdrücklichen Abnahmekriterien. Beides steht fest, bevor Arbeit beginnt — ohne beides eröffnen wir keinen Auftrag.",
  },
  {
    n: "§ 2",
    title: "Festpreis-Werkvertrag",
    body: "Sie erhalten einen Werkvertrag mit Meilensteinen. Jeder Meilenstein ist ein Ergebnis, kein Zeitraum. Der Preis steht fest. Sie beauftragen Hyrde; die Umsetzung erfolgt im Unterauftrag durch einen geprüften Spezialisten.",
  },
  {
    n: "§ 3",
    title: "Abnahme & Zahlung",
    body: "Sie prüfen jeden Meilenstein anhand der vereinbarten Kriterien und nehmen ihn ausdrücklich ab. Die Zahlung wird durch die Abnahme ausgelöst — nie durch Stunden oder verstrichene Zeit.",
  },
  {
    n: "§ 4",
    title: "Compliance-Dossier",
    body: "Über den gesamten Auftrag entsteht ein Nachweis der Werkvertrags-Charakteristik: Vertrag, Abnahmeprotokolle, eigene Arbeitsmittel, weitere Auftraggeber, Rechnungen von Hyrde. Als ein PDF exportierbar.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Wie es funktioniert", path: "/wie-es-funktioniert" }])} />
      <PageHead
        marker="Ablauf"
        title="Vom definierten Ergebnis zur Abnahme."
        intro="Ein Werkvertrag beschreibt ein Ergebnis, keine weisungsgebundene Tätigkeit. Der Ablauf ist entsprechend geordnet."
      />
      <section className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-16">
        <ol className="grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line sm:grid-cols-2">
          {STEPS.map((s) => (
            <li key={s.n} className="bg-wv-paper p-7">
              <p className="font-mono text-[12px] text-wv-blue">{s.n}</p>
              <h2 className="mt-3 text-[17px] font-semibold tracking-[-0.01em] text-wv-ink">{s.title}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <Link
            href="/kontakt"
            className="inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue"
          >
            Projekt beschreiben
          </Link>
        </div>
      </section>
    </>
  );
}
