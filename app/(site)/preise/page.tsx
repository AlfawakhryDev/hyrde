import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/site/PageHead";
import {
  COMMITMENTS_DE,
  ENGAGEMENT_TIERS,
  PAYMENT_TERMS_DE,
  PRICE_EXCLUSIONS_DE,
  formatMoney,
} from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Preise",
  description:
    "Festpreis je definiertem Ergebnis. Zahlung bei Abnahme, nicht nach verstrichener Zeit. Pilotauftrag ab 18.000 €, Projektauftrag ab 45.000 €, Rahmenvertrag ab 24.000 € monatlich.",
};

export default function Page() {
  return (
    <>
      <PageHead
        marker="Preise"
        title="Ein Festpreis je Ergebnis."
        intro="Der Preis steht fest, bevor die Arbeit beginnt. Er ist in Meilensteine gegliedert, und jeder Meilenstein wird bei Abnahme fällig. Die folgenden Beträge sind Untergrenzen; der konkrete Preis ergibt sich aus Ihrer Leistungsbeschreibung."
      />

      {/* ── Tiers ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-5 pb-4 md:px-8">
        <div className="grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line lg:grid-cols-3">
          {ENGAGEMENT_TIERS.map((tier) => (
            <article key={tier.id} className="flex flex-col bg-wv-paper p-7">
              <div className="flex items-baseline gap-2.5">
                <span className="font-mono text-[11px] tabular-nums text-wv-mist">
                  {String(tier.index).padStart(2, "0")}
                </span>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-wv-ink">
                  {tier.nameDe}
                </h2>
              </div>

              <p className="mt-3 min-h-[3.5rem] text-[13.5px] leading-relaxed text-wv-slate">
                {tier.summaryDe}
              </p>

              <div className="mt-5 border-t border-wv-line pt-5">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-wv-ash">
                    ab
                  </span>
                  <span className="font-mono text-[26px] font-medium tabular-nums tracking-[-0.02em] text-wv-ink">
                    {formatMoney(tier.from)}
                  </span>
                  {tier.billing === "per-month" && (
                    <span className="text-[13px] text-wv-ash">/ Monat</span>
                  )}
                </div>
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-wv-ash">
                  {tier.durationDe}
                </p>
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {tier.includesDe.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-wv-slate">
                    <span aria-hidden="true" className="mt-[7px] h-px w-2.5 shrink-0 bg-wv-mist" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-wv-line pt-4 text-[12.5px] leading-relaxed text-wv-ash">
                {tier.fitDe}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Commitments ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-16">
        <h2 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">
          Was zugesagt ist
        </h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line sm:grid-cols-3">
          {COMMITMENTS_DE.map((c) => (
            <div key={c.termDe} className="bg-wv-paper p-7">
              <dt className="text-[15px] font-semibold tracking-[-0.01em] text-wv-ink">
                {c.termDe}
              </dt>
              <dd className="mt-2 text-[13px] leading-relaxed text-wv-slate">{c.bodyDe}</dd>
            </div>
          ))}
        </dl>

        {/* ── Terms + exclusions ─────────────────────────────────────────── */}
        <div className="mt-10 grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line md:grid-cols-2">
          <div className="bg-wv-paper p-7">
            <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">
              Zahlungsbedingungen
            </h3>
            <ul className="mt-4 space-y-2.5 text-[13.5px] leading-relaxed text-wv-slate">
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-wv-mist" />
                <span>
                  <span className="font-mono tabular-nums text-wv-ink">
                    {PAYMENT_TERMS_DE.depositPercent} %
                  </span>{" "}
                  Anzahlung bei Vertragsschluss, der Rest je Meilenstein bei Abnahme.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-wv-mist" />
                <span>
                  Zahlungsziel{" "}
                  <span className="font-mono tabular-nums text-wv-ink">
                    {PAYMENT_TERMS_DE.netDays} Tage
                  </span>{" "}
                  netto ab Rechnungsdatum.
                </span>
              </li>
              <li className="flex gap-2.5">
                <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-wv-mist" />
                <span>Rechnungsstellung durch Hyrde, in Euro, mit ausgewiesener Umsatzsteuer.</span>
              </li>
            </ul>
          </div>

          <div className="bg-wv-paper p-7">
            <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">
              Nicht im Preis enthalten
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PRICE_EXCLUSIONS_DE.map((x) => (
                <li key={x} className="flex gap-2.5 text-[13.5px] leading-relaxed text-wv-slate">
                  <span aria-hidden="true" className="mt-[9px] h-px w-2.5 shrink-0 bg-wv-mist" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── How a price is reached ─────────────────────────────────────── */}
        <div className="mt-10 rounded-[4px] border border-wv-line bg-white p-7 md:p-9">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">
            Wie der Preis entsteht
          </p>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-[1.65] text-wv-slate">
            Sie beschreiben das gewünschte Ergebnis. Wir antworten mit einer Leistungsbeschreibung,
            Abnahmekriterien je Meilenstein und einem Festpreis. Erst wenn der Umfang schriftlich
            steht, wird ein Preis genannt — und dieser ändert sich nur, wenn Sie die
            Leistungsbeschreibung ändern.
          </p>
          <Link
            href="/kontakt"
            className="mt-6 inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wv-blue"
          >
            Festpreis anfragen
          </Link>
        </div>
      </section>
    </>
  );
}
