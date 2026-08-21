import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "Festpreis je Auftrag. Kein Stundensatz, keine Vermittlungsgebühr. Der Preis steht fest, bevor die Arbeit beginnt; Zahlung erfolgt je Meilenstein bei Abnahme.",
};

const PRINCIPLES = [
  {
    h: "Festpreis, kein Stundensatz",
    b: "Jeder Auftrag hat einen festen Preis, vereinbart vor Beginn. Ein Stundensatz wäre ein Dienstvertrag — genau das vermeiden wir.",
  },
  {
    h: "Zahlung bei Abnahme",
    b: "Der Preis ist in Meilensteine gegliedert. Jeder Meilenstein wird bei Abnahme fällig, nicht nach verstrichener Zeit.",
  },
  {
    h: "Ein Preis, keine Zusätze",
    b: "Keine Vermittlungsgebühr, keine Bewerbungs- oder Plattformkosten. Der vereinbarte Festpreis ist der Preis.",
  },
];

export default function Page() {
  return (
    <>
      <PageHead
        marker="Preise"
        title="Ein Festpreis je Ergebnis."
        intro="Die Preisbildung folgt dem Vertrag: ein definiertes Ergebnis, ein fester Preis, Zahlung bei Abnahme. Der konkrete Preis entsteht aus Ihrer Leistungsbeschreibung."
      />
      <section className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.h} className="bg-wv-paper p-7">
              <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-wv-ink">{p.h}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">{p.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-[4px] border border-wv-line bg-white p-7">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">Angebot</p>
          <p className="mt-3 max-w-[60ch] text-[15px] leading-[1.6] text-wv-slate">
            Sie umreißen Ihr Ergebnis; wir antworten mit Leistungsbeschreibung, Abnahmekriterien und
            einem Festpreis je Meilenstein. Kein Preis wird genannt, bevor der Umfang steht.
          </p>
          <Link
            href="/kontakt"
            className="mt-6 inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue"
          >
            Festpreis anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
