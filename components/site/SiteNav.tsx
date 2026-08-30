import Link from "next/link";

/**
 * Marketing nav. Server component — no client JS.
 *
 * The mobile menu is a <details> disclosure rather than a React state toggle.
 * It is four links; shipping a client component and a hydration cost for that
 * would be hard to justify, and the native element is keyboard-operable and
 * screen-reader-announced without any of the ARIA wiring a custom one needs.
 */
const LINKS = [
  { href: "/wie-es-funktioniert", label: "Wie es funktioniert" },
  { href: "/rechtssicherheit", label: "Rechtssicherheit" },
  { href: "/preise", label: "Preise" },
  { href: "/kontakt", label: "Kontakt" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex shrink-0 items-baseline gap-2.5">
      <span className="text-[19px] font-semibold tracking-[-0.02em] text-wv-ink">Hyrde</span>
      <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-wv-ash sm:inline">
        Werkleistung
      </span>
    </Link>
  );
}

const CTA_CLASS =
  "h-10 items-center rounded-[3px] bg-wv-ink px-5 text-[13.5px] font-medium text-wv-paper transition-colors hover:bg-wv-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wv-blue";

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-wv-line bg-wv-paper/92 backdrop-blur-sm">
      <nav
        aria-label="Hauptnavigation"
        className="mx-auto flex max-w-[1120px] items-center gap-6 px-5 py-4 md:px-8"
      >
        <Wordmark />

        {/* Desktop */}
        <ul className="ml-4 hidden flex-1 items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[13.5px] text-wv-slate transition-colors hover:text-wv-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wv-blue"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/kontakt" className={`${CTA_CLASS} ml-auto hidden md:inline-flex`}>
          Projekt beschreiben
        </Link>

        {/* Mobile: native disclosure, no JS */}
        <details className="group relative ml-auto md:hidden">
          <summary
            className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-[3px] border border-wv-line px-3 text-[13px] text-wv-slate [&::-webkit-details-marker]:hidden"
            aria-label="Menü öffnen"
          >
            <span
              aria-hidden="true"
              className="flex w-4 flex-col gap-[3px] transition-opacity group-open:opacity-70"
            >
              <span className="h-px w-full bg-wv-slate" />
              <span className="h-px w-full bg-wv-slate" />
              <span className="h-px w-full bg-wv-slate" />
            </span>
            Menü
          </summary>

          <div className="absolute right-0 top-[calc(100%+9px)] w-[min(78vw,17rem)] rounded-[4px] border border-wv-line bg-wv-paper p-2 shadow-[0_10px_30px_-12px_rgba(23,24,27,0.28)]">
            <ul>
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-[3px] px-3 py-2.5 text-[14px] text-wv-slate transition-colors hover:bg-wv-panel hover:text-wv-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/kontakt" className={`${CTA_CLASS} mt-2 inline-flex w-full justify-center`}>
              Projekt beschreiben
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
