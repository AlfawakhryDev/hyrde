import type { Metadata } from "next";
import Link from "next/link";
import { ENTERPRISE, SOLUTIONS } from "@/content/marketing";
import CostOfHiringSection from "@/components/CostOfHiringSection";

export const metadata: Metadata = {
  title: ENTERPRISE.meta.title,
  description: ENTERPRISE.meta.description,
};

export default function EnterprisePage() {
  return (
    <div className="bg-surface-gray">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-tech-blue-deep">
        <div className="glow-accent absolute -top-32 -right-20 w-[40rem] h-[40rem] rounded-full bg-electric-violet" />
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-20 relative z-10">
          <span className="text-xs font-semibold font-body text-ai-glow uppercase tracking-widest">
            {ENTERPRISE.hero.eyebrow}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-white mt-4 mb-5 leading-[1.05] max-w-3xl">
            {ENTERPRISE.hero.heading}
          </h1>
          <p className="font-body text-white/70 text-lg leading-relaxed max-w-2xl mb-8">
            {ENTERPRISE.hero.sub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={ENTERPRISE.hero.primaryCta.href}
              className="bg-electric-violet text-white font-semibold font-body px-7 py-3.5 rounded-full hover:scale-[1.03] transition-transform text-sm"
            >
              {ENTERPRISE.hero.primaryCta.label}
            </Link>
            <Link
              href={ENTERPRISE.hero.secondaryCta.href}
              className="bg-white/10 border border-white/20 text-white font-semibold font-body px-7 py-3.5 rounded-full hover:bg-white/20 transition-colors text-sm"
            >
              {ENTERPRISE.hero.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip (placeholder logos) ── */}
      <section className="bg-white border-b border-border-crisp py-8">
        <div className="max-w-[1280px] mx-auto px-6 md:px-12">
          <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest text-center mb-5">
            {ENTERPRISE.trust.label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {ENTERPRISE.trust.logos.map(logo => (
              <span
                key={logo}
                className="text-lg md:text-xl font-bold font-headline text-on-surface-variant/30 tracking-tight"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep mb-4 leading-tight">
            Everything a large team needs to hire with confidence
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed">
            The speed of Hyrde matching, wrapped in the controls, security, and support enterprise procurement
            expects.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ENTERPRISE.features.map(feature => (
            <div
              key={feature.title}
              className="rounded-xl border border-border-crisp bg-white p-6 hover:border-electric-violet/30 transition-colors"
            >
              <span className="w-11 h-11 rounded-lg bg-electric-violet/10 flex items-center justify-center mb-4">
                <span
                  className="material-symbols-outlined text-electric-violet"
                  style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
                >
                  {feature.icon}
                </span>
              </span>
              <h3 className="font-bold font-headline text-tech-blue-deep mb-2">{feature.title}</h3>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solution Packages ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 border-t border-border-crisp">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Custom solutions</span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep mt-3 mb-4 leading-tight">
            Packages built around how you hire at scale
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed">
            From replacing your staffing agency to building an entire on-demand workforce — there&apos;s a plan for every stage of scale.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {SOLUTIONS.map(pkg => (
            <div
              key={pkg.id}
              className={`rounded-2xl border p-7 flex flex-col ${
                pkg.highlight
                  ? "border-electric-violet bg-electric-violet shadow-[0_8px_40px_rgba(91,79,207,0.30)]"
                  : "border-border-crisp bg-white"
              }`}
            >
              {pkg.badge && (
                <span className={`text-[10px] font-semibold font-body uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-4 ${
                  pkg.highlight ? "bg-white/20 text-white" : "bg-electric-violet/10 text-electric-violet"
                }`}>
                  {pkg.badge}
                </span>
              )}
              <p className={`text-xs font-semibold font-body uppercase tracking-widest mb-2 ${pkg.highlight ? "text-white/70" : "text-electric-violet"}`}>
                {pkg.tagline}
              </p>
              <h3 className={`text-2xl font-bold font-headline mb-0.5 ${pkg.highlight ? "text-white" : "text-tech-blue-deep"}`}>
                {pkg.name}
              </h3>
              <p className={`text-3xl font-bold font-headline leading-none mb-1 ${pkg.highlight ? "text-white" : "text-tech-blue-deep"}`}>
                {pkg.price}
              </p>
              <p className={`text-xs font-body mb-6 ${pkg.highlight ? "text-white/55" : "text-on-surface-variant"}`}>
                {pkg.priceNote}
              </p>
              <ul className="space-y-2.5 mb-7 flex-1">
                {pkg.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm font-body">
                    <span
                      className={`material-symbols-outlined shrink-0 mt-0.5 ${pkg.highlight ? "text-white/70" : "text-electric-violet"}`}
                      style={{ fontSize: "14px" }}
                    >check</span>
                    <span className={pkg.highlight ? "text-white/90" : "text-on-surface-variant"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.cta.href}
                className={`block text-center font-semibold font-body text-sm py-3 rounded-full transition-all ${
                  pkg.highlight
                    ? "bg-white text-electric-violet hover:bg-white/90"
                    : "bg-electric-violet text-white hover:opacity-90"
                }`}
              >
                {pkg.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── PART 3 stats (reused — the ROI argument) ── */}
      <CostOfHiringSection compact />

      {/* ── Book a demo ── */}
      <section id="demo" className="max-w-[920px] mx-auto px-6 md:px-12 py-20 scroll-mt-20">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
            {ENTERPRISE.demo.eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep mt-3 mb-4">
            {ENTERPRISE.demo.heading}
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed max-w-xl mx-auto">
            {ENTERPRISE.demo.sub}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border-crisp shadow-sm p-8 md:p-10 text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-electric-violet/10 mb-5">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "30px", fontVariationSettings: "'FILL' 1" }}>
              calendar_month
            </span>
          </span>
          <h3 className="text-xl md:text-2xl font-bold font-headline text-tech-blue-deep mb-2">
            Request access &amp; we&apos;ll set up your demo
          </h3>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed mb-7 max-w-md mx-auto">
            Tell us how your team hires in 90 seconds. A founding-team member will reach out within one business day to walk you through Hyrde tailored to your needs.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/get-started"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-electric-violet text-white font-semibold font-body text-sm px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              {ENTERPRISE.demo.cta.label}
            </Link>
            <a
              href="mailto:abdelrahman@hyrde.net"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-border-crisp text-tech-blue-deep font-semibold font-body text-sm px-8 py-3.5 rounded-full hover:border-electric-violet transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>mail</span>
              Email sales
            </a>
          </div>
          <p className="text-xs font-body text-on-surface-variant/70 mt-5">{ENTERPRISE.demo.fields.note}</p>
        </div>
      </section>
    </div>
  );
}
