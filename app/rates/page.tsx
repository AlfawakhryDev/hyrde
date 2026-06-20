import Link from "next/link";
import type { Metadata } from "next";
import { SKILLS, CITIES, getRate } from "@/lib/data";

const EDITION = "2026";
const UPDATED_ISO = "2026-06-15";
const UPDATED_LABEL = "June 2026";

export const metadata: Metadata = {
  title: `Hyrde Freelance Rate Index ${EDITION} — Rates for 24 Skills Across 12 Cities`,
  description:
    `The Hyrde Freelance Rate Index (${EDITION}) tracks real hourly rates for 24 freelance skills across 12 global cities, with junior/mid/senior ranges and a transparent methodology. Free to cite.`,
  alternates: { canonical: "/rates" },
  openGraph: {
    title: `Hyrde Freelance Rate Index ${EDITION}`,
    description:
      `Real hourly rates for 24 freelance skills across 12 global cities — junior, mid, and senior ranges. Free to cite.`,
    url: "/rates",
  },
};

const CATEGORIES = ["Engineering", "Design", "Data", "Writing", "Marketing", "Creative"];
const CITY_COLS  = ["remote", "new-york", "london", "dubai", "cairo", "berlin"] as const;

export default function RatesPage() {
  const skillEntries = Object.entries(SKILLS);
  const cityEntries  = Object.entries(CITIES);

  const byCategory = CATEGORIES.reduce<Record<string, [string, typeof SKILLS[string]][]>>((acc, cat) => {
    acc[cat] = skillEntries.filter(([, s]) => s.category === cat);
    return acc;
  }, {});

  const topSkills = skillEntries.slice(0, 8);

  // ── Headline findings (computed from the dataset) ──────────────────
  const avgAll = Math.round(skillEntries.reduce((sum, [, s]) => sum + s.avgRate, 0) / skillEntries.length);
  const topSkill = skillEntries.reduce((a, b) => (b[1].avgRate > a[1].avgRate ? b : a));
  const entrySkill = skillEntries.reduce((a, b) => (b[1].avgRate < a[1].avgRate ? b : a));
  const priciestCity = cityEntries.filter(([, c]) => c.label !== "Remote").reduce((a, b) => (b[1].multiplier > a[1].multiplier ? b : a));
  const valueCity = cityEntries.filter(([, c]) => c.label !== "Remote").reduce((a, b) => (b[1].multiplier < a[1].multiplier ? b : a));
  const priciestPct = Math.round((priciestCity[1].multiplier - 1) * 100);
  const valuePct = Math.round((1 - valueCity[1].multiplier) * 100);

  const findings = [
    { stat: `$${avgAll}/hr`, label: `Global average across all 24 skills (mid-level)` },
    { stat: `$${topSkill[1].avgRate}/hr`, label: `Highest-paid skill: ${topSkill[1].label}` },
    { stat: `$${entrySkill[1].avgRate}/hr`, label: `Most accessible: ${entrySkill[1].label}` },
    { stat: `+${priciestPct}%`, label: `${priciestCity[1].label} commands the biggest premium` },
    { stat: `−${valuePct}%`, label: `${valueCity[1].label} offers the best value for clients` },
    { stat: `$0 vs 22–34%`, label: `Hyrde (early access) vs legacy-platform effective take rate` },
  ];

  // ── Dataset structured data (schema.org/Dataset) ───────────────────
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Hyrde Freelance Rate Index ${EDITION}`,
    description:
      `Hourly freelance rates for 24 skills across 12 global cities, with junior, mid, and senior ranges. Published by Hyrde.`,
    url: "https://hyrde.net/rates",
    dateModified: UPDATED_ISO,
    creator: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
    license: "https://hyrde.net/rates",
    isAccessibleForFree: true,
    keywords: ["freelance rates", "hourly rates", "developer rates", "designer rates", "freelance pricing 2026"],
  };

  return (
    <div className="min-h-screen bg-surface-gray relative overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }} />

      {/* Glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-electric-violet rounded-full glow-accent -mr-48 -mt-24 pointer-events-none" />

      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-10 relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border-crisp mb-6">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "16px", fontVariationSettings: "'FILL' 1" }}>trending_up</span>
          <span className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest">{EDITION} Edition · Updated {UPDATED_LABEL}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface mb-4 leading-tight">
          The Hyrde Freelance Rate Index
        </h1>
        <p className="text-lg font-body text-on-surface-variant max-w-2xl">
          Real market hourly rates across <strong className="text-on-surface">24 skills</strong> and <strong className="text-on-surface">12 cities</strong>, with junior, mid, and senior ranges. Whether you&apos;re hiring or freelancing, know what the work is actually worth. Free to cite — see <a href="#methodology" className="text-electric-violet underline underline-offset-2">methodology</a>.
        </p>
      </section>

      {/* Key findings */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-14 relative">
        <h2 className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-4">Key findings</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {findings.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-border-crisp">
              <p className="text-2xl md:text-3xl font-bold font-headline text-electric-violet mb-1">{f.stat}</p>
              <p className="text-xs font-body text-on-surface-variant leading-snug">{f.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills by category */}
      {CATEGORIES.map(cat => {
        const skills = byCategory[cat];
        if (!skills?.length) return null;
        return (
          <section key={cat} className="max-w-[1280px] mx-auto px-6 md:px-12 mb-12">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-4 flex items-center gap-3">
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
                      <p className="font-bold font-body text-on-surface text-sm group-hover:text-electric-violet transition-colors mb-1.5">
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
                      <p className="text-2xl font-bold font-headline text-on-surface">${skill.avgRate}</p>
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
                        <span className="text-xs font-semibold font-body text-on-surface w-14 text-right shrink-0">
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
          <h2 className="text-2xl font-bold font-headline text-on-surface">How location affects rates</h2>
          <p className="font-body text-on-surface-variant mt-1 text-sm">Rates are multiplied by local market demand and cost of living.</p>
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
                      <Link href={`/hire/${slug}`} className="font-semibold font-body text-sm text-on-surface hover:text-electric-violet transition-colors">
                        {skill.label}
                      </Link>
                    </td>
                    {CITY_COLS.map(citySlug => {
                      const rate = getRate(slug, citySlug);
                      const isHighest = rate === Math.max(...CITY_COLS.map(c => getRate(slug, c)));
                      return (
                        <td key={citySlug} className="text-center p-4">
                          <span className={`text-sm font-semibold font-body ${isHighest ? "text-electric-violet" : "text-on-surface"}`}>
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

      {/* Methodology */}
      <section id="methodology" className="max-w-[800px] mx-auto px-6 md:px-12 mb-12 scroll-mt-20">
        <h2 className="text-2xl font-bold font-headline text-on-surface mb-4">Methodology</h2>
        <div className="space-y-4 font-body text-on-surface-variant text-sm leading-relaxed">
          <p>
            The Hyrde Freelance Rate Index tracks indicative hourly rates for 24 in-demand freelance skills across 12 global markets. Mid-level rates are the baseline; junior figures are estimated at ~60% and senior at ~150% of the mid rate, consistent with observed spreads across the contract market.
          </p>
          <p>
            City figures apply a local multiplier to each baseline, reflecting prevailing cost of living and demand — from a premium in {priciestCity[1].label} (+{priciestPct}%) to strong value in {valueCity[1].label} (−{valuePct}%). &quot;Remote&quot; reflects the global blended rate.
          </p>
          <p>
            Rates are indicative benchmarks for budgeting and pricing decisions, not quotes. Fee comparisons reference publicly reported 2026 effective take rates on major marketplaces (service fees, contract-initiation charges, and payment markups combined), versus Hyrde, which is free to hire during early access (paid plans planned for later). The Index is refreshed periodically; this is the {UPDATED_LABEL} edition.
          </p>
        </div>
      </section>

      {/* Cite this index */}
      <section className="max-w-[800px] mx-auto px-6 md:px-12 mb-16">
        <div className="bg-white rounded-2xl border border-border-crisp p-6">
          <h2 className="text-lg font-bold font-headline text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "20px" }}>format_quote</span>
            Cite this Index
          </h2>
          <p className="font-body text-on-surface-variant text-sm mb-4">
            The Hyrde Freelance Rate Index is free to reference. Please attribute with a link back to this page.
          </p>
          <div className="bg-surface-gray rounded-lg border border-border-crisp p-4">
            <code className="text-xs font-mono text-on-surface leading-relaxed block">
              Source: Hyrde Freelance Rate Index {EDITION}, hyrde.net/rates
            </code>
          </div>
          <p className="font-body text-on-surface-variant text-xs mt-4">
            Want the deeper picture? Read{" "}
            <Link href="/guides/cost-to-hire-freelance-developer" className="text-electric-violet underline underline-offset-2">how much it costs to hire a freelance developer</Link>{" "}
            (for clients) or{" "}
            <Link href="/guides/freelance-rates-2026" className="text-electric-violet underline underline-offset-2">what to charge as a freelancer in 2026</Link>.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-16">
        <div className="bg-tech-blue-deep text-white rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl font-bold font-headline mb-2">Ready to get matched?</h2>
            <p className="font-body text-on-primary-container text-sm max-w-md">
              Post a job brief and our AI finds the top 5 candidates at the right rate in 60 seconds — free to hire during early access.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/get-started"
              className="px-7 py-3 bg-electric-violet text-white rounded-full text-sm font-semibold font-body hover:scale-[1.02] transition-transform whitespace-nowrap">
              Hire talent
            </Link>
            <Link href="/join"
              className="px-7 py-3 border border-white/30 text-white rounded-full text-sm font-semibold font-body hover:bg-white/10 transition-colors whitespace-nowrap">
              Join as freelancer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
