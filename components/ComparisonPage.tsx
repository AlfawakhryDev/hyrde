import Link from "next/link";
import type { Competitor } from "@/lib/compare";

/**
 * Shared layout for every "[competitor] alternative" switcher page.
 * Server component — renders FAQ JSON-LD for rich-result eligibility.
 */
export default function ComparisonPage({ c }: { c: Competitor }) {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="bg-surface-gray">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-tech-blue-deep">
        <div className="glow-accent absolute -top-32 -right-20 w-[40rem] h-[40rem] rounded-full bg-electric-violet" />
        <div className="max-w-[920px] mx-auto px-6 md:px-12 pt-24 pb-16 relative z-10">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full mb-5">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
            <span className="text-[11px] font-semibold font-body text-white uppercase tracking-widest">{c.eyebrow}</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-[1.08] mb-5 max-w-3xl">
            {c.h1}
          </h1>
          <p className="font-body text-white/75 text-lg leading-relaxed max-w-2xl mb-8">
            {c.intro}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/get-started"
              className="inline-flex items-center gap-2 bg-electric-violet text-white font-semibold font-body px-7 py-3.5 rounded-full hover:scale-[1.03] transition-transform text-sm">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Get a vetted shortlist free
            </Link>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold font-body px-7 py-3.5 rounded-full hover:bg-white/20 transition-colors text-sm">
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Pain points: them vs Hyrde ── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-12 py-16">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Why people switch</span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep mt-3 leading-tight">
            What hurts on {c.name} — and how Hyrde fixes it
          </h2>
        </div>

        <div className="space-y-4">
          {c.painPoints.map(p => (
            <div key={p.title} className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-5 pb-3">
                <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-red-500" style={{ fontSize: "20px" }}>{p.icon}</span>
                </span>
                <h3 className="font-bold font-headline text-tech-blue-deep text-base">{p.title}</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-px bg-border-crisp">
                <div className="bg-white px-6 py-4">
                  <p className="text-[11px] font-semibold font-body text-red-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>close</span>
                    On {c.name}
                  </p>
                  <p className="text-sm font-body text-on-surface-variant leading-relaxed">{p.them}</p>
                </div>
                <div className="bg-electric-violet/[0.04] px-6 py-4">
                  <p className="text-[11px] font-semibold font-body text-electric-violet uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    On Hyrde
                  </p>
                  <p className="text-sm font-body text-on-surface leading-relaxed">{p.hyrde}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fee comparison ── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-12 pb-16">
        <div className="bg-white rounded-2xl border border-border-crisp overflow-hidden">
          <div className="px-6 md:px-8 py-5 border-b border-border-crisp">
            <h2 className="text-xl font-bold font-headline text-tech-blue-deep">The real cost, side by side</h2>
          </div>
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="text-left border-b border-border-crisp">
                <th className="px-6 md:px-8 py-3 font-semibold text-on-surface-variant"></th>
                <th className="px-4 py-3 font-semibold text-on-surface-variant">{c.name}</th>
                <th className="px-4 py-3 font-semibold text-electric-violet">Hyrde</th>
              </tr>
            </thead>
            <tbody>
              {c.fees.map((f, i) => (
                <tr key={f.label} className={i < c.fees.length - 1 ? "border-b border-border-crisp" : ""}>
                  <td className="px-6 md:px-8 py-3.5 font-semibold text-tech-blue-deep">{f.label}</td>
                  <td className="px-4 py-3.5 text-on-surface-variant">{f.them}</td>
                  <td className="px-4 py-3.5 text-tech-blue-deep font-semibold">{f.hyrde}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Feature checklist ── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-12 pb-16">
        <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-6">Feature by feature</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {c.features.map(f => (
            <div key={f.feature} className="bg-white rounded-xl border border-border-crisp p-4">
              <p className="text-sm font-semibold font-body text-tech-blue-deep mb-2">{f.feature}</p>
              <div className="flex items-center justify-between text-xs font-body">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-red-400" style={{ fontSize: "15px" }}>
                    {f.them === false ? "cancel" : "remove"}
                  </span>
                  {c.name}: {f.them === false ? "No" : f.them}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-body text-electric-violet mt-1.5">
                <span className="material-symbols-outlined" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Hyrde: {f.hyrde === true ? "Yes" : f.hyrde}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-12 pb-16">
        <h2 className="text-2xl font-bold font-headline text-tech-blue-deep mb-6">Questions clients ask</h2>
        <div className="space-y-3">
          {c.faqs.map(f => (
            <details key={f.q} className="group bg-white rounded-xl border border-border-crisp px-5 py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="text-sm font-semibold font-body text-tech-blue-deep pr-4">{f.q}</span>
                <span className="material-symbols-outlined text-electric-violet group-open:rotate-180 transition-transform shrink-0" style={{ fontSize: "20px" }}>expand_more</span>
              </summary>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-[920px] mx-auto px-6 md:px-12 pb-20">
        <div className="bg-tech-blue-deep rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-electric-violet/5 pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold font-headline text-white mb-3">
              Done gambling on {c.name}?
            </h2>
            <p className="font-body text-white/70 mb-8 max-w-lg mx-auto">
              Describe the role once. Get ~5 AI-vetted candidates in 60 seconds. Pay a flat 8% only when you hire.
            </p>
            <Link href="/get-started"
              className="inline-flex items-center gap-2 bg-electric-violet text-white font-semibold font-body px-8 py-4 rounded-full hover:scale-[1.03] transition-transform text-sm">
              <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              Get my free shortlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
