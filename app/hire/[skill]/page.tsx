import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, MOCK_FREELANCERS, ALL_SKILL_SLUGS, getRate } from "@/lib/data";
import FreelancerCard from "@/components/FreelancerCard";

interface Props { params: Promise<{ skill: string }> }

export async function generateStaticParams() {
  return ALL_SKILL_SLUGS.map(skill => ({ skill }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { skill } = await params;
  const data = SKILLS[skill];
  if (!data) return {};
  return {
    title: `Hire a ${data.label}`,
    description: `Find pre-vetted ${data.label}s on Hyrde. Average rate $${data.avgRate}/hr. AI-matched in 60 seconds. 8% fee only on hire.`,
  };
}

const FEATURED_CITIES = ["remote","new-york","london","dubai","cairo","berlin"];

export default async function HireSkillPage({ params }: Props) {
  const { skill } = await params;
  const skillData = SKILLS[skill];
  if (!skillData) notFound();

  const freelancers = MOCK_FREELANCERS
    .filter(f => f.skill === skill)
    .sort((a, b) => b.score - a.score);

  const fallback = [...MOCK_FREELANCERS].sort((a, b) => b.score - a.score).slice(0, 3);
  const displayFreelancers = freelancers.length > 0 ? freelancers : fallback;

  return (
    <div className="min-h-screen bg-surface-gray">

      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-12">
        <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
          <span>/</span>
          <Link href="/hire" className="hover:text-electric-violet transition-colors">Hire</Link>
          <span>/</span>
          <span className="text-on-surface">{skillData.label}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="inline-block text-xs font-semibold font-body bg-electric-violet/10 text-electric-violet px-3 py-1 rounded-full mb-4">
              {skillData.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface leading-tight mb-4">
              Hire a {skillData.label}
            </h1>
            <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6 max-w-md">
              Get matched with pre-vetted {skillData.label}s in under 60 seconds. AI-scored candidates only. 8% fee — charged only on hire.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { val: `$${skillData.avgRate}`, lbl: "avg/hr"   },
                { val: skillData.demand,         lbl: "demand"   },
                { val: "60s",                    lbl: "to match" },
              ].map(({ val, lbl }) => (
                <div key={lbl} className="bg-white rounded-xl p-4 border border-border-crisp text-center">
                  <p className="text-xl font-bold font-headline text-on-surface capitalize">{val}</p>
                  <p className="text-xs font-body text-on-surface-variant">{lbl}</p>
                </div>
              ))}
            </div>

            <Link href="/post-job"
              className="inline-block bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm">
              Post a {skillData.label} job
            </Link>
          </div>

          <div>
            <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-3">
              Available now
            </p>
            <div className="space-y-3">
              {displayFreelancers.map((f, i) => (
                <FreelancerCard key={f.id} freelancer={f} highlight={i === 0} />
              ))}
            </div>
            <p className="text-xs font-body text-on-surface-variant text-center mt-3">
              + more matched after you post
            </p>
          </div>
        </div>
      </section>

      {/* Browse by city */}
      <section className="bg-white border-t border-border-crisp py-12">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
            Hire a {skillData.label} by location
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FEATURED_CITIES.map(citySlug => {
              const city = CITIES[citySlug];
              if (!city) return null;
              const rate = getRate(skill, citySlug);
              return (
                <Link key={citySlug} href={`/hire/${skill}/${citySlug}`}
                  className="bg-surface-gray rounded-xl p-4 border border-border-crisp hover:border-electric-violet transition-colors group">
                  <p className="font-bold font-body text-sm text-on-surface group-hover:text-electric-violet transition-colors">
                    {skillData.label} in {city.label}
                  </p>
                  <p className="text-xs font-body text-on-surface-variant mt-1">~${rate}/hr · {city.region}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-6">
          Frequently asked about hiring {skillData.label}s
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { q: `How much does a ${skillData.label} cost?`,   a: `The average ${skillData.label} on Hyrde charges $${skillData.avgRate}/hr. Rates range from $${Math.round(skillData.avgRate * 0.6)}/hr (junior) to $${Math.round(skillData.avgRate * 1.6)}/hr (senior).` },
            { q: `How fast can I hire a ${skillData.label}?`,  a: `Hyrde's AI presents the top 5 AI-scored candidates within 60 seconds of you posting. Most clients confirm a hire within 24–48 hours.` },
            { q: `What makes Hyrde different?`,             a: `5 AI-curated matches instead of dozens of spam proposals. 8% fee, only when you hire. Zero cost to post. AI explains exactly why each person was matched.` },
            { q: `Are ${skillData.label}s verified?`,          a: `Yes. Every freelancer completes an AI-administered skills assessment before appearing in results. You see a verified competency score.` },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-xl p-5 border border-border-crisp">
              <p className="font-bold font-body text-sm text-on-surface mb-2">{q}</p>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
