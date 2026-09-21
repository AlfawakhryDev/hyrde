import Link from "next/link";
import type { Metadata } from "next";
import { allCostPages } from "@/lib/cost-to-hire";

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

      <section className="max-w-[900px] mx-auto px-6 md:px-12 pt-20 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-5">
          What it costs to hire a freelancer in 2026
        </h1>
        <p className="font-body text-on-surface text-lg leading-relaxed mb-4">
          Job titles do not have prices; jobs do. So this is priced by the work: the three things
          people actually buy from each trade, from {money(cheapest.lowUsd)} for a small fix to{" "}
          {money(dearest.highUsd)} for a full build.
        </p>
        <p className="font-body text-on-surface-variant text-base leading-relaxed">
          Every number is what you would pay a vetted specialist here, agreed before work starts.
          Free to quote and free to check against your own project with the{" "}
          <Link href="/cost-estimator" className="underline hover:text-electric-violet">cost estimator</Link>.
        </p>
      </section>

      <section className="bg-white border-y border-border-crisp py-10">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-crisp">
                <th className="py-3 pr-4 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant">Trade</th>
                <th className="py-3 pr-4 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant">A typical job</th>
                <th className="py-3 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant whitespace-nowrap">Hourly (mid)</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.slug} className="border-b border-border-crisp last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/cost-to-hire/${p.slug}`} className="font-semibold font-body text-sm text-on-surface hover:text-electric-violet transition-colors">
                      {p.label}
                    </Link>
                    <span className="block text-xs font-body text-on-surface-variant">{p.category}</span>
                  </td>
                  <td className="py-3 pr-4 font-body text-sm text-on-surface tabular-nums whitespace-nowrap">
                    {money(p.lowUsd)}–{money(p.highUsd)}
                  </td>
                  <td className="py-3 font-body text-sm text-on-surface-variant tabular-nums whitespace-nowrap">
                    {money(p.hourly.mid)}/hr
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">Why these numbers are lower than an agency quote</h2>
        <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8 max-w-2xl">
          An agency prices the same work with account management, overhead and margin on top; that
          is what you are buying when you buy an agency. Hyrde automates the two parts that
          normally justify it — scoping the work and checking it against the brief — and takes no
          commission on the specialist&apos;s price, so nothing is added to cover a platform cut.
        </p>
        <Link href="/cost-estimator"
          className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
          Price my project — free, no signup
        </Link>
      </section>
    </div>
  );
}
