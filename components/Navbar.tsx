"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLink { href: string; label: string; special?: boolean; badge?: string }

const NAV_LINKS: NavLink[] = [
  { href: "/agent",      label: "AI Agent", special: true              },
  { href: "/sparks",     label: "Sparks",   badge: "New"               },
  { href: "/hire",       label: "Talent"                               },
  { href: "/jobs",       label: "Jobs"                                 },
  { href: "/pricing",    label: "Pricing"                              },
  { href: "/enterprise", label: "Enterprise"                           },
  { href: "/about",      label: "Why Hyrde"                           },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-gray/90 backdrop-blur-md border-b border-border-crisp">
      <div className="flex justify-between items-center px-6 md:px-12 h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={() => setOpen(false)} aria-label="Hyrde home">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-[11px] ai-match-gradient shadow-[0_4px_14px_rgba(91,79,207,0.35)] group-hover:shadow-[0_6px_20px_rgba(91,79,207,0.5)] transition-shadow">
            <svg width="20" height="20" viewBox="0 0 512 512" aria-hidden="true">
              <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
              </g>
              <circle cx="256" cy="256" r="32" fill="#fff" />
            </svg>
          </span>
          <span className="text-[22px] font-bold font-headline tracking-tight text-tech-blue-deep leading-none">
            Hyrde
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-5 items-center">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-xs font-semibold font-body uppercase tracking-widest transition-colors flex items-center gap-1 ${
                isActive(link.href)
                  ? "text-electric-violet"
                  : link.special
                  ? "text-electric-violet/70 hover:text-electric-violet"
                  : "text-on-surface-variant hover:text-electric-violet"
              }`}
            >
              {link.special && (
                <span className="material-symbols-outlined" style={{ fontSize: "12px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              )}
              {link.label}
              {link.badge && (
                <span className="absolute -top-2 -right-5 text-[8px] font-bold bg-electric-violet text-white px-1.5 py-0.5 rounded-full leading-none">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/dashboard" className="text-xs font-semibold font-body text-on-surface-variant px-3 py-2 hover:text-electric-violet transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>dashboard</span>
            Dashboard
          </Link>
          <Link href="/freelancer/join" className="text-xs font-semibold font-body text-tech-blue-deep px-4 py-2 hover:opacity-70 transition-opacity">
            Join free
          </Link>
          <Link href="/get-started" className="bg-electric-violet text-white text-xs font-semibold font-body px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
            Hire talent
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(o => !o)}
          className="md:hidden w-10 h-10 flex items-center justify-center text-tech-blue-deep -mr-2"
          aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          <span className="material-symbols-outlined" style={{ fontSize: "26px" }}>{open ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <nav className="md:hidden border-t border-border-crisp bg-surface-gray/98 backdrop-blur-md px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
              className={`py-2.5 text-sm font-semibold font-body uppercase tracking-widest flex items-center gap-1.5 ${
                isActive(link.href) ? "text-electric-violet" : link.special ? "text-electric-violet/70" : "text-on-surface-variant"
              }`}>
              {link.special && <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>}
              {link.label}
              {link.badge && (
                <span className="text-[8px] font-bold bg-electric-violet text-white px-1.5 py-0.5 rounded-full leading-none ml-1">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="flex gap-3 pt-3 mt-2 border-t border-border-crisp">
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="flex-1 text-center text-xs font-semibold font-body text-tech-blue-deep border border-border-crisp px-4 py-2.5 rounded-full flex items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>dashboard</span>
              Dashboard
            </Link>
            <Link href="/get-started" onClick={() => setOpen(false)}
              className="flex-1 text-center bg-electric-violet text-white text-xs font-semibold font-body px-5 py-2.5 rounded-full">
              Hire talent
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
