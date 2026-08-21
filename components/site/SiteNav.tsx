import Link from "next/link";

// Marketing nav — German, minimal, technical-documentation register. Server
// component; no client JS. Links wrap on narrow screens (no hamburger yet).
const LINKS = [
  { href: "/wie-es-funktioniert", label: "Wie es funktioniert" },
  { href: "/rechtssicherheit", label: "Rechtssicherheit" },
  { href: "/preise", label: "Preise" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-wv-line bg-wv-paper/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-8 gap-y-3 px-5 py-4 md:px-8">
        <Link href="/" className="flex items-baseline gap-2.5 shrink-0">
          <span className="text-[19px] font-semibold tracking-[-0.02em] text-wv-ink">Hyrde</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-wv-ash">Werkleistung</span>
        </Link>

        <div className="order-3 w-full flex flex-wrap items-center gap-x-6 gap-y-1.5 md:order-2 md:ml-6 md:w-auto">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13.5px] text-wv-slate transition-colors hover:text-wv-ink"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          href="/kontakt"
          className="order-2 ml-auto inline-flex h-10 items-center rounded-[3px] bg-wv-ink px-5 text-[13.5px] font-medium text-wv-paper transition-colors hover:bg-wv-blue md:order-3"
        >
          Projekt beschreiben
        </Link>
      </nav>
    </header>
  );
}
