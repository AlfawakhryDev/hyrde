import Link from "next/link";
import { ClipboardList, FileSignature, Stamp } from "lucide-react";
import AlternativesTable from "@/components/site/AlternativesTable";
import WerkvertragCard from "@/components/site/WerkvertragCard";
import { VERTICAL } from "@/lib/vertical";

// Numbered section marker — numbering is earned here (CLAUDE.md §10).
function Marker({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] text-wv-blue">{n}</span>
      <span className="h-px w-7 bg-wv-line" aria-hidden="true" />
      <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-wv-ash">{label}</span>
    </div>
  );
}

const STEPS = [
  {
    icon: ClipboardList,
    title: "Leistung definieren",
    body: "Gemeinsam legen wir Leistungsbeschreibung und Abnahmekriterien fest. Kein Auftrag startet ohne beides.",
  },
  {
    icon: FileSignature,
    title: "Festpreis-Werkvertrag",
    body: "Sie erhalten einen Werkvertrag mit Meilensteinen als Ergebnissen — nicht als Zeiträumen. Der Preis steht fest, bevor die Arbeit beginnt.",
  },
  {
    icon: Stamp,
    title: "Abnahme & Zahlung",
    body: "Sie nehmen jeden Meilenstein anhand der Kriterien ab. Erst dann wird gezahlt — nie nach Stunden.",
  },
];

const DOSSIER = [
  "Unterzeichneter Werkvertrag mit Leistungsbeschreibung und Abnahmekriterien",
  "Nachweis, dass der Spezialist eigene Arbeitsmittel und Infrastruktur nutzt",
  "Nachweis weiterer, paralleler Auftraggeber des Spezialisten",
  "Abnahmeprotokolle mit Zeitstempel und ausdrücklicher Freigabe",
  "Rechnungen, ausgestellt von Hyrde — nicht von der Einzelperson",
];

