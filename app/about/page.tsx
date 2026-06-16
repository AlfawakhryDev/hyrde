import type { Metadata } from "next";
import Link from "next/link";
import { ABOUT } from "@/content/marketing";
import CostOfHiringSection from "@/components/CostOfHiringSection";

export const metadata: Metadata = {
  title: ABOUT.meta.title,
  description: ABOUT.meta.description,
};

export default function AboutPage() {
  return (
    <div className="bg-surface-gray">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="glow-accent absolute -top-32 -right-24 w-[36rem] h-[36rem] rounded-full bg-electric-violet" />
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-16 relative z-10">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
            {ABOUT.hero.eyebrow}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-tech-blue-deep mt-4 mb-5 leading-[1.05] max-w-3xl">
            {ABOUT.hero.heading}
          </h1>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-2xl mb-8">
            {ABOUT.hero.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={ABOUT.closing.cta.href}
              className="bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[0.97] transition-transform text-sm"
            >
              {ABOUT.closing.cta.label}
            </Link>
            <Link
              href={ABOUT.closing.ctaSecondary.href}
              className="bg-white border border-border-crisp text-tech-blue-deep font-semibold font-body px-6 py-3 rounded-full hover:border-electric-violet transition-colors text-sm"
            >
              {ABOUT.closing.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep leading-tight">
            {ABOUT.mission.heading}
          </h2>
          <div className="space-y-5">
            {ABOUT.mission.body.map((p, i) => (
              <p key={i} className="font-body text-on-surface-variant text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── The problem ── */}
      <section className="bg-white border-y border-border-crisp py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep mb-8">
            {ABOUT.problem.heading}
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {ABOUT.problem.points.map(point => (
              <div key={point.title} className="rounded-xl border border-border-crisp p-6 bg-surface-gray">
                <span className="w-10 h-10 rounded-lg bg-electric-violet/10 flex items-center justify-center mb-4">
                  <span
                    className="material-symbols-outlined text-electric-violet"
                    style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {point.icon}
                  </span>
                </span>
                <h3 className="font-bold font-headline text-tech-blue-deep mb-2">{point.title}</h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Hyrde works ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep">
            {ABOUT.how.heading}
          </h2>
          <p className="font-body text-electric-violet font-semibold mt-1">{ABOUT.how.tagline}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {ABOUT.how.steps.map(step => (
            <div
              key={step.n}
              className="rounded-xl border border-border-crisp bg-white p-6 flex gap-5 hover:border-electric-violet/30 transition-colors"
            >
              <span className="text-3xl font-bold font-headline text-electric-violet/30 shrink-0 leading-none">
                {step.n}
              </span>
              <div>
                <h3 className="font-bold font-headline text-tech-blue-deep mb-2">{step.title}</h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PART 3 stats (reused) ── */}
      <CostOfHiringSection compact />

      {/* ── Who it's for ── */}
      <section className="bg-white border-y border-border-crisp py-16">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep mb-8">
            {ABOUT.audience.heading}
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {ABOUT.audience.columns.map(col => (
              <div key={col.title} className="rounded-2xl border border-border-crisp p-8 bg-surface-gray flex flex-col">
                <span className="w-12 h-12 rounded-xl ai-match-gradient flex items-center justify-center mb-5">
                  <span
                    className="material-symbols-outlined text-white"
                    style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {col.icon}
                  </span>
                </span>
                <h3 className="text-xl font-bold font-headline text-tech-blue-deep mb-2">{col.title}</h3>
                <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-6 flex-1">{col.body}</p>
                <Link
                  href={col.cta.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold font-body text-electric-violet hover:gap-2 transition-all w-fit"
                >
                  {col.cta.label}
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    arrow_forward
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The vision ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep leading-tight">
            {ABOUT.vision.heading}
          </h2>
          <div className="space-y-5">
            {ABOUT.vision.body.map((p, i) => (
              <p key={i} className="font-body text-on-surface-variant text-base leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing ── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1280px] mx-auto rounded-2xl bg-tech-blue-deep px-8 py-16 md:py-20 text-center relative overflow-hidden">
          <div className="glow-accent absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-electric-violet" />
          <p className="relative z-10 text-2xl md:text-4xl font-bold font-headline text-white max-w-3xl mx-auto leading-tight mb-8">
            {ABOUT.closing.line}
          </p>
          <div className="relative z-10 flex flex-wrap gap-3 justify-center">
            <Link
              href={ABOUT.closing.cta.href}
              className="bg-electric-violet text-white font-semibold font-body px-7 py-3.5 rounded-full hover:scale-[1.03] transition-transform text-sm"
            >
              {ABOUT.closing.cta.label}
            </Link>
            <Link
              href={ABOUT.closing.ctaSecondary.href}
              className="bg-white/10 text-white border border-white/20 font-semibold font-body px-7 py-3.5 rounded-full hover:bg-white/20 transition-colors text-sm"
            >
              {ABOUT.closing.ctaSecondary.label}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
