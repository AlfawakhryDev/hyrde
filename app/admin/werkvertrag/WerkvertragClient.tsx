"use client";
import { useMemo, useState } from "react";
import { eur, formatMoney } from "@/lib/pricing";
import {
  validateEngagement,
  totalPrice,
  type EngagementInput,
  type MilestoneInput,
} from "@/lib/werkvertrag";
import { buildWerkvertrag } from "@/legal/templates/de/werkvertrag.v1";

// Internal Werkvertrag generator (§8 item 3). Ops fills scope + acceptance +
// milestones + price; the document renders live and prints to PDF via the
// browser (no server PDF dependency — phase 0 keeps a human in every loop).
// ponytail: window.print() over a PDF lib until a real client actually needs a
// server-rendered file; the template is unreviewed anyway.

type MRow = { title: string; acceptance: string; price: string; targetDate: string };

const emptyRow = (): MRow => ({ title: "", acceptance: "", price: "", targetDate: "" });

// §4: surface a warning when scope/acceptance wording implies the specialist
// would be integrated or directed — the tells that break a Werkvertrag.
const INTEGRATION_RISK = /\bstand-?up\b|täglich|jour ?fixe|vor ort|im büro|deren? laptop|weisung|berichtet? an|vollzeit|festange|9 ?bis ?5|teammitglied/i;

const field = "w-full rounded-[3px] border border-wv-line bg-white px-3 py-2 text-[14px] text-wv-ink outline-none transition-colors focus:border-wv-blue";
const label = "block font-mono text-[10px] uppercase tracking-[0.13em] text-wv-ash mb-1.5";

