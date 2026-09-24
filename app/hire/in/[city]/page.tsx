import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GULF_SLUGS, getGulfCity, gulfTrades, inLocal } from "@/lib/gulf";
import Reveal from "@/components/Reveal";
import MarkerUnderline from "@/components/MarkerUnderline";
import HeroBackdrop from "@/components/home/HeroBackdrop";

interface Props { params: Promise<{ city: string }> }

export async function generateStaticParams() {
  return GULF_SLUGS.map(city => ({ city }));
}

// Anything outside that list is a real 404, not a soft one: without this a
// streamed notFound() still answers 200 and invites Google to crawl an
// infinite space of invented slugs.
export const dynamicParams = false;

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const c = getGulfCity(city);
  if (!c) return {};
  const trades = gulfTrades(c);
  const low = Math.min(...trades.map(t => t.lowUsd));
  return {
    title: `Hire freelancers in ${c.name}. Vetted, fixed price`,
    description: `Hire interview-vetted freelancers in ${c.name}: ${c.demand} A typical job starts around ${inLocal(low, c)} (${money(low)}), priced before anyone starts. No visa, sponsorship or local entity — you are buying a defined piece of work.`,
    alternates: {
      canonical: `https://hyrde.net/hire/in/${c.slug}`,
      languages: { "ar-SA": `https://hyrde.net/ar/hire/${c.slug}` },
    },
  };
}

export default async function HireInCityPage({ params }: Props) {
  const { city } = await params;
  const c = getGulfCity(city);
  if (!c) notFound();

  const trades = gulfTrades(c);
  const low = Math.min(...trades.map(t => t.lowUsd));
  const high = Math.max(...trades.map(t => t.highUsd));

  const faqs = [
    {
      q: `What does it cost to hire a freelancer in ${c.name}?`,
      a: `A typical job runs ${inLocal(low, c)} to ${inLocal(high, c)} (${money(low)}–${money(high)}), depending on the trade and the size of the work. ${trades[0].label} work starts around ${inLocal(trades[0].lowUsd, c)}. Every job is priced before it starts and the number only moves if the scope does.`,
    },
    {
      q: `Do I need a visa or a local entity to hire someone in ${c.name}?`,
      a: `Not for contract work. A contractor is not an employee: there is no visa, no sponsorship and no local entity involved, because you are buying a defined piece of work rather than employing a person. You get an invoice for it; how that is recorded in ${c.country} is a question for your accountant.`,
    },
    {
      q: `How fast can someone start in ${c.name}?`,
      a: `Usually the same day. You describe the result, the AI turns it into milestones with a price on each, and matches one vetted specialist to the first milestone. Gulf hours overlap the working day of the specialists we match, so review and revisions happen inside your day rather than overnight.`,
    },
    {
      q: `Can I work in Arabic?`,
      a: `Yes. The whole site is available in Arabic at hyrde.net/ar, including rates and demand for ${c.name}, and specialists are matched on the languages your work actually needs.`,
    },
  ];

  const ld = [
    {
      "@context": "https://schema.org", "@type": "Service",
      serviceType: "Freelance specialists, interview-vetted",
      provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
      areaServed: { "@type": "City", name: c.name, address: { "@type": "PostalAddress", addressCountry: c.countryCode } },
      offers: { "@type": "AggregateOffer", priceCurrency: "USD", lowPrice: low, highPrice: high, offerCount: trades.length },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://hyrde.net" },
        { "@type": "ListItem", position: 2, name: "Hire", item: "https://hyrde.net/hire" },
        { "@type": "ListItem", position: 3, name: `Hire in ${c.name}`, item: `https://hyrde.net/hire/in/${c.slug}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="relative overflow-hidden max-w-[900px] mx-auto px-6 md:px-12 pt-20 pb-8">
        <HeroBackdrop />
        <nav className="relative text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/hire" className="hover:text-electric-violet transition-colors">Hire</Link>
          <span>/</span>
          <span className="text-on-surface">{c.name}</span>
        </nav>

        <h1 className="relative text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-5 animate-fadeup">
          Hire vetted freelancers in <MarkerUnderline>{c.name}</MarkerUnderline>
        </h1>
        <p className="relative font-body text-on-surface text-lg leading-relaxed mb-4">
          A typical job runs <strong>{inLocal(low, c)} to {inLocal(high, c)}</strong> ({money(low)}–{money(high)}),
          priced before anyone starts. One specialist is matched to the work — usually the same day —
          and an AI checks what they deliver against your brief before you pay.
        </p>
        <p className="relative font-body text-on-surface-variant text-base leading-relaxed mb-6">
          No visa, no sponsorship, no local entity: you are buying a defined piece of work, not
          employing anyone. Your first three projects carry no Hyrde fee.
        </p>
        <div className="relative flex flex-wrap gap-3">
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Price my project — free, no signup
          </Link>
          <Link href={`/ar/hire/${c.slug}`} lang="ar"
            className="inline-block border border-border-crisp bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
            بالعربية
          </Link>
        </div>
      </section>

      <section className="bg-white border-y border-border-crisp py-12">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            What {c.name} hires for, and what it costs
          </h2>
          <p className="font-body text-on-surface-variant text-sm mb-6">{c.demand}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-crisp">
                  <th className="py-3 pr-4 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant">Trade</th>
                  <th className="py-3 pr-4 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant whitespace-nowrap">A typical job ({c.currencyCode})</th>
                  <th className="py-3 text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant whitespace-nowrap">In USD</th>
                </tr>
              </thead>
              <tbody>
                {trades.map(t => (
                  <tr key={t.slug} className="border-b border-border-crisp last:border-0 transition-colors hover:bg-surface-gray/70">
                    <td className="py-3 pr-4">
                      <Link href={`/hire/${t.slug}/${c.slug}`} className="font-semibold font-body text-sm text-on-surface hover:text-electric-violet transition-colors">
                        {t.label} in {c.name}
                      </Link>
                      <Link href={`/cost-to-hire/${t.slug}`} className="block text-xs font-body text-on-surface-variant hover:text-electric-violet transition-colors">
                        what moves the price →
                      </Link>
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-on-surface tabular-nums whitespace-nowrap">{t.local}</td>
                    <td className="py-3 font-body text-sm text-on-surface-variant tabular-nums whitespace-nowrap">
                      {money(t.lowUsd)}–{money(t.highUsd)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs font-body text-on-surface-variant mt-3">
            Converted at {c.perUsd} {c.currencyCode} to the dollar and rounded. You are quoted and
            invoiced in US dollars.
          </p>
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">
          What hiring in {c.name} is actually like
        </h2>
        <p className="font-body text-on-surface-variant text-base leading-relaxed mb-10 max-w-2xl">{c.note}</p>

        <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
          Questions {c.name} clients ask
        </h2>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delayMs={i * 70} className="bg-white rounded-xl p-5 border border-border-crisp transition-colors duration-300 hover:border-electric-violet/50">
              <p className="font-bold font-body text-sm text-on-surface mb-2">{f.q}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{f.a}</p>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Get a price for your project
          </Link>
          <Link href="/cost-to-hire"
            className="inline-block border border-border-crisp bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
            What every trade costs
          </Link>
        </div>
      </section>
    </div>
  );
}
