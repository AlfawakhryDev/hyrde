import Link from "next/link";

// Impressum + Datenschutzerklärung are legally mandatory and must be reachable
// from every page (TMG/DDG, CLAUDE.md §4). Do not remove those links.
const COLS: { head: string; links: { href: string; label: string }[] }[] = [
  {
    head: "Leistung",
    links: [
      { href: "/wie-es-funktioniert", label: "Wie es funktioniert" },
      { href: "/rechtssicherheit", label: "Rechtssicherheit" },
      { href: "/preise", label: "Preise" },
    ],
  },
  {
    head: "Unternehmen",
    links: [
      { href: "/kontakt", label: "Kontakt" },
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-wv-line bg-wv-panel">
      <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8">
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-wv-ink">Hyrde</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-wv-ash">Werkleistung</span>
            </div>
            <p className="mt-3 max-w-[34ch] text-[13px] leading-relaxed text-wv-ash">
              Definierte Software- und Engineering-Ergebnisse zum Festpreis, per Werkvertrag mit
              klaren Abnahmekriterien.
            </p>
          </div>

          {COLS.map((c) => (
            <div key={c.head}>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">{c.head}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-[13.5px] text-wv-slate transition-colors hover:text-wv-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-wv-line pt-6">
          <p className="text-[12px] text-wv-mist">© {new Date().getFullYear()} Hyrde</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-wv-mist">DACH · Werkvertrag · Festpreis</p>
        </div>
      </div>
    </footer>
  );
}
