import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, MOCK_FREELANCERS, ALL_SKILL_SLUGS, ALL_CITY_SLUGS, getRate } from "@/lib/data";
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
  return {
    title: `Hire a ${s.label} ${loc}`,
    description: `Find pre-vetted ${s.label}s ${loc}. Local average rate: $${rate}/hr. AI-matched in 60 seconds. 8% fee only on hire. No connects required.`,
  };
}

export default async function HireSkillCityPage({ params }: Props) {
  const { skill, city } = await params;
  const skillData = SKILLS[skill];
  const cityData  = CITIES[city];
  if (!skillData || !cityData) notFound();

  const rate = getRate(skill, city);
  const loc  = cityData.label === "Remote" ? "remotely" : `in ${cityData.label}`;

  const freelancers = MOCK_FREELANCERS
    .filter(f => f.skill === skill || f.location === city)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-surface-gray">

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

            <h1 className="text-4xl md:text-5xl font-bold font-headline text-tech-blue-deep leading-tight mb-4">
              Hire a {skillData.label}{" "}
              <span className="text-electric-violet">{loc}</span>
            </h1>

            <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6 max-w-md">
              Hyrde finds pre-vetted {skillData.label}s {loc} and matches them to your brief in seconds. Local market rate:{" "}
              <strong className="text-tech-blue-deep">${rate}/hr</strong>. No spam. No connects. 8% fee only on hire.
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
                    <span className="text-xs font-semibold font-body text-tech-blue-deep w-16 text-right shrink-0">
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

      {/* Related skills in this city */}
      <section className="bg-white border-t border-border-crisp py-10">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-xl font-bold font-headline text-tech-blue-deep mb-4">
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
