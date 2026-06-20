import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, MOCK_FREELANCERS, ALL_SKILL_SLUGS, ALL_CITY_SLUGS, getRate, getRateContext, getSkillCityIntro, getSkillCityFaqs, getCityRateComparisons } from "@/lib/data";
import FreelancerCard from "@/components/FreelancerCard";

interface Props { params: Promise<{ skill: string; city: string }> }

export async function generateStaticParams() {
  const pairs: { skill: string; city: string }[] = [];
  for (const skill of ALL_SKILL_SLUGS) {
    for (const city of ALL_CITY_SLUGS) {
      pairs.push({ skill, city });
    }
  }
  return pairs;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skill, city } = await params;
  const s = SKILLS[skill]; const c = CITIES[city];
  if (!s || !c) return {};
  const rate = getRate(skill, city);
  const loc = c.label === "Remote" ? "remotely" : `in ${c.label}`;
  const title = `Hire a ${s.label} ${loc} — $${rate}/hr avg | Hyrde`;
  const description = `Find pre-vetted ${s.label}s ${loc}. Local average rate $${rate}/hr. AI-matched in 60 seconds, flat 8% fee only on hire — no Connects, no fake reviews.`;
  const canonical = `/hire/${skill}/${city}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function HireSkillCityPage({ params }: Props) {
  const { skill, city } = await params;
  const skillData = SKILLS[skill];
  const cityData  = CITIES[city];
  if (!skillData || !cityData) notFound();

  const rate = getRate(skill, city);
  const loc  = cityData.label === "Remote" ? "remotely" : `in ${cityData.label}`;

  const intro       = getSkillCityIntro(skill, city);
  const faqs        = getSkillCityFaqs(skill, city);
  const ctx         = getRateContext(skill, city)!;
  const cityRates   = getCityRateComparisons(skill, city, 5);

  const freelancers = MOCK_FREELANCERS
    .filter(f => f.skill === skill || f.location === city)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Structured data: FAQPage + BreadcrumbList for rich results
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hyrde.net" },
      { "@type": "ListItem", position: 2, name: "Hire", item: "https://hyrde.net/hire" },
      { "@type": "ListItem", position: 3, name: skillData.label, item: `https://hyrde.net/hire/${skill}` },
      { "@type": "ListItem", position: 4, name: cityData.label, item: `https://hyrde.net/hire/${skill}/${city}` },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-12">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/hire" className="hover:text-electric-violet transition-colors">Hire</Link>
          <span>/</span>
          <Link href={`/hire/${skill}`} className="hover:text-electric-violet transition-colors">{skillData.label}</Link>
          <span>/</span>
          <span className="text-on-surface">{cityData.label}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block text-xs font-semibold font-body bg-electric-violet/10 text-electric-violet px-3 py-1 rounded-full">
                {skillData.category}
              </span>
              <span className="inline-block text-xs font-semibold font-body bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">
                {cityData.region}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
              Hire a {skillData.label}{" "}
              <span className="text-electric-violet">{loc}</span>
            </h1>

            <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6 max-w-md">
              {intro}
            </p>

            {/* Rate comparison */}
            <div className="bg-white rounded-xl p-5 border border-border-crisp mb-6">
              <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-4">
                Rate comparison
              </p>
              <div className="space-y-2">
                {[
                  { label: "Junior", rate: Math.round(rate * 0.6) },
                  { label: "Mid",    rate: Math.round(rate * 1.0) },
                  { label: "Senior", rate: Math.round(rate * 1.5) },
                ].map(tier => (
                  <div key={tier.label} className="flex items-center gap-3">
                    <span className="text-xs font-body text-on-surface-variant w-12 shrink-0">{tier.label}</span>
                    <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div className="h-full rounded-full ai-match-gradient"
                        style={{ width: `${(tier.rate / (rate * 1.8)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold font-body text-on-surface w-16 text-right shrink-0">
                      ${tier.rate}/hr
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs font-body text-on-surface-variant mt-3 pt-3 border-t border-border-crisp">
                Platform fee:{" "}
                <span className="text-electric-violet font-semibold">8%</span>{" "}
                vs the industry standard{" "}
                <span className="text-red-400 font-semibold line-through">20%</span>
              </p>
            </div>

            <Link href="/post-job"
              className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
              Post a {skillData.label} job {loc}
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-3">
              Top matches available
            </p>
            <div className="space-y-3">
              {freelancers.map((f, i) => (
                <FreelancerCard key={f.id} freelancer={f} highlight={i === 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How rates compare across cities (internal-link mesh) */}
      {cityRates.length > 0 && (
        <section className="bg-white border-t border-border-crisp py-10">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-2">
              {skillData.label} rates by city
            </h2>
            <p className="font-body text-on-surface-variant text-sm mb-5 max-w-2xl">
              A {skillData.label} {loc} averages{" "}
              <strong className="text-on-surface">${ctx.rate}/hr</strong> —{" "}
              {ctx.direction === "in line with"
                ? "right in line with"
                : `${ctx.diffPct}% ${ctx.direction}`}{" "}
              the global baseline. Here&apos;s how that compares to other markets:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {cityRates.map(cr => (
                <Link key={cr.slug} href={`/hire/${skill}/${cr.slug}`}
                  className="flex items-center justify-between bg-surface-gray hover:bg-electric-violet/10 px-4 py-3 rounded-lg border border-border-crisp transition-colors group">
                  <span className="text-sm font-body text-on-surface group-hover:text-electric-violet">
                    {skillData.label} in {cr.label}
                  </span>
                  <span className="text-sm font-semibold font-body text-on-surface shrink-0">
                    ${cr.rate}/hr
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ (with FAQPage JSON-LD above for rich results) */}
      {faqs.length > 0 && (
        <section className="bg-surface-gray border-t border-border-crisp py-12">
          <div className="max-w-[800px] mx-auto px-6 md:px-12">
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
              Hiring a {skillData.label} {loc}: FAQ
            </h2>
            <div className="space-y-3">
              {faqs.map((f, i) => (
                <details key={i} className="bg-white rounded-xl border border-border-crisp p-5 group">
                  <summary className="font-semibold font-body text-on-surface cursor-pointer list-none flex items-center justify-between">
                    {f.q}
                    <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform" style={{ fontSize: "20px" }}>expand_more</span>
                  </summary>
                  <p className="font-body text-on-surface-variant text-sm leading-relaxed mt-3">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>

            <div className="mt-8 bg-tech-blue-deep rounded-2xl p-6 text-center">
              <p className="font-body text-white/90 text-sm mb-4">
                Burned by disappearing contractors or fake reviews elsewhere?{" "}
                <Link href="/upwork-alternative" className="text-ai-glow underline underline-offset-2 hover:text-white">
                  See why clients switch to Hyrde
                </Link>.
              </p>
              <Link href="/get-started"
                className="inline-block bg-white text-on-surface font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
                Hire a {skillData.label} {loc}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related skills in this city */}
      <section className="bg-white border-t border-border-crisp py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-xl font-bold font-headline text-on-surface mb-4">
            Other talent {cityData.label === "Remote" ? "available remotely" : `available in ${cityData.label}`}
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILL_SLUGS.filter(s => s !== skill).slice(0, 10).map(s => {
              const sd = SKILLS[s];
              return (
                <Link key={s} href={`/hire/${s}/${city}`}
                  className="text-xs font-body bg-surface-gray hover:bg-electric-violet/10 hover:text-electric-violet text-on-surface-variant px-3 py-1.5 rounded-full border border-border-crisp transition-colors">
                  {sd?.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
