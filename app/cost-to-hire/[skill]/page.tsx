import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COST_SLUGS, costPage } from "@/lib/cost-to-hire";

interface Props { params: Promise<{ skill: string }> }

export async function generateStaticParams() {
  return COST_SLUGS.map(skill => ({ skill }));
}

// Anything outside that list is a real 404, not a soft one: without this a
// streamed notFound() still answers 200 and invites Google to crawl an
// infinite space of invented slugs.
export const dynamicParams = false;

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skill } = await params;
  const p = costPage(skill);
  if (!p) return {};
  return {
    title: `What does it cost to hire a ${p.label}? (2026)`,
    description: `${money(p.lowUsd)}–${money(p.highUsd)} for a typical ${p.label} job, or ${money(p.hourly.junior)}–${money(p.hourly.senior)} an hour by seniority. Real prices for three jobs people actually buy, what moves the number, and a free estimate for your own project.`,
    alternates: { canonical: `https://hyrde.net/cost-to-hire/${skill}` },
  };
}

export default async function CostToHirePage({ params }: Props) {
  const { skill } = await params;
  const p = costPage(skill);
  if (!p) notFound();

  const ld = [
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: p.faqs.map(f => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org", "@type": "Service",
      serviceType: `${p.label} for hire`,
      provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
      areaServed: "Worldwide",
      offers: {
        "@type": "AggregateOffer", priceCurrency: "USD",
        lowPrice: p.lowUsd, highPrice: p.highUsd, offerCount: p.bands.length,
      },
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://hyrde.net" },
        { "@type": "ListItem", position: 2, name: "What it costs", item: "https://hyrde.net/cost-to-hire" },
        { "@type": "ListItem", position: 3, name: `Hire a ${p.label}`, item: `https://hyrde.net/cost-to-hire/${p.slug}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="max-w-[860px] mx-auto px-6 md:px-12 pt-20 pb-10">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cost-to-hire" className="hover:text-electric-violet transition-colors">What it costs</Link>
          <span>/</span>
          <span className="text-on-surface">{p.label}</span>
        </nav>

        <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-5">
          What does it cost to hire a {p.label}?
        </h1>

        {/* The answer first, in one paragraph, because that is the part that
            gets quoted — by a reader in a hurry and by an answer engine. */}
        <p className="font-body text-on-surface text-lg leading-relaxed mb-4">
          <strong>{money(p.lowUsd)} to {money(p.highUsd)}</strong> for a typical job through Hyrde,
          which works out at {money(p.hourly.junior)}–{money(p.hourly.senior)} an hour depending on
          seniority. A small, well-defined piece of work lands near the bottom of that range; a
          whole build sits at the top.
        </p>
        <p className="font-body text-on-surface-variant text-base leading-relaxed mb-8">
          The price is agreed before anyone starts and only changes if you change the scope. Your
          first three projects carry no Hyrde fee — you pay the specialist their price and nothing
          else.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Price my project — free, no signup
          </Link>
          <Link href={`/hire/${p.slug}`}
            className="inline-block border border-border-crisp bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
            Hire a {p.label}
          </Link>
        </div>
      </section>

      <section className="bg-white border-y border-border-crisp py-12">
        <div className="max-w-[860px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
            Three jobs people hire a {p.label} for
          </h2>
          <div className="space-y-4">
            {p.bands.map(b => (
              <div key={b.title} className="border border-border-crisp rounded-xl p-5 bg-surface-gray">
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
                  <p className="font-bold font-body text-sm text-on-surface">{b.title}</p>
                  <p className="font-bold font-headline text-lg text-on-surface tabular-nums whitespace-nowrap">
                    {money(b.price.lowUsd)}–{money(b.price.highUsd)}
                  </p>
                </div>
                <p className="text-xs font-body text-on-surface-variant leading-relaxed">{b.what}</p>
                <p className="text-xs font-body text-on-surface-variant mt-2 opacity-80">{b.price.basis}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold font-headline text-on-surface mt-12 mb-4">
            By the hour
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {([["Junior", p.hourly.junior], ["Mid-level", p.hourly.mid], ["Senior", p.hourly.senior]] as const).map(([lbl, v]) => (
              <div key={lbl} className="bg-surface-gray rounded-xl p-4 border border-border-crisp text-center">
                <p className="text-xl font-bold font-headline text-on-surface tabular-nums">{money(v)}</p>
                <p className="text-xs font-body text-on-surface-variant">{lbl} / hour</p>
              </div>
            ))}
          </div>
          <p className="text-xs font-body text-on-surface-variant mt-3">
            These are what a vetted specialist costs here. For what the open market charges by city,
            see the <Link href="/rates" className="underline hover:text-electric-violet">Hyrde rate index</Link>.
          </p>
        </div>
      </section>

      <section className="max-w-[860px] mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">
          What moves the number
        </h2>
        <ul className="space-y-2 mb-10">
          {p.drivers.map(d => (
            <li key={d} className="font-body text-on-surface-variant text-sm leading-relaxed flex gap-3">
              <span className="text-electric-violet" aria-hidden="true">—</span>{d}
            </li>
          ))}
        </ul>

        <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
          Questions people ask before hiring a {p.label}
        </h2>
        <div className="space-y-4">
          {p.faqs.map(f => (
            <div key={f.q} className="bg-white rounded-xl p-5 border border-border-crisp">
              <p className="font-bold font-body text-sm text-on-surface mb-2">{f.q}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Get a price for your own project
          </Link>
          <Link href="/cost-to-hire"
            className="inline-block border border-border-crisp bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
            What other trades cost
          </Link>
        </div>
      </section>
    </div>
  );
}
