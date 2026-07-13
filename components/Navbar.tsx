"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/client";
import { HyrdeMark } from "./Logo";

const NAV_LINKS = [
  { href: "/vetting", label: "Find work" },
  { href: "/hire",    label: "Talent"  },
  { href: "/pricing", label: "Pricing" },
  { href: "/about",   label: "Company" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabaseBrowser().auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Announcement bar */}
      <Link
        href="/signup"
        className="flex items-center justify-center gap-2 h-8 bg-[#0A0A0B] text-white/90 text-[12px] font-medium hover:text-white transition-colors"
      >
        Early access is live — start hiring free, 3 tasks a month on us
        <span aria-hidden="true">→</span>
      </Link>

      {/* Floating pill nav */}
      <div className="flex justify-center px-4 pt-3">
        <nav className="flex items-center gap-1 h-12 pl-4 pr-2 rounded-full bg-surface-bright/85 backdrop-blur-xl border border-border-crisp shadow-[0_4px_24px_rgba(10,10,15,0.08)]">
          <Link href="/" onClick={() => setOpen(false)} aria-label="Hyrde home"
            className="flex items-center gap-1.5 text-on-surface pr-2">
            <HyrdeMark size={15} />
            <span className="text-[16px] font-semibold tracking-[-0.02em] leading-none select-none">hyrde</span>
          </Link>

          <div className="hidden md:flex items-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-on-surface bg-surface-container"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <span className="hidden md:block w-px h-4 bg-border-crisp mx-1.5" aria-hidden="true" />

          {user ? (
            <div className="hidden md:flex items-center gap-1.5">
              <Link href="/dashboard"
                className="h-8 flex items-center px-3.5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 transition-opacity">
                Dashboard
              </Link>
              <Link href="/profile" title="Profile" aria-label="Profile"
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  isActive("/profile") ? "text-on-surface bg-surface-container" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}>
                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>person</span>
              </Link>
              <button onClick={signOut} title="Sign out" aria-label="Sign out"
                className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5">
              <Link href="/login"
                className="px-3 py-1.5 rounded-full text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Log in
              </Link>
              <Link href="/signup"
                className="h-8 flex items-center px-3.5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 transition-opacity">
                Sign up
              </Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(o => !o)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-on-surface"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              {open ? "close" : "menu"}
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden flex justify-center px-4 pt-2">
          <div className="w-full max-w-sm rounded-2xl bg-surface-bright/95 backdrop-blur-xl border border-border-crisp shadow-[0_8px_32px_rgba(10,10,15,0.12)] p-3">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-[15px] font-medium ${
                  isActive(link.href) ? "text-on-surface bg-surface-container" : "text-on-surface-variant"
                }`}>
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2 mt-1 border-t border-border-crisp">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/profile" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-full border border-border-crisp text-sm font-medium text-on-surface">
                    Profile
                  </Link>
                  <button onClick={signOut}
                    className="flex-1 h-10 flex items-center justify-center rounded-full border border-border-crisp text-sm font-medium text-on-surface">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-full border border-border-crisp text-sm font-medium text-on-surface">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}
                    className="flex-1 h-10 flex items-center justify-center rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
