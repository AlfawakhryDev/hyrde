import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, ALL_SKILL_SLUGS, INDEXED_CITY_PAGES, getRate } from "@/lib/data";
import { projectBands, priceRange, hireFaqs } from "@/lib/hire-brief";
import { COST_SKILLS } from "@/lib/cost-to-hire";

// ── "Hire a <trade>" — a buyer's page ──────────────────────────────────────
// These pages carry the searches that bring clients ("hire ux designer", "hire
// developers in egypt") and they used to be a headline, one sentence, and a
// column of example specialists. Nothing to read, nothing to quote, so they sat
// around position 50. What a buyer wants is the price, the speed, and why they
// should trust the person — so that is the page now, with the numbers marked up
// where search and answer engines can use them.

interface Props { params: Promise<{ skill: string }> }

export async function generateStaticParams() {
  return ALL_SKILL_SLUGS.map(skill => ({ skill }));
}

// Every real combination is pre-rendered above, so anything else is a 404
// rather than a streamed not-found page that still answers 200.
export const dynamicParams = false;

const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skill } = await params;
  const data = SKILLS[skill];
  const range = priceRange(skill);
  if (!data || !range) return {};
  return {
    title: `Hire a ${data.label}. Fixed price, from ${money(range.lowUsd)}`,
    description: `What a ${data.label.toLowerCase()} costs on Hyrde: ${money(range.lowUsd)}–${money(range.highUsd)} for a typical job, priced before anyone starts. One interview-vetted specialist matched to the work — no bidding, no shortlist. First three projects carry no Hyrde fee.`,
    alternates: { canonical: `https://hyrde.net/hire/${skill}` },
  };
}

export default async function HireSkillPage({ params }: Props) {
  const { skill } = await params;
  const skillData = SKILLS[skill];
  if (!skillData) notFound();

  const bands = projectBands(skill);
  const range = priceRange(skill)!;
  const faqs = hireFaqs(skill);
  const label = skillData.label;   // labels are already sentence-ready ("UX Designer")

  // Only cities we actually publish, so the links a crawler follows all lead
  // somewhere indexable.
  const cities = [...INDEXED_CITY_PAGES]
    .filter(p => p.startsWith(`${skill}/`))
    .map(p => p.slice(skill.length + 1))
    .filter(c => CITIES[c])
    .slice(0, 9);

  const ld = [
    {
      "@context": "https://schema.org", "@type": "Service",
      serviceType: `${label} for hire`,
      provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
      areaServed: "Worldwide",
      description: `Interview-vetted ${label}s, matched to your work by AI and priced before it starts.`,
      offers: {
        "@type": "AggregateOffer", priceCurrency: "USD",
        lowPrice: range.lowUsd, highPrice: range.highUsd, offerCount: bands.length,
      },
    },
    {
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: faqs.map(f => ({
        "@type": "Question", name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://hyrde.net" },
        { "@type": "ListItem", position: 2, name: "Hire", item: "https://hyrde.net/hire" },
        { "@type": "ListItem", position: 3, name: `Hire a ${label}`, item: `https://hyrde.net/hire/${skill}` },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-12">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/hire" className="hover:text-electric-violet transition-colors">Hire</Link>
          <span>/</span>
          <span className="text-on-surface">{label}</span>
        </nav>

        <div className="max-w-2xl">
          <span className="inline-block text-xs font-semibold font-body bg-electric-violet/10 text-electric-violet px-3 py-1 rounded-full mb-4">
            {skillData.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
            Hire a {label}
          </h1>
          <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6">
            Describe the result you want. The AI turns it into milestones with a price on each,
            then matches one {label} who passed the interview. No bidding, no pile of proposals
            to read, and nothing to pay until you approve the work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/cost-estimator"
              className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
              Price my project — free, no signup
            </Link>
            <Link href="/post-job"
              className="inline-block border border-border-crisp bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm">
              Describe the outcome
            </Link>
          </div>
          {skill in COST_SKILLS && (
            <p className="font-body text-sm text-on-surface-variant mt-4">
              Working out a budget first?{" "}
              <Link href={`/cost-to-hire/${skill}`} className="underline hover:text-electric-violet">
                What a {label} costs, job by job
              </Link>.
            </p>
          )}
        </div>
      </section>

      {/* What it costs — the reason a buyer reads this page at all */}
      <section className="bg-white border-y border-border-crisp py-14">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
            What a {label} costs here
          </h2>
          <p className="font-body text-on-surface-variant text-sm mb-8 max-w-2xl">
            Three jobs people ask a {label} for, priced the way the product prices them:
            hours at a vetted specialist&apos;s rate, plus a range because an estimate that
            pretends to be exact is a lie. You approve the number before work starts.
          </p>
          <div className="grid md:grid-cols-3 gap-5">
            {bands.map(b => (
              <div key={b.title} className="bg-surface-gray rounded-xl p-6 border border-border-crisp flex flex-col">
                <p className="font-bold font-body text-sm text-on-surface mb-2">{b.title}</p>
                <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-4 flex-1">{b.what}</p>
                <p className="text-2xl font-bold font-headline text-on-surface tabular-nums">
                  {money(b.price.lowUsd)}–{money(b.price.highUsd)}
                </p>
                <p className="text-xs font-body text-on-surface-variant mt-1">{b.price.basis}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-14">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-8">
          How hiring a {label} works
        </h2>
        <ol className="grid md:grid-cols-3 gap-6">
          {[
            { n: "01", t: "You describe the result", d: `One sentence is enough. The AI asks what it needs to price the work, then writes the brief and the acceptance criteria for you.` },
            { n: "02", t: "One specialist is matched", d: `Every ${label} on Hyrde passed a graded interview: a scenario, a probing follow-up, and a deep dive on work they shipped. The best fit is assigned — you do not sift through applicants.` },
            { n: "03", t: "You approve, then pay", d: `An AI checks the delivered work against your brief before you see the bill. Your first three projects carry no Hyrde fee: you pay the specialist and nothing else.` },
          ].map(s => (
            <li key={s.n} className="bg-white rounded-xl p-6 border border-border-crisp">
              <p className="font-mono text-xs text-electric-violet mb-2">{s.n}</p>
              <p className="font-bold font-body text-sm text-on-surface mb-2">{s.t}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {cities.length > 0 && (
        <section className="bg-white border-t border-border-crisp py-12">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
              Hire a {label} by location
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {cities.map(citySlug => {
                const city = CITIES[citySlug];
                return (
                  <Link key={citySlug} href={`/hire/${skill}/${citySlug}`}
                    className="bg-surface-gray rounded-xl p-4 border border-border-crisp hover:border-electric-violet transition-colors group">
                    <p className="font-bold font-body text-sm text-on-surface group-hover:text-electric-violet transition-colors">
                      {label} in {city.label}
                    </p>
                    <p className="text-xs font-body text-on-surface-variant mt-1">
                      local market ~${getRate(skill, citySlug)}/hr · {city.region}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-14">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
          Hiring a {label}: the questions clients ask
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {faqs.map(f => (
            <div key={f.q} className="bg-white rounded-xl p-5 border border-border-crisp">
              <p className="font-bold font-body text-sm text-on-surface mb-2">{f.q}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/cost-estimator"
            className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
            Price my {label} project
          </Link>
        </div>
      </section>
    </div>
  );
}
