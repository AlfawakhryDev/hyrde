import type { Metadata } from "next";
import Link from "next/link";
import { PRICING } from "@/content/marketing";

export const metadata: Metadata = {
  title: PRICING.meta.title,
  description: PRICING.meta.description,
};

export default function PricingPage() {
  return (
    <div className="bg-surface-gray min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="glow-accent absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-electric-violet" />
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-24 pb-12 relative z-10 text-center">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
            {PRICING.eyebrow}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-headline text-tech-blue-deep mt-4 mb-5 leading-[1.05]">
            {PRICING.heading}
          </h1>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed max-w-2xl mx-auto">
            {PRICING.subheading}
          </p>
        </div>
      </section>

      {/* ── Tiers ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-8">
        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PRICING.tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-2xl p-7 flex flex-col relative ${
                tier.loud
                  ? "ai-match-gradient text-white"
                  : tier.highlight
                  ? "bg-white border-2 border-electric-violet shadow-lg"
                  : "bg-white border border-border-crisp"
              }`}
            >
              {tier.badge && (
                <span
                  className={`absolute top-5 right-5 text-[10px] font-semibold font-body px-2.5 py-1 rounded-full uppercase tracking-widest ${
                    tier.loud
                      ? "bg-white/20 text-white"
                      : tier.highlight
                      ? "bg-electric-violet/10 text-electric-violet"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {tier.badge}
                </span>
              )}

              <p
                className={`text-xs font-semibold font-body uppercase tracking-widest ${
                  tier.loud ? "text-ai-glow" : "text-on-surface-variant"
                }`}
              >
                {tier.audience}
              </p>
              <h2
                className={`text-2xl font-bold font-headline mt-1 mb-4 ${
                  tier.loud ? "text-white" : "text-tech-blue-deep"
                }`}
              >
                {tier.name}
              </h2>

              <div className="mb-5">
                <span
                  className={`text-5xl font-bold font-headline tracking-tight ${
                    tier.loud ? "text-white" : "text-tech-blue-deep"
                  }`}
                >
                  {tier.price}
                </span>
                <p className={`text-sm font-body mt-1 ${tier.loud ? "text-white/70" : "text-on-surface-variant"}`}>
                  {tier.priceNote}
                </p>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span
                      className="material-symbols-outlined mt-0.5 shrink-0"
                      style={{
                        fontSize: "18px",
                        fontVariationSettings: "'FILL' 1",
                        color: tier.loud ? "#fff" : "#5B4FCF",
                      }}
                    >
                      check_circle
                    </span>
                    <span
                      className={`text-sm font-body leading-snug ${
                        tier.loud ? "text-white/90" : "text-on-surface"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.cta.href}
                className={`text-center font-semibold font-body px-6 py-3 rounded-full transition-all text-sm ${
                  tier.loud
                    ? "bg-white text-tech-blue-deep hover:scale-[0.98]"
                    : tier.highlight
                    ? "bg-electric-violet text-white hover:scale-[0.98]"
                    : "bg-tech-blue-deep text-white hover:scale-[0.98]"
                }`}
              >
                {tier.cta.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Enterprise callout ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-10">
        <div className="rounded-2xl bg-tech-blue-deep p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="glow-accent absolute -right-20 -top-20 w-80 h-80 rounded-full bg-electric-violet" />
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold font-headline text-white mb-2">
              {PRICING.enterpriseCallout.heading}
            </h2>
            <p className="font-body text-white/70 text-sm leading-relaxed">
              {PRICING.enterpriseCallout.body}
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
            <Link
              href={PRICING.enterpriseCallout.cta.href}
              className="bg-electric-violet text-white font-semibold font-body px-6 py-3 rounded-full hover:scale-[1.03] transition-transform text-sm"
            >
              {PRICING.enterpriseCallout.cta.label}
            </Link>
            <Link
              href={PRICING.enterpriseCallout.link.href}
              className="bg-white/10 border border-white/20 text-white font-semibold font-body px-6 py-3 rounded-full hover:bg-white/20 transition-colors text-sm"
            >
              {PRICING.enterpriseCallout.link.label}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="max-w-[800px] mx-auto px-6 md:px-12 py-12">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep mb-8 text-center">
          Questions, answered
        </h2>
        <div className="space-y-3">
          {PRICING.faqs.map(faq => (
            <details
              key={faq.q}
              className="group bg-white rounded-xl border border-border-crisp p-5 [&_summary]:cursor-pointer"
            >
              <summary className="flex items-center justify-between font-semibold font-body text-tech-blue-deep text-sm list-none">
                {faq.q}
                <span
                  className="material-symbols-outlined text-on-surface-variant transition-transform group-open:rotate-45"
                  style={{ fontSize: "20px" }}
                >
                  add
                </span>
              </summary>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed mt-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
