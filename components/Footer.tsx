import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-6 md:px-12 bg-tech-blue-deep border-t border-white/5">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-8">
        <Image src="/hyrde-lockup-dark.svg" alt="Hyrde" width={108} height={30} />

        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3">
          {[
            { href: "/about",           label: "Why Hyrde"     },
            { href: "/hire",            label: "Hire Talent"   },
            { href: "/jobs",            label: "Browse Jobs"   },
            { href: "/talent",          label: "Browse Talent" },
            { href: "/pricing",         label: "Pricing"       },
            { href: "/enterprise",      label: "Enterprise"    },
            { href: "/rates",           label: "Rate Index"    },
            { href: "/freelancer/join", label: "Join Free"     },
            { href: "/post-job",        label: "Post a Job"    },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-semibold font-body text-on-primary-container/60 hover:text-ai-glow transition-colors uppercase tracking-widest"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="h-px w-full max-w-4xl bg-white/10" />

        <a
          href="mailto:abdelrahman@hyrde.net"
          className="inline-flex items-center gap-1.5 text-xs font-semibold font-body text-on-primary-container/60 hover:text-ai-glow transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>mail</span>
          abdelrahman@hyrde.net
        </a>

        <p className="text-xs font-body text-on-primary-container/40">
          © 2025 Hyrde. AI-native freelancing.
        </p>
      </div>
    </footer>
  );
}
