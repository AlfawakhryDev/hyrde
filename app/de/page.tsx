import type { Metadata } from "next";
import Link from "next/link";
import { altLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: { absolute: "Hyrde. Geprüfte Freelancer finden, per KI vermittelt" },
  description:
    "Beschreibe ein Ergebnis oder eine Aufgabe, und die KI vermittelt dir einen im Interview geprüften Spezialisten. Keine Ausschreibungen, kein Angebots-Spam. Freelancer behalten 100 Prozent. Kostenlos im Early Access.",
  alternates: { canonical: "/de", languages: altLanguages("/", "/de") },
  keywords: [
    "Freelancer finden", "geprüfte Freelancer", "Freelancer statt Agentur",
    "Entwickler finden", "Freelancer Deutschland", "Freelancer vermitteln lassen",
    "Upwork Alternative", "Fiverr Alternative", "MVP entwickeln lassen",
  ],
  openGraph: {
    title: "Hyrde. Geprüfte Freelancer finden, per KI vermittelt",
    description: "Beschreibe ein Ergebnis, bekomme einen geprüften Spezialisten vermittelt. Keine Ausschreibungen. Kostenlos im Early Access.",
    url: "https://hyrde.net/de",
    locale: "de_DE",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde" }],
  },
};

function Kicker({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-mono text-[11px] tracking-[0.12em] text-[#8A887E]">{n}</span>
      <span className="h-px w-7 bg-[#D8D4C8]" aria-hidden="true" />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8A887E]">{label}</span>
    </div>
  );
}

export default function GermanHome() {
  return (
    <div lang="de" className="min-h-screen bg-paper">
      {/* Hero */}
      <section className="relative -mt-[104px] min-h-[100svh] flex items-center overflow-hidden bg-[#100F0B]">
        <div className="relative w-full mx-auto max-w-[1180px] px-5 md:px-8 pt-[120px] pb-12">
          <div className="max-w-[760px]">
            <div className="flex items-center gap-2.5 text-white/90 mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">Geprüft, dann vermittelt</span>
            </div>
            <h1 className="font-display font-light text-[#F7F5F0] leading-[1.04] tracking-[-0.015em] text-[clamp(38px,5.2vw,66px)] max-w-[15ch]">
              Beauftrage keinen Freelancer. Beauftrage ein <em className="italic font-normal text-white">Ergebnis</em>.
            </h1>
            <p className="text-white/55 text-[15.5px] md:text-[16.5px] max-w-[560px] leading-[1.62] mt-8">
              Beschreibe, was du wirklich brauchst, etwa &bdquo;Ich brauche ein MVP&ldquo; oder &bdquo;meinen Shopify-Shop
              überarbeiten&ldquo;. Die KI zerlegt es in einen Meilenstein-Plan, vermittelt für jeden Schritt einen
              geprüften Spezialisten und steuert die Reihenfolge. Du managest den Plan, nicht einen Stapel Freelancer.
            </p>
            <div className="mt-8 border-t border-white/10 pt-6 max-w-[520px] flex flex-col gap-2.5">
              {[
                "Jeder Freelancer hat ein KI-Fachinterview bestanden",
                "Die KI vermittelt jede Aufgabe an genau einen geprüften Spezialisten",
                "Eine KI prüft die Lieferung, bevor du bezahlst",
              ].map((b, i) => (
                <div key={b} className="flex items-baseline gap-3.5 text-[13.5px] text-white/65 leading-snug">
                  <span className="font-mono text-[11px] text-white/30 shrink-0">0{i + 1}</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-9">
              <Link href="/signup" className="h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors">
                Ergebnis beschreiben
              </Link>
              <Link href="/de/faq" className="text-sm font-medium text-white/70 hover:text-white underline decoration-white/25 underline-offset-[5px] hover:decoration-white/60 transition-colors">
                Häufige Fragen
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* So funktioniert es */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 md:pt-32 pb-10">
        <Kicker n="01" label="So funktioniert es" />
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(30px,4.4vw,48px)] max-w-[18ch] mb-14">
          Von der Idee zur bezahlten Arbeit, in drei Schritten.
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "01", h: "Beschreibe die Arbeit", d: "Ein grober Satz reicht. Die KI stellt ein paar gezielte Fragen und macht daraus einen klaren Auftrag." },
            { n: "02", h: "Die KI vermittelt", d: "Sie bewertet jeden geprüften Spezialisten in der Kategorie und wählt den besten aus. Keine Ausschreibung, kein Angebots-Spam." },
            { n: "03", h: "Freigeben und direkt zahlen", d: "Eine KI prüft die Lieferung gegen deinen Auftrag. Dann zahlst du direkt. Der Freelancer behält 100 Prozent." },
          ].map(s => (
            <div key={s.n} className="rounded-[8px] border border-[#E7E4DB] bg-[#FBFAF6] p-6 min-h-[220px] flex flex-col">
              <p className="font-mono text-[12px] tracking-[0.1em] text-[#8A887E] mb-3">{s.n}</p>
              <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{s.h}</h3>
              <p className="text-[13.5px] text-[#5B5B66] leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Vertrauen */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-16 pb-24">
        <div className="rounded-[4px] border border-[#E3E0D8] bg-[#FBFAF6] px-8 md:px-16 py-16 md:py-20 max-w-[720px]">
          <Kicker n="02" label="Warum es vertrauenswürdig ist" />
          <h2 className="font-display font-light text-ink leading-[1.03] tracking-[-0.015em] text-[clamp(30px,4.4vw,50px)]">
            Ein anderes Verständnis von <em className="italic font-normal">geprüft</em>.
          </h2>
          <p className="text-[15px] text-[#57564F] leading-[1.62] mt-6 max-w-[440px]">
            Kein gekauftes Abzeichen und kein Portfolio, das man faken kann. Ein Interview, das man bestehen muss,
            in genau der Kategorie, die man angibt. Vier adaptive Fragen, bewertet von 0 bis 100 nach einem strengen Raster.
          </p>
          <Link href="/signup" className="mt-7 inline-flex items-center h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
            Jetzt starten
          </Link>
        </div>
      </section>
    </div>
  );
}
