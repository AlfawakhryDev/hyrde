import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, getRate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Freelance Rate Index",
  description: "Real market rates for 25+ freelance skills. Junior, mid, and senior ranges. Compare across cities. Know your worth.",
};

const CATEGORIES = ["Engineering", "Design", "Data", "Writing", "Marketing", "Creative"];
const CITY_COLS  = ["remote", "new-york", "london", "dubai", "cairo", "berlin"] as const;

export default function RatesPage() {
  const byCategory = CATEGORIES.reduce<Record<string, [string, typeof SKILLS[string]][]>>((acc, cat) => {
    acc[cat] = Object.entries(SKILLS).filter(([, s]) => s.category === cat);
    return acc;
  }, {});

  // Top 8 skills for the city comparison table
  const topSkills = Object.entries(SKILLS).slice(0, 8);

  return (
    <div className="min-h-screen bg-surface-gray relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-electric-violet rounded-full glow-accent -mr-48 -mt-24 pointer-events-none" />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-12 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border-crisp mb-6">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          <span className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest">Live Market Data</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-tech-blue-deep mb-4 leading-tight">
          Freelance Rate Index
        </h1>
        <p className="text-lg font-body text-on-surface-variant max-w-xl">
          Real market rates across 25+ skills and 12 cities. Know your worth — or know what to pay.
        </p>
      </section>

      {/* Skills by category */}
      {CATEGORIES.map(cat => {
        const skills = byCategory[cat];
        if (!skills?.length) return null;
        return (
          <section key={cat} className="max-w-[1280px] mx-auto px-6 md:px-12 mb-12">
            <h2 className="text-xl font-bold font-headline text-tech-blue-deep mb-4 flex items-center gap-3">
              {cat}
              <span className="text-xs font-semibold font-body text-on-surface-variant bg-surface-container-high px-2.5 py-0.5 rounded-full normal-case">
                {skills.length} skills
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map(([slug, skill]) => (
                <Link key={slug} href={`/hire/${slug}`}
                  className="bg-white rounded-xl p-5 border border-border-crisp hover:border-electric-violet hover:shadow-[0_4px_16px_rgba(124,58,237,0.07)] transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold font-body text-tech-blue-deep text-sm group-hover:text-electric-violet transition-colors mb-1.5">
                        {skill.label}
                      </p>
                      <span className={`text-xs font-semibold font-body px-2.5 py-0.5 rounded-full ${
                        skill.demand === "high"
                          ? "bg-electric-violet/10 text-electric-violet"
                          : "bg-surface-container-high text-on-surface-variant"
                      }`}>
                        {skill.demand} demand
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-2xl font-bold font-headline text-tech-blue-deep">${skill.avgRate}</p>
                      <p className="text-xs font-body text-on-surface-variant">/hr avg</p>
                    </div>
                  </div>

                  {/* Rate range bars */}
                  <div className="space-y-2 pt-3 border-t border-border-crisp">
                    {[
                      { label: "Junior",  rate: Math.round(skill.avgRate * 0.6) },
                      { label: "Mid",     rate: skill.avgRate                   },
                      { label: "Senior",  rate: Math.round(skill.avgRate * 1.5) },
                    ].map(tier => (
                      <div key={tier.label} className="flex items-center gap-3">
                        <span className="text-xs font-body text-on-surface-variant w-10 shrink-0">{tier.label}</span>
                        <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full ai-match-gradient"
                            style={{ width: `${(tier.rate / (skill.avgRate * 1.6)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold font-body text-tech-blue-deep w-14 text-right shrink-0">
                          ${tier.rate}/hr
                        </span>
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* City rate comparison table */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-16">
        <div className="mb-6">
          <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">Rate by location</p>
          <h2 className="text-2xl font-bold font-headline text-tech-blue-deep">How location affects rates</h2>
          <p className="font-body text-on-surface-variant mt-1 text-sm">Rates are multiplied by local market demand.</p>
        </div>

        <div className="bg-white rounded-xl border border-border-crisp overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-surface-gray border-b border-border-crisp">
                  <th className="text-left text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest p-4 whitespace-nowrap">
                    Skill
                  </th>
                  {CITY_COLS.map(citySlug => (
                    <th key={citySlug} className="text-center text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest p-4 whitespace-nowrap">
                      {CITIES[citySlug]?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSkills.map(([slug, skill], i) => (
                  <tr key={slug} className={`border-b border-border-crisp last:border-0 ${i % 2 === 1 ? "bg-surface-gray/40" : ""}`}>
                    <td className="p-4">
                      <Link href={`/hire/${slug}`} className="font-semibold font-body text-sm text-tech-blue-deep hover:text-electric-violet transition-colors">
                        {skill.label}
                      </Link>
                    </td>
                    {CITY_COLS.map(citySlug => {
                      const rate = getRate(slug, citySlug);
                      const isHighest = rate === Math.max(...CITY_COLS.map(c => getRate(slug, c)));
                      return (
                        <td key={citySlug} className="text-center p-4">
                          <span className={`text-sm font-semibold font-body ${isHighest ? "text-electric-violet" : "text-tech-blue-deep"}`}>
                            ${rate}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-surface-gray border-t border-border-crisp">
            <p className="text-xs font-body text-on-surface-variant">
              <span className="text-electric-violet font-semibold">Purple</span> = highest rate for that skill.
              All rates in USD/hr.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-16">
        <div className="bg-tech-blue-deep text-white rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold font-headline mb-2">Ready to get matched?</h2>
            <p className="font-body text-on-primary-container text-sm max-w-md">
              Post a job brief and our AI finds the top 5 candidates at the right rate in 60 seconds.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/post-job"
              className="px-7 py-3 bg-electric-violet text-white rounded-full text-sm font-semibold font-body hover:scale-[1.02] transition-transform whitespace-nowrap">
              Post a job
            </Link>
            <Link href="/freelancer/join"
              className="px-7 py-3 border border-white/30 text-white rounded-full text-sm font-semibold font-body hover:bg-white/10 transition-colors whitespace-nowrap">
              Join as freelancer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
