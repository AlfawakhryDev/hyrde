import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES_LIST } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides — Hiring & Freelancing, the honest version | Hyrde",
  description:
    "Practical, no-fluff guides for clients hiring freelancers and freelancers finding clients in 2026 — rates, scams, platform comparisons, and pricing.",
  alternates: { canonical: "/guides" },
  openGraph: {
    title: "Hyrde Guides — Hiring & Freelancing, the honest version",
    description:
      "Practical, no-fluff guides for clients and freelancers in 2026.",
    url: "/guides",
  },
};

export default function GuidesIndexPage() {
  const clientGuides = GUIDES_LIST.filter(g => g.cluster === "client");
  const freelancerGuides = GUIDES_LIST.filter(g => g.cluster === "freelancer");

  const Card = ({ slug, title, excerpt, readMins, clusterLabel }: {
    slug: string; title: string; excerpt: string; readMins: number; clusterLabel: string;
  }) => (
    <Link href={`/guides/${slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-border-crisp p-6 hover:border-electric-violet/50 hover:shadow-lg transition-all">
      <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">
        {clusterLabel}
      </span>
      <h3 className="text-lg font-bold font-headline text-tech-blue-deep leading-snug mb-2 group-hover:text-electric-violet transition-colors">
        {title}
      </h3>
      <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4 flex-1">
        {excerpt}
      </p>
      <span className="text-xs font-body text-on-surface-variant inline-flex items-center gap-1.5">
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>schedule</span>
        {readMins} min read
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-surface-gray">
      <section className="bg-tech-blue-deep">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-16 text-center">
          <span className="inline-block text-xs font-semibold font-body text-ai-glow uppercase tracking-widest mb-4">
            Hyrde Guides
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-tight mb-4 max-w-3xl mx-auto">
            Hiring and freelancing, the honest version
          </h1>
          <p className="font-body text-white/70 text-base md:text-lg max-w-2xl mx-auto">
            No fluff, no affiliate spam. Practical guides on rates, scams, platform fees, and finding the right people — for clients and freelancers alike.
          </p>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        <div className="mb-14">
          <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-1">For clients hiring talent</h2>
          <p className="font-body text-on-surface-variant text-sm mb-6">Hire smarter, avoid the traps, and stop overpaying in fees.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {clientGuides.map(g => <Card key={g.slug} {...g} />)}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-1">For freelancers</h2>
          <p className="font-body text-on-surface-variant text-sm mb-6">Charge what you're worth and find clients without the bidding wars.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {freelancerGuides.map(g => <Card key={g.slug} {...g} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
