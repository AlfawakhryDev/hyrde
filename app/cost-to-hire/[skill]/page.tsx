import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COST_SLUGS, costPage } from "@/lib/cost-to-hire";
import Kicker from "@/components/Kicker";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import MarkerUnderline from "@/components/MarkerUnderline";
import HeroBackdrop from "@/components/home/HeroBackdrop";

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

      <section className="relative overflow-hidden">
        <HeroBackdrop />
        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 pt-20 pb-14 md:pt-28 md:pb-16">
          <nav className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
            <span className="opacity-40">/</span>
            <Link href="/cost-to-hire" className="hover:text-electric-violet transition-colors">What it costs</Link>
            <span className="opacity-40">/</span>
            <span className="text-on-surface">{p.label}</span>
          </nav>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-on-surface leading-[1.04] tracking-[-0.02em] max-w-3xl mb-6 animate-fadeup">
            What does it cost to hire a <MarkerUnderline>{p.label}</MarkerUnderline>?
          </h1>
          {/* The answer first, because that is the part that gets quoted — by a
              reader in a hurry and by an answer engine. */}
          <p className="font-body text-on-surface text-lg leading-relaxed max-w-2xl mb-3">
            <strong>
              <StatCounter value={p.lowUsd} prefix="$" comma durationMs={900} /> to{" "}
              <StatCounter value={p.highUsd} prefix="$" comma durationMs={1400} />
            </strong>{" "}
            for a typical job through Hyrde, which works out at {money(p.hourly.junior)}–
            {money(p.hourly.senior)} an hour depending on seniority. A small, well-defined piece
            of work lands near the bottom of that range; a whole build sits at the top.
          </p>
          <p className="font-body text-on-surface-variant text-base leading-relaxed max-w-2xl mb-8">
            The price is agreed before anyone starts and only changes if you change the scope.
            Your first three projects carry no Hyrde fee — you pay the specialist their price and
            nothing else.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/cost-estimator"
              className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
              Price my project — free, no signup
            </Link>
            <Link href={`/hire/${p.slug}`}
              className="inline-block border border-border-crisp bg-transparent text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
              Hire a {p.label}
            </Link>
          </div>
        </div>
      </section>

      {/* Three jobs, as cells rather than floating cards. */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 pt-14 md:pt-20 pb-0">
          <Kicker n="01">Three jobs people buy</Kicker>
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface tracking-[-0.01em] mb-2">
            What a {p.label} is actually hired for
          </h2>
          <p className="font-body text-on-surface-variant text-sm max-w-2xl">
            Hours at a vetted specialist&apos;s rate, as a range — an estimate that pretends to be
            exact is a lie.
          </p>
        </div>
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-3 bp-cells mt-10">
          {p.bands.map((b, i) => (
            <Reveal key={b.title} delayMs={i * 90}
              className="px-6 md:px-8 py-10 transition-colors duration-300 hover:bg-on-surface/[0.03]">
              <p className="font-mono text-[11px] text-electric-violet mb-3">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-bold font-body text-sm text-on-surface mb-2">{b.title}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-5">{b.what}</p>
              <p className="font-mono text-xl text-on-surface tabular-nums">
                {money(b.price.lowUsd)}–{money(b.price.highUsd)}
              </p>
              <p className="font-mono text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">{b.price.basis}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Hourly, and what moves the number. */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 bp-cells">
          <Reveal className="px-6 md:px-10 py-14 md:py-20">
            <Kicker n="02">By the hour</Kicker>
            <div className="grid grid-cols-3 gap-px bg-border-crisp border border-border-crisp mb-4">
              {([["Junior", p.hourly.junior], ["Mid", p.hourly.mid], ["Senior", p.hourly.senior]] as const).map(([lbl, v]) => (
                <div key={lbl} className="bg-surface-gray px-3 py-5 text-center">
                  <p className="font-mono text-xl text-on-surface tabular-nums">
                    <StatCounter value={v} prefix="$" comma durationMs={800} />
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mt-1">{lbl}</p>
                </div>
              ))}
            </div>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed">
              What a vetted specialist costs here. For what the open market charges by city, see
              the <Link href="/rates" className="underline hover:text-electric-violet">rate index</Link>.
            </p>
          </Reveal>

          <Reveal delayMs={120} className="px-6 md:px-10 py-14 md:py-20">
            <Kicker n="03">What moves the number</Kicker>
            <ul className="space-y-3">
              {p.drivers.map((d, i) => (
                <li key={d} className="font-body text-on-surface-variant text-sm leading-relaxed flex gap-3">
                  <span className="font-mono text-[11px] text-electric-violet pt-1 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  {d}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Questions. */}
      <section className="bp-band">
        <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-14 md:py-20">
          <Kicker n="04">Before you hire</Kicker>
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface tracking-[-0.01em] mb-8">
            Questions people ask
          </h2>
          <div className="grid md:grid-cols-2 gap-px bg-border-crisp border border-border-crisp">
            {p.faqs.map((f, i) => (
              <Reveal key={f.q} delayMs={i * 70} className="bg-surface-gray p-6 transition-colors duration-300 hover:bg-on-surface/[0.03]">
                <p className="font-bold font-body text-sm text-on-surface mb-2">{f.q}</p>
                <p className="text-xs font-body text-on-surface-variant leading-relaxed">{f.a}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cost-estimator"
              className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
              Get a price for your own project
            </Link>
            <Link href="/cost-to-hire"
              className="inline-block border border-border-crisp text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
              What other trades cost
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
