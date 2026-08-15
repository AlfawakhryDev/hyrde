import Link from "next/link";
import Logo from "./Logo";

const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { href: "/cost-estimator", label: "Free cost estimator" },
      { href: "/hire",    label: "Hire talent" },
      { href: "/jobs",    label: "Browse jobs" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    heading: "For freelancers",
    links: [
      { href: "/join",    label: "Join free" },
      { href: "/vetting", label: "Find work" },
      { href: "/talent",  label: "Browse talent" },
      { href: "/rates",   label: "Rate index" },
      { href: "/guides",  label: "Guides" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about",      label: "Why Hyrde" },
      { href: "/faq",        label: "FAQ" },
      { href: "/enterprise", label: "Enterprise" },
      { href: "/upwork-alternative", label: "Compare platforms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-crisp bg-surface-gray">
      <div className="mx-auto max-w-[1120px] px-5 md:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 text-[13px] leading-relaxed text-on-surface-variant max-w-[240px]">
              The AI-vetted freelance platform. Prove your skill once, then hire without the pile.
            </p>
            <a
              href="mailto:abdelrahman@hyrde.net"
              className="mt-4 inline-block text-[13px] text-on-surface-variant hover:text-on-surface transition-colors"
            >
              abdelrahman@hyrde.net
            </a>
          </div>

          {COLUMNS.map(col => (
            <nav key={col.heading} aria-label={col.heading}>
              <h3 className="text-[13px] font-medium text-on-surface mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border-crisp flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-on-surface-variant">© 2026 Hyrde</p>
          <p className="text-[13px] text-on-surface-variant">Made in Cairo</p>
        </div>
      </div>
    </footer>
  );
}
