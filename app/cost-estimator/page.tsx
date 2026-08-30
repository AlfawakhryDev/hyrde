import type { Metadata } from "next";
import Link from "next/link";
import EstimatorClient from "./EstimatorClient";

export const metadata: Metadata = {
  title: { absolute: "Free Project Cost Estimator. What Will It Cost to Build? | Hyrde" },
  description:
    "Free AI project cost estimator. Describe an app, website, game, or design project and get a realistic milestone breakdown with cost ranges and a timeline, in seconds. No signup.",
  alternates: { canonical: "/cost-estimator" },
  keywords: [
    "project cost estimator", "app development cost calculator", "how much does it cost to build an app",
    "website cost calculator", "freelance project cost", "MVP cost estimate", "software development cost estimate",
  ],
  openGraph: {
    title: "Free Project Cost Estimator. What Will It Cost to Build?",
    description: "Describe your project and get a realistic milestone breakdown with cost ranges in seconds. Free, no signup.",
    url: "https://hyrde.net/cost-estimator",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde project cost estimator" }],
  },
};

const FAQS = [
  {
    q: "How much does it cost to build an app or MVP?",
    a: "A simple MVP from a good freelance specialist typically runs a few thousand to low five figures, depending on features, integrations, and how defined the scope is. Enter your idea above for a milestone breakdown with a real range instead of a single made-up number.",
  },
  {
    q: "How accurate is the estimate?",
    a: "It is a mid-market freelance estimate meant to set expectations, not a fixed quote. Vague briefs get wider ranges on purpose. The more specific you are about features, platform, and existing assets, the tighter the estimate.",
  },
  {
    q: "What drives the cost of a project?",
    a: "Scope clarity, existing assets versus starting from scratch, integrations with other tools, the platform or tech stack, who provides the content, and the deadline. Those are the same things a good specialist asks before quoting.",
  },
  {
    q: "Is the estimator free?",
    a: "Yes, and no signup is required. If you want the project actually built, you can post it on Hyrde and the AI matches each milestone to one interview-vetted specialist. Hiring is free during early access.",
  },
];

export default function CostEstimatorPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Hyrde Project Cost Estimator",
    url: "https://hyrde.net/cost-estimator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free AI estimator that breaks a project into milestones with cost ranges and a timeline.",
  };

  return (
    <div className="mx-auto max-w-[820px] px-5 md:px-8 pt-[124px] pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />

      <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">Free tool, no signup</p>
      <h1 className="font-display font-light text-on-surface leading-[1.05] tracking-[-0.015em] text-[clamp(34px,5.5vw,54px)] max-w-[16ch]">
        What will it cost to build?
      </h1>
      <p className="text-[16px] text-on-surface-variant leading-relaxed max-w-[560px] mt-5 mb-8">
        Describe an app, website, game, or design project and get a realistic milestone breakdown
        with cost ranges and a timeline, in seconds. No made-up single number, and no signup.
      </p>

      <EstimatorClient />

      {/* SEO body */}
      <div className="mt-16 max-w-[640px]">
        <h2 className="font-display font-light text-on-surface text-[clamp(24px,3.6vw,34px)] tracking-[-0.015em] mb-4">
          How project pricing actually works
        </h2>
        <p className="text-[15px] text-on-surface-variant leading-relaxed mb-4">
          Most cost calculators give you one confident number that falls apart the moment scope
          meets reality. A good specialist does the opposite: they ask what moves the price, then
          give you a range. This tool does the same. It breaks your project into milestones you can
          actually sequence, prices each one, and tells you what it assumed, because those
          assumptions are exactly where budgets slip.
        </p>
        <p className="text-[15px] text-on-surface-variant leading-relaxed">
          The biggest drivers are almost always the same: how defined the scope is, whether you have
          existing brand and assets or are starting from scratch, how many other systems it has to
          connect to, and whether there is a hard deadline. Pin those down and the range gets tight.
        </p>

        <h2 className="font-display font-light text-on-surface text-[clamp(24px,3.6vw,34px)] tracking-[-0.015em] mt-12 mb-5">
          Questions people ask
        </h2>
        <div className="divide-y divide-border-crisp border-y border-border-crisp">
          {FAQS.map(f => (
            <div key={f.q} className="py-5">
              <h3 className="text-[15px] font-medium text-on-surface mb-1.5">{f.q}</h3>
              <p className="text-[14px] text-on-surface-variant leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-surface-container p-7 text-center">
          <p className="font-display text-[22px] text-on-surface tracking-[-0.01em] mb-2">Ready to get it built?</p>
          <p className="text-[14px] text-on-surface-variant max-w-[440px] mx-auto mb-5">
            Post your project on Hyrde and the AI matches each milestone to one interview-vetted specialist.
            No bidding, no proposal spam. Free during early access.
          </p>
          <Link href="/signup" className="inline-flex items-center h-11 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition">
            Start on Hyrde
          </Link>
        </div>
      </div>
    </div>
  );
}