export default function Home() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <Marker n="HYR" label="Werkvertrag · Festpreis · DACH" />
              <h1 className="mt-7 text-[clamp(32px,4.6vw,52px)] font-semibold leading-[1.07] tracking-[-0.02em] text-wv-ink">
                Definierte Ergebnisse. Zum Festpreis.
                <br className="hidden sm:block" /> Ohne Scheinselbstständigkeitsrisiko.
              </h1>
              <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.6] text-wv-slate">
                Sie beschreiben ein Ergebnis. Wir liefern es als Werk — zum Festpreis, mit klaren
                Abnahmekriterien, umgesetzt von geprüften Spezialisten. Sie beauftragen Hyrde, nicht
                eine Einzelperson.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/kontakt"
                  className="inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue"
                >
                  Projekt beschreiben
                </Link>
                <Link
                  href="/wie-es-funktioniert"
                  className="text-[14px] font-medium text-wv-slate underline decoration-wv-line underline-offset-[5px] transition-colors hover:text-wv-ink hover:decoration-wv-blue"
                >
                  Wie es funktioniert
                </Link>
              </div>
            </div>

            <div className="lg:pl-4">
              <WerkvertragCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── The risk ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-20">
          <Marker n="01" label="Das Risiko" />
          <div className="mt-7 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <h2 className="text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-wv-ink">
                Weisungsgebundene Zusammenarbeit ist teuer geworden.
              </h2>
              <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.62] text-wv-slate">
                Werden Externe wie eigene Beschäftigte eingesetzt — weisungsgebunden, in die
                Betriebsabläufe integriert — gilt das schnell als Scheinselbstständigkeit. Die Folge
                sind Nachzahlungen von Sozialabgaben, rückwirkend über mehrere Jahre.
              </p>
              <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.62] text-wv-slate">
                Ein Werkvertrag verlagert den Vertragsgegenstand vom Arbeiten nach Weisung auf ein
                definiertes Ergebnis. Genau darauf ist Hyrde gebaut.
              </p>
            </div>

            {/* The one place amber is used: a compliance warning. */}
            <aside className="self-start rounded-[3px] border border-wv-signal/35 bg-wv-signal-tint p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-wv-signal">Prüfungsrisiko</p>
              <p className="mt-3 text-[15px] font-medium leading-snug text-wv-ink">
                Bis zu vier Jahre rückwirkende Nachforderung von Sozialabgaben — je betroffener Person.
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-wv-slate">
                Zuzüglich Säumniszuschlägen und möglicher persönlicher Haftung der Geschäftsführung.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ── The alternatives ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-20">
          <Marker n="02" label="Die Alternativen" />
          <div className="mt-7 max-w-[62ch]">
            <h2 className="text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-wv-ink">
              Die Kapazität fehlt heute, nicht in sieben Monaten.
            </h2>
            <p className="mt-5 text-[15px] leading-[1.62] text-wv-slate">
              Eine IT-Stelle in Deutschland bleibt im Mittel 7,7 Monate unbesetzt. Bis dahin steht
              das Vorhaben. Die folgende Gegenüberstellung nennt die Unterschiede, ohne sie zu
              bewerten.
            </p>
          </div>
          <div className="mt-10">
            <AlternativesTable />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-20">
          <Marker n="03" label="Ablauf" />
          <h2 className="mt-7 max-w-[20ch] text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-wv-ink">
            Vom definierten Ergebnis zur Abnahme, in drei Schritten.
          </h2>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line sm:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="flex flex-col bg-wv-paper p-7">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-wv-mist">§&nbsp;{i + 1}</span>
                    <Icon size={18} strokeWidth={1.6} className="text-wv-blue" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-[16px] font-semibold tracking-[-0.01em] text-wv-ink">{s.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">{s.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── The proof: compliance dossier + relationship chain ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-20">
          <Marker n="04" label="Nachweis" />
          <div className="mt-7 grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="max-w-[18ch] text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-wv-ink">
                Jeder Auftrag erzeugt ein Compliance-Dossier.
              </h2>
              <p className="mt-5 max-w-[50ch] text-[15px] leading-[1.62] text-wv-slate">
                Während der Umsetzung sammelt das System den Nachweis, dass es sich um einen echten
                Werkvertrag handelt. Als ein PDF exportierbar — das, wonach Ihre Rechtsabteilung fragt.
              </p>
              <ul className="mt-7 space-y-3">
                {DOSSIER.map((d, i) => (
                  <li key={d} className="flex gap-3">
                    <span className="mt-0.5 shrink-0 font-mono text-[11px] text-wv-mist">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[13.5px] leading-snug text-wv-slate">{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="self-start rounded-[4px] border border-wv-line bg-white p-7">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">Vertragskette</p>
              <div className="mt-5 space-y-3">
                {[
                  { k: "Sie", v: "Auftraggeber (DACH)" },
                  { k: "Hyrde", v: "Auftragnehmer / Werkunternehmer" },
                  { k: "Spezialist", v: "Umsetzung im Unterauftrag" },
                ].map((row, i) => (
                  <div key={row.k}>
                    <div className="flex items-baseline justify-between gap-3 rounded-[3px] border border-wv-line bg-wv-panel px-4 py-3">
                      <span className="text-[14px] font-semibold text-wv-ink">{row.k}</span>
                      <span className="text-[12.5px] text-wv-ash">{row.v}</span>
                    </div>
                    {i < 2 && <div className="mx-auto h-4 w-px bg-wv-line" aria-hidden="true" />}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[13px] leading-relaxed text-wv-slate">
                Sie und der Spezialist schließen nie einen Vertrag direkt. Zwischen Ihnen steht ein
                Unternehmen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vertical focus ── */}
      <section className="border-b border-wv-line">
        <div className="mx-auto max-w-[1120px] px-5 py-16 md:px-8 md:py-20">
          <Marker n="05" label="Fokus" />
          <h2 className="mt-7 max-w-[22ch] text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] text-wv-ink">
            Ein Fokus: {VERTICAL.labelDe}.
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {VERTICAL.categories.map((c) => (
              <span
                key={c.id}
                className="rounded-[3px] border border-wv-line bg-wv-panel px-3 py-1.5 text-[12.5px] font-medium text-wv-slate"
              >
                {c.de}
              </span>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {VERTICAL.examplesDe.map((ex) => (
              <li key={ex} className="flex gap-3 rounded-[3px] border border-wv-line bg-wv-paper px-4 py-3.5">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-wv-blue">→</span>
                <span className="text-[13.5px] leading-snug text-wv-slate">{ex}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section>
        <div className="mx-auto max-w-[1120px] px-5 py-20 text-center md:px-8">
          <h2 className="mx-auto max-w-[20ch] text-[clamp(26px,3.6vw,40px)] font-semibold leading-[1.1] tracking-[-0.02em] text-wv-ink">
            Beschreiben Sie Ihr Ergebnis.
          </h2>
          <p className="mx-auto mt-4 max-w-[46ch] text-[15px] leading-relaxed text-wv-slate">
            Ein kurzer Umriss genügt. Wir melden uns mit Leistungsbeschreibung, Abnahmekriterien und
            einem Festpreis.
          </p>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex h-11 items-center rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue"
          >
            Projekt beschreiben
          </Link>
        </div>
      </section>
    </>
  );
}
