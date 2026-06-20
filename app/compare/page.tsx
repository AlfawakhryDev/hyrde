import type { Metadata } from "next";
import Link from "next/link";
import { COMPETITORS, COMPETITOR_SLUGS } from "@/lib/compare";

export const metadata: Metadata = {
  title: "Compare Hyrde to Upwork, Fiverr & Toptal | Hyrde",
  description:
    "How Hyrde compares to Upwork, Fiverr, and Toptal for clients — fees, vetting, matching speed, and protection. Honest, side-by-side breakdowns.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Hyrde to Upwork, Fiverr & Toptal",
    description: "Honest, side-by-side breakdowns of how Hyrde compares to the major freelance platforms.",
    url: "/compare",
  },
};

export default function CompareHubPage() {
  const competitors = COMPETITOR_SLUGS.map(s => COMPETITORS[s]);

  return (
    <div className="min-h-screen bg-surface-gray">
      <section className="bg-tech-blue-deep">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
          <span className="inline-block text-xs font-semibold font-body text-ai-glow uppercase tracking-widest mb-4">
            Compare
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-tight mb-4 max-w-3xl mx-auto">
            How Hyrde compares to the platforms you already know
          </h1>
          <p className="font-body text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            Honest, side-by-side breakdowns — fees, vetting, matching speed, and the protections that actually matter when you&apos;re spending real money.
          </p>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-3 gap-5">
          {competitors.map(c => (
            <Link key={c.slug} href={`/${c.slug}-alternative`}
              className="group flex flex-col bg-white rounded-2xl border border-border-crisp p-6 hover:border-electric-violet/50 hover:shadow-lg transition-all">
              <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">
                Hyrde vs {c.name}
              </span>
              <h2 className="text-lg font-bold font-headline text-on-surface leading-snug mb-2 group-hover:text-electric-violet transition-colors">
                The {c.name} alternative
              </h2>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
                {c.metaDescription}
              </p>
              <span className="text-sm font-semibold font-body text-electric-violet inline-flex items-center gap-1.5">
                See the comparison
                <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform" style={{ fontSize: "16px" }}>arrow_forward</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-tech-blue-deep rounded-2xl p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold font-headline text-white mb-2">
            Vetted talent, 60-second matches, flat 8% fee
          </h2>
          <p className="font-body text-white/75 text-sm max-w-lg mx-auto mb-6">
            Skip the comparison paralysis. Post a brief and see why clients switch to Hyrde.
          </p>
          <Link href="/get-started"
            className="inline-block bg-white text-on-surface font-semibold font-body px-7 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Start hiring on Hyrde
          </Link>
        </div>
      </section>
    </div>
  );
}