export default function WerkvertragClient() {
  const [client, setClient] = useState({ name: "", address: "", contact: "", vatId: "" });
  const [engagementTitle, setTitle] = useState("");
  const [leistungsbeschreibung, setScope] = useState("");
  const [gerichtsstand, setGerichtsstand] = useState("");
  const [rows, setRows] = useState<MRow[]>([emptyRow()]);

  const input: EngagementInput = useMemo(() => ({
    client: {
      name: client.name,
      address: client.address,
      contact: client.contact || undefined,
      vatId: client.vatId || undefined,
    },
    engagementTitle,
    leistungsbeschreibung,
    gerichtsstand: gerichtsstand || undefined,
    milestones: rows.map<MilestoneInput>((r) => ({
      title: r.title,
      acceptance: r.acceptance,
      price: eur(parseFloat(r.price) || 0),
      targetDate: r.targetDate || undefined,
    })),
  }), [client, engagementTitle, leistungsbeschreibung, gerichtsstand, rows]);

  const errors = validateEngagement(input);
  const ok = errors.length === 0;
  const doc = useMemo(() => (ok ? buildWerkvertrag(input) : null), [ok, input]);
  const total = totalPrice(input.milestones);

  const riskText = [leistungsbeschreibung, ...rows.map((r) => `${r.title} ${r.acceptance}`)].join(" ");
  const integrationRisk = INTEGRATION_RISK.test(riskText);

  const setRow = (i: number, patch: Partial<MRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div className="min-h-screen bg-wv-paper text-wv-ink">
      {/* Print rules: only the document card prints. */}
      <style>{`@media print { .wv-noprint { display: none !important; } .wv-doc { border: 0 !important; box-shadow: none !important; margin: 0 !important; } @page { margin: 18mm; } body { background: #fff; } }`}</style>

      <div className="mx-auto max-w-[1180px] px-5 py-10 md:px-8">
        <header className="wv-noprint mb-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">Intern · Ops</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em]">Werkvertrag-Generator</h1>
          <div className="mt-4 rounded-[3px] border border-wv-signal/40 bg-wv-signal-tint p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-signal">LEGAL_REVIEW_REQUIRED</p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">
              Diese Vorlage ist noch nicht anwaltlich geprüft. Jedes erzeugte Dokument trägt den Vermerk
              „ENTWURF · rechtlich ungeprüft“ und darf keinem Kunden zugesandt werden, bevor ein
              Fachanwalt die Vorlage freigegeben hat (§ 4).
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
          {/* ── Form ── */}
          <form className="wv-noprint flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="flex flex-col gap-3 border-0 p-0">
              <legend className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash mb-1">Auftraggeber</legend>
              <div><label className={label} htmlFor="cn">Firmenname *</label><input id="cn" className={field} value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /></div>
              <div><label className={label} htmlFor="ca">Anschrift *</label><textarea id="ca" rows={3} className={field} value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label} htmlFor="cc">Ansprechpartner</label><input id="cc" className={field} value={client.contact} onChange={(e) => setClient({ ...client, contact: e.target.value })} /></div>
                <div><label className={label} htmlFor="cv">USt-IdNr.</label><input id="cv" className={field} value={client.vatId} onChange={(e) => setClient({ ...client, vatId: e.target.value })} /></div>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3 border-0 p-0">
              <legend className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash mb-1">Auftrag</legend>
              <div><label className={label} htmlFor="et">Titel des Auftrags *</label><input id="et" className={field} value={engagementTitle} onChange={(e) => setTitle(e.target.value)} /></div>
              <div><label className={label} htmlFor="lb">Leistungsbeschreibung *</label><textarea id="lb" rows={4} className={field} value={leistungsbeschreibung} onChange={(e) => setScope(e.target.value)} placeholder="Das geschuldete Werk, so konkret wie möglich." /></div>
              <div><label className={label} htmlFor="gs">Gerichtsstand</label><input id="gs" className={field} value={gerichtsstand} onChange={(e) => setGerichtsstand(e.target.value)} placeholder="z. B. Berlin" /></div>
            </fieldset>

            <fieldset className="flex flex-col gap-4 border-0 p-0">
              <legend className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash mb-1">Meilensteine</legend>
              {rows.map((r, i) => (
                <div key={i} className="rounded-[3px] border border-wv-line bg-white p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] text-wv-mist">§ {i + 1}</span>
                    {rows.length > 1 && (
                      <button type="button" className="font-mono text-[11px] text-wv-signal hover:underline" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>entfernen</button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div><label className={label} htmlFor={`mt${i}`}>Ergebnis *</label><input id={`mt${i}`} className={field} value={r.title} onChange={(e) => setRow(i, { title: e.target.value })} placeholder="Was geliefert wird — kein Zeitraum." /></div>
                    <div><label className={label} htmlFor={`ma${i}`}>Abnahmekriterium *</label><textarea id={`ma${i}`} rows={2} className={field} value={r.acceptance} onChange={(e) => setRow(i, { acceptance: e.target.value })} placeholder="Woran die Abnahme gemessen wird." /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={label} htmlFor={`mp${i}`}>Festpreis (€) *</label><input id={`mp${i}`} className={field} inputMode="decimal" value={r.price} onChange={(e) => setRow(i, { price: e.target.value })} placeholder="18000" /></div>
                      <div><label className={label} htmlFor={`md${i}`}>Zieltermin</label><input id={`md${i}`} type="date" className={field} value={r.targetDate} onChange={(e) => setRow(i, { targetDate: e.target.value })} /></div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="self-start rounded-[3px] border border-wv-line px-3 py-1.5 text-[13px] font-medium text-wv-slate hover:border-wv-blue hover:text-wv-ink" onClick={() => setRows((rs) => [...rs, emptyRow()])}>+ Meilenstein</button>
              <p className="font-mono text-[12px] text-wv-ash">Summe: <span className="tabular-nums text-wv-ink">{formatMoney(total)}</span> zzgl. USt</p>
            </fieldset>

            {integrationRisk && (
              <div className="rounded-[3px] border border-wv-signal/40 bg-wv-signal-tint p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-signal">Prüfhinweis · Eingliederung</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-wv-slate">
                  Der Text enthält Formulierungen, die auf Weisung oder Eingliederung in den Betrieb des Auftraggebers hindeuten könnten (z. B. tägliche Termine, Vor-Ort-Pflicht, Berichtslinie). Das gefährdet die Werkvertrags-Einordnung — bitte umformulieren.
                </p>
              </div>
            )}

            {!ok && (
              <div className="rounded-[3px] border border-wv-line bg-wv-panel p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-ash">Noch nicht vollständig (§ 4)</p>
                <ul className="mt-2 space-y-1 text-[13px] text-wv-slate">
                  {errors.map((e) => <li key={e.field}>· {e.messageDe}</li>)}
                </ul>
              </div>
            )}

            <button
              type="button"
              disabled={!ok}
              onClick={() => window.print()}
              className="h-11 rounded-[3px] bg-wv-ink px-6 text-[14px] font-medium text-wv-paper transition-colors hover:bg-wv-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              Als PDF drucken
            </button>
          </form>

          {/* ── Live document preview (this is what prints) ── */}
          <div>
            {doc ? (
              <article className="wv-doc rounded-[3px] border border-wv-line bg-white p-8 md:p-12 shadow-[0_1px_2px_rgba(23,24,27,.04),0_18px_44px_-28px_rgba(23,24,27,.3)]">
                {doc.draft && (
                  <p className="mb-6 inline-block rounded-[2px] border border-wv-signal/50 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-wv-signal">
                    Entwurf · rechtlich ungeprüft
                  </p>
                )}
                <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{doc.title}</h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-ash">Auftraggeber</p>
                    {doc.auftraggeber.map((l, i) => <p key={i} className="text-[13.5px] leading-snug text-wv-ink">{l}</p>)}
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-ash">Auftragnehmer</p>
                    {doc.auftragnehmer.map((l, i) => <p key={i} className="text-[13.5px] leading-snug text-wv-ink">{l}</p>)}
                  </div>
                </div>

                <p className="mt-6 text-[13.5px] leading-[1.6] text-wv-slate">{doc.preamble}</p>

                <div className="mt-6 flex flex-col gap-5">
                  {doc.sections.map((s) => (
                    <section key={s.n}>
                      <h3 className="text-[14px] font-semibold text-wv-ink">§ {s.n} {s.heading}</h3>
                      <div className="mt-1.5 flex flex-col gap-2">
                        {s.blocks.map((b, i) =>
                          typeof b === "string" ? (
                            <p key={i} className="text-[13px] leading-[1.6] text-wv-slate whitespace-pre-line">{b}</p>
                          ) : (
                            <ul key={i} className="flex flex-col gap-1 border-l-2 border-wv-line pl-3">
                              {b.list.map((li, j) => <li key={j} className="text-[13px] leading-snug text-wv-slate">{li}</li>)}
                            </ul>
                          )
                        )}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="mt-10 grid gap-8 sm:grid-cols-2">
                  {doc.signatureLabels.map((l, i) => (
                    <div key={i}>
                      <div className="h-10 border-b border-wv-ink" />
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-wv-ash">{l}</p>
                    </div>
                  ))}
                </div>
              </article>
            ) : (
              <div className="wv-noprint grid h-full min-h-[280px] place-items-center rounded-[3px] border border-dashed border-wv-line bg-wv-panel p-8 text-center">
                <p className="max-w-[36ch] text-[13.5px] text-wv-ash">Der Vertragsentwurf erscheint hier, sobald Leistungsbeschreibung und je Meilenstein ein Abnahmekriterium vorliegen.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
