// ── Signature element (CLAUDE.md §10) ────────────────────────────────────────
// The engagement rendered as a living document: milestones are numbered clauses
// of a Werkvertrag, each with a result and an acceptance criterion, that fill in
// and get stamped "Abgenommen" as the work is signed off. Encodes the whole
// model at a glance — Werkvertrag, Leistungsbeschreibung, Abnahmekriterien,
// results-not-time, Festpreis, payment on Abnahme. Pure CSS motion.

type Status = "abgenommen" | "umsetzung" | "geplant";

const CLAUSES: { title: string; criterion: string; price: string; status: Status }[] = [
  {
    title: "Bestandsaufnahme & Zielarchitektur",
    criterion: "Architektur­dokument abgenommen, Migrationspfad definiert",
    price: "8.400 €",
    status: "abgenommen",
  },
  {
    title: "Migration Kernservices nach AWS",
    criterion: "Services in Produktion, Lasttests bestehen die Abnahmekriterien",
    price: "19.600 €",
    status: "umsetzung",
  },
  {
    title: "Daten-Pipeline & Monitoring",
    criterion: "Pipeline produktionsreif, Dashboards gegen Testdatensatz abgenommen",
    price: "12.000 €",
    status: "geplant",
  },
];

function StatusMark({ status }: { status: Status }) {
  if (status === "abgenommen") {
    return (
      <span
        className="inline-flex items-center rounded-[2px] border border-wv-ok/45 px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-wv-ok motion-safe:[animation:wv-stamp_.5s_cubic-bezier(.2,.8,.3,1.1)_.4s_both]"
        style={{ transformOrigin: "center", background: "color-mix(in srgb, var(--color-wv-ok) 8%, transparent)" }}
      >
        Abgenommen
      </span>
    );
  }
  if (status === "umsetzung") {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-wv-blue">In Umsetzung</span>
    );
  }
  return <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-wv-mist">Geplant</span>;
}

export default function WerkvertragCard() {
  return (
    <div className="rounded-[4px] border border-wv-line bg-white shadow-[0_1px_0_rgba(23,24,27,0.04),0_20px_50px_-30px_rgba(23,24,27,0.35)]">
      {/* Document header */}
      <div className="flex items-center justify-between border-b border-wv-line px-6 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-wv-ash">Werkvertrag</p>
          <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-wv-ink">Cloud-Migration & Data-Plattform</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] text-wv-slate">HYR-2026-0417</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-wv-ash">Festpreis</p>
        </div>
      </div>

      {/* Leistungsbeschreibung */}
      <div className="border-b border-wv-line px-6 py-3.5">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-wv-mist">Leistungsbeschreibung</p>
        <p className="mt-1 text-[13px] leading-relaxed text-wv-slate">
          Überführung der Kernanwendung in eine skalierbare AWS-Architektur inklusive produktionsreifer
          Daten-Pipeline — abgenommen anhand definierter Kriterien je Meilenstein.
        </p>
      </div>

      {/* Clauses = milestones */}
      <ol className="divide-y divide-wv-line">
        {CLAUSES.map((c, i) => (
          <li key={c.title} className="flex gap-4 px-6 py-4">
            <span className="mt-0.5 shrink-0 font-mono text-[12px] text-wv-mist">§&nbsp;{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[13.5px] font-medium leading-snug text-wv-ink">{c.title}</p>
                <span className="shrink-0 font-mono text-[12.5px] text-wv-slate">{c.price}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-wv-mist">Abnahme</span>
                <span className="text-[11.5px] leading-snug text-wv-ash">{c.criterion}</span>
              </div>
              <div className="mt-2">
                <StatusMark status={c.status} />
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Footer: total + payment trigger */}
      <div className="flex items-center justify-between border-t border-wv-line bg-wv-panel px-6 py-3.5">
        <span className="text-[12px] text-wv-ash">Zahlung je Meilenstein bei Abnahme</span>
        <span className="font-mono text-[13px] font-medium text-wv-ink">Festpreis 40.000 €</span>
      </div>
    </div>
  );
}
