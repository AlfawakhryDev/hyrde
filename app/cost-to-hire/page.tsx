import Link from "next/link";
import type { Metadata } from "next";
import { allCostPages } from "@/lib/cost-to-hire";
import Kicker from "@/components/Kicker";
import Reveal from "@/components/Reveal";
import MarkerUnderline from "@/components/MarkerUnderline";
import HeroBackdrop from "@/components/home/HeroBackdrop";

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export const metadata: Metadata = {
  title: "What it costs to hire a freelancer in 2026, by trade",
  description:
    "Real project prices for 16 freelance trades — developers, designers, data, marketing, writing and video — with the three jobs people actually buy from each, and what moves the number. Free to cite, free to estimate your own project.",
  alternates: { canonical: "https://hyrde.net/cost-to-hire" },
};

export default function CostToHireHub() {
  const pages = allCostPages();
  const cheapest = pages[0];
  const dearest = pages[pages.length - 1];
  const example = pages.find(p => p.slug === "shopify-developer") ?? pages[0];

  const ld = [
    {
      "@context": "https://schema.org", "@type": "ItemList",
      name: "What it costs to hire a freelancer in 2026, by trade",
      itemListElement: pages.map((p, i) => ({
        "@type": "ListItem", position: i + 1, name: `Hire a ${p.label}`,
        url: `https://hyrde.net/cost-to-hire/${p.slug}`,
      })),
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question", name: "What does it cost to hire a freelancer in 2026?",
          acceptedAnswer: {
            "@type": "Answer",
            text: `It depends far more on the job than on the job title. Across the sixteen trades priced here, a typical piece of work runs from ${money(cheapest.lowUsd)} at the small end to ${money(dearest.highUsd)} for a full build. A one-off fix is usually a few hundred dollars; a first version of a product runs to five figures. On Hyrde the work is priced per milestone before anyone starts, and the first three projects carry no platform fee.`,
          },
        },
        {
          "@type": "Question", name: "Is a freelancer cheaper than an agency?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Usually, and by a wide margin, because an agency prices the same work with account management, overhead and margin on top. What an agency sells you is someone managing the work. Hyrde automates the scoping and the quality check instead, and adds no commission to the specialist's price.",
          },
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 pt-20 pb-16 md:pt-28 md:pb-20">
          <Kicker n="2026">Pricing, by the job</Kicker>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-on-surface leading-[1.04] tracking-[-0.02em] max-w-3xl mb-6 animate-fadeup">
            What it costs to hire a <MarkerUnderline>freelancer</MarkerUnderline>
          </h1>
          <p className="font-body text-on-surface text-lg leading-relaxed max-w-2xl mb-3">
            Job titles do not have prices; jobs do. So this is priced by the work: the three
            things people actually buy from each trade, from {money(cheapest.lowUsd)} for a small
            fix to {money(dearest.highUsd)} for a full build.
          </p>
          <p className="font-body text-on-surface-variant text-base leading-relaxed max-w-2xl mb-8">
            Every number is what you would pay a vetted specialist here, agreed before work
            starts. Free to quote, and free to check against your own project.
          </p>
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Price my project — free, no signup
          </Link>
        </div>
      </section>

      {/* ── The table ────────────────────────────────────────────────── */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-14 md:py-20">
          <Kicker n="01">Every trade, priced</Kicker>
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface tracking-[-0.01em] mb-8">
            Sixteen trades, the same question answered
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-crisp">
                  <th className="py-3 pr-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant">Trade</th>
                  <th className="py-3 pr-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant whitespace-nowrap">A typical job</th>
                  <th className="py-3 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-on-surface-variant whitespace-nowrap">Hourly, mid</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.slug} className="border-b border-border-crisp last:border-0 transition-colors hover:bg-on-surface/[0.04] group">
                    <td className="py-3.5 pr-4">
                      <Link href={`/cost-to-hire/${p.slug}`} className="font-semibold font-body text-sm text-on-surface group-hover:text-electric-violet transition-colors">
                        {p.label}
                      </Link>
                      <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mt-0.5">{p.category}</span>
                    </td>
                    <td className="py-3.5 pr-4 font-mono text-sm text-on-surface tabular-nums whitespace-nowrap">
                      {money(p.lowUsd)}–{money(p.highUsd)}
                    </td>
                    <td className="py-3.5 font-mono text-sm text-on-surface-variant tabular-nums whitespace-nowrap">
                      {money(p.hourly.mid)}/hr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Two cells: the argument, and a worked example ─────────────── */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 bp-cells">
          <Reveal className="px-6 md:px-10 py-14 md:py-20">
            <Kicker n="02">Why it is less than an agency</Kicker>
            <h2 className="text-2xl font-bold font-headline text-on-surface tracking-[-0.01em] mb-4">
              You are not paying for the managing
            </h2>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-4">
              An agency prices the same work with account management, overhead and margin on top.
              That is what you are buying when you buy an agency: someone to run it for you.
            </p>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed">
              Hyrde automates the two parts that normally justify the markup — scoping the work
              and checking it against the brief — and takes no commission on the specialist&apos;s
              price, so nothing is added to cover a platform cut.
            </p>
          </Reveal>

          {/* The worked example: a quote as it actually arrives. */}
          <Reveal delayMs={120} className="px-6 md:px-10 py-14 md:py-20">
            <Kicker n="03">A quote, as it arrives</Kicker>
            <div className="border border-border-crisp bg-on-surface/[0.03] p-5 font-mono text-[12.5px] leading-relaxed">
              <p className="text-on-surface-variant">$ describe &quot;{example.bands[1].title.toLowerCase()}&quot;</p>
              <p className="text-electric-violet mt-3">scope · 3 milestones</p>
              {example.bands.map((b, i) => (
                <p key={b.title} className="text-on-surface flex justify-between gap-4 mt-1.5">
                  <span className="truncate">{String(i + 1).padStart(2, "0")} {b.title}</span>
                  <span className="tabular-nums whitespace-nowrap text-on-surface-variant">
                    {money(b.price.lowUsd)}–{money(b.price.highUsd)}
                  </span>
                </p>
              ))}
              <p className="text-on-surface-variant mt-3 pt-3 border-t border-border-crisp">
                approve each one before the next starts · no Hyrde fee on your first three projects
              </p>
            </div>
            <p className="font-body text-on-surface-variant text-xs leading-relaxed mt-4">
              Prices come from the same formula the product quotes with — hours at a vetted
              specialist&apos;s rate, as a range, because an estimate that pretends to be exact is a
              lie.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Close ────────────────────────────────────────────────────── */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-14 md:py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface tracking-[-0.01em] mb-3">
            Price your own project instead
          </h2>
          <p className="font-body text-on-surface-variant text-sm mb-7 max-w-lg mx-auto">
            Describe it in a sentence. You get the milestones and a number, without signing up.
          </p>
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Price my project — free, no signup
          </Link>
        </div>
      </section>
    </div>
  );
}
