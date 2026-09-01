import Link from "next/link";
import LiveTasks from "@/components/home/LiveTasks";
import { HyrdeMark } from "@/components/Logo";
import HeroBackdrop from "@/components/home/HeroBackdrop";
import MatchDemo from "@/components/home/MatchDemo";
import AliveGrid from "@/components/home/AliveGrid";
import HowItWorks from "@/components/home/HowItWorks";
import GlobalPay from "@/components/home/GlobalPay";
import OutcomeShowcase from "@/components/home/OutcomeShowcase";
import { tFor, type Locale } from "@/lib/i18n";
import { faqFor, faqJsonLd } from "@/lib/faq";
import BookDemo from "@/components/BookDemo";

// ── Shared marketing homepage ─────────────────────────────────────────────────
// Rendered by both / (en) and /de (de). Every string comes from the dictionary
// via tFor(locale); the two animated paper demos take the same locale so /de is
// a full mirror, German demos included. Server component (tFor is pure) so both
// routes stay static.

const CHIP_CLUSTER = [
  { label: "Development", x: "6%",  y: "12%" },
  { label: "Research",    x: "62%", y: "6%"  },
  { label: "Finance",     x: "74%", y: "38%" },
  { label: "Design",      x: "8%",  y: "58%" },
  { label: "Operations",  x: "58%", y: "72%" },
  { label: "Legal",       x: "22%", y: "84%" },
];

// Categories shown in the "any expertise" section — non-tech first, so a
// finance or family-office buyer sees themselves before the code. Each links to
// a real /hire/[skill] page.
const CATEGORIES = [
  { name: "Research & Analysis", example: "A market map of the GCC family-office space.", href: "/hire/market-research-analyst" },
  { name: "Finance & Modeling",  example: "An investor-ready three-statement model.",     href: "/hire/financial-modeler" },
  { name: "Business & Admin",    example: "An executive assistant for inbox and scheduling.", href: "/hire/executive-assistant" },
  { name: "Legal & Compliance",  example: "Contract review and redlining.",                href: "/hire/contract-specialist" },
  { name: "Design & Brand",      example: "A pitch deck that tells your story.",           href: "/hire/presentation-designer" },
  { name: "Writing & Docs",      example: "A business plan, board-ready.",                 href: "/hire/business-plan-writer" },
  { name: "Marketing & Growth",  example: "A go-to-market plan and launch content.",       href: "/hire/growth-marketer" },
  { name: "Development & Data",   example: "An MVP, or a production data pipeline.",        href: "/hire/fullstack-developer" },
];


function Kicker({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  const tone = dark ? "text-white/45" : "text-[#8A887E]";
  const rule = dark ? "bg-white/20" : "bg-[#D8D4C8]";
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className={`font-mono text-[11px] tracking-[0.12em] ${tone}`}>{n}</span>
      <span className={`h-px w-7 ${rule}`} aria-hidden="true" />
      <span className={`font-mono text-[10.5px] uppercase tracking-[0.22em] ${tone}`}>{label}</span>
    </div>
  );
}

export default function HomePage({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale);
  const guidesHref = locale === "ar" ? "/ar/guides" : "/guides";
  const compare: [string, string][] = [
    ["Hyrde vs Upwork", "/upwork-alternative"],
    ["Hyrde vs Fiverr", "/fiverr-alternative"],
    ["Hyrde vs Toptal", "/toptal-alternative"],
    [t("home.compareGuides"), guidesHref],
    [t("home.compareTalent"), "/hire"],
  ];
  // Top 6 FAQs surface on the homepage (visible content backs the FAQPage schema);
  // the full set lives on /faq. Answer engines quote these directly.
  const faqs = faqFor(locale).slice(0, 6);
  const faqMoreHref = locale === "de" ? "/de/faq" : "/faq";
  const faqLd = faqJsonLd(faqs);
  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Hyrde",
    serviceType: "AI-matched, interview-vetted freelance talent",
    provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
    areaServed: "Worldwide",
    description:
      locale === "de"
        ? "Beschreibe ein Ergebnis oder eine Aufgabe; die KI vermittelt einen im Interview geprüften Spezialisten. Kein Bieten, kein Angebots-Spam."
        : "Describe an outcome or task; the AI matches one interview-vetted specialist. No bidding, no proposal spam.",
    offers: [
      { "@type": "Offer", name: "Early access", price: "0", priceCurrency: "USD" },
      { "@type": "Offer", name: "Pro", price: "20", priceCurrency: "USD" },
      { "@type": "Offer", name: "Scale", price: "200", priceCurrency: "USD" },
    ],
  };
  return (
    <div className="min-h-screen bg-paper">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />

      {/* ── Hero — outcomes, not gigs ── */}
      <section className="relative -mt-[104px] min-h-[100svh] flex items-center overflow-hidden bg-[#100F0B]">
        <HeroBackdrop />
        <div className="relative w-full mx-auto max-w-[1180px] px-5 md:px-8 pt-[120px] pb-12 md:pt-[124px]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">

            {/* Left — the pitch */}
            <div>
              <div className="flex items-center gap-2.5 text-white/90 mb-8">
                <HyrdeMark size={22} />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">{t("home.heroKicker")}</span>
              </div>

              <h1 className="font-display font-light text-[#F7F5F0] leading-[1.04] tracking-[-0.015em] text-[clamp(40px,5.4vw,70px)] max-w-[13ch]">
                {t("home.heroH1pre")}<em className="italic font-normal text-white">{t("home.heroH1em")}</em>.
              </h1>

              <p className="text-white/55 text-[15.5px] md:text-[16.5px] max-w-[500px] leading-[1.62] mt-8">
                {t("home.heroSub")}
              </p>

              <div className="mt-8 border-t border-white/10 pt-6 max-w-[460px] flex flex-col gap-2.5">
                {[t("home.heroB1"), t("home.heroB2"), t("home.heroB3")].map((b, i) => (
                  <div key={b} className="flex items-baseline gap-3.5 text-[13.5px] text-white/65 leading-snug">
                    <span className="font-mono text-[11px] text-white/30 shrink-0">0{i + 1}</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-9">
                <BookDemo variant="hero" />
                <Link
                  href="/signup"
                  className="h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors"
                >
                  {t("home.heroCta1")}
                </Link>
                <Link
                  href="/signup?next=%2Fvetting"
                  className="text-sm font-medium text-white/70 hover:text-white underline decoration-white/25 underline-offset-[5px] hover:decoration-white/60 transition-colors"
                >
                  {t("home.heroCta2")}
                </Link>
              </div>
            </div>

            {/* Right — the outcome plan, building itself */}
            <div className="lg:pl-2">
              <OutcomeShowcase locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Single tasks too — the matching engine, live ── */}
      <section className="relative overflow-hidden bg-[#100F0B]">
        <div className="relative mx-auto max-w-[1180px] px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 lg:pr-2">
            <MatchDemo locale={locale} />
          </div>

          <div className="order-1 lg:order-2">
            <Kicker n="01" label={t("home.singleKicker")} dark />
            <h2 className="font-display font-light text-[#F7F5F0] leading-[1.06] tracking-[-0.015em] text-[clamp(32px,4.6vw,54px)] max-w-[13ch]">
              {t("home.singleH1pre")}<em className="italic font-normal">{t("home.singleH1em")}</em>.
            </h2>
            <p className="text-white/55 text-[15.5px] md:text-[16px] max-w-[440px] leading-[1.62] mt-7">
              {t("home.singleSub")}
            </p>
            <Link
              href="/signup"
              className="mt-9 h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors"
            >
              {t("home.singleCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Any expertise, not just tech ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 md:pt-32">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-7 bg-[#D8D4C8]" aria-hidden="true" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#8A887E]">Any expertise</span>
        </div>
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,52px)] max-w-[18ch]">
          Not just tech. <em className="italic font-normal">Any</em> defined outcome.
        </h2>
        <p className="text-[15px] text-[#57564F] leading-[1.62] mt-6 max-w-[540px]">
          Describe the result — a market map, a financial model, a brand, a contract review, an app.
          The AI matches an interview-vetted specialist in that field. Research and finance through to
          design, ops, and code.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map(c => (
            <div key={c.name} className="flex flex-col rounded-[8px] border border-[#E7E4DB] bg-[#FBFAF6] p-5">
              <h3 className="text-[15px] font-semibold text-[#232329]">{c.name}</h3>
              <p className="mt-2 flex-1 text-[13px] text-[#5B5B66] leading-relaxed">{c.example}</p>
              <Link href={c.href} className="mt-4 inline-block text-[12.5px] font-medium text-electric-violet hover:underline">
                Find a specialist →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust — an editorial statement, chips verify themselves ── */}
      <style>{`
        .tr-alive { outline: none; }
        .tr-alive .tr-shield { transition: transform .45s cubic-bezier(.2,.9,.3,1.3); }
        .tr-alive:is(:hover,:focus-within) .tr-shield { transform: translate(-50%,-50%) scale(1.06); }
        .tr-alive .tr-ring { opacity: 0; }
        .tr-alive:is(:hover,:focus-within) .tr-ring { animation: tr-ring 1.1s ease-out .1s; }
        @keyframes tr-ring { 0% { opacity:.5; transform: translate(-50%,-50%) scale(.7) } 100% { opacity:0; transform: translate(-50%,-50%) scale(1.9) } }
        .tr-alive .tr-chip { transition: all .35s ease; }
        .tr-alive .tr-check { display:inline-block; max-width:0; overflow:hidden; vertical-align:bottom; transition: max-width .3s ease; }
        ${[0,1,2,3,4,5].map(i =>
          `.tr-alive:is(:hover,:focus-within) .tr-chip-${i} { box-shadow: 0 6px 20px rgba(20,20,15,.10); color:#14140F; transform: translateY(-3px); transition-delay:${0.08+i*0.1}s; border-color:#14140F }
           .tr-alive:is(:hover,:focus-within) .tr-chip-${i} .tr-check { max-width:20px; transition-delay:${0.16+i*0.1}s }`
        ).join("\n")}
        .vc-alive { outline: none; }
        .vc-alive .vc-q { transition: all .35s ease; }
        .vc-alive:is(:hover,:focus-within) .vc-q { background:#fffdf8; box-shadow: 0 10px 32px rgba(20,20,15,.07); }
        .vc-alive .vc-probe { background-image: linear-gradient(#14140F,#14140F); background-repeat:no-repeat; background-size: 0% 1.5px; background-position: 0 100%; transition: background-size .6s ease .15s; }
        .vc-alive:is(:hover,:focus-within) .vc-probe { background-size: 100% 1.5px; }
        .vc-alive .vc-stamp { opacity:.5; transform: scale(.94); transition: all .4s cubic-bezier(.2,.9,.3,1.3) .45s; }
        .vc-alive:is(:hover,:focus-within) .vc-stamp { opacity:1; transform: scale(1.03) rotate(-2deg); }
        .duo-card { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; }
        .duo-card:hover { transform: translateY(-4px); box-shadow: 0 22px 56px -24px rgba(20,20,15,.5); }
      `}</style>
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 md:pt-32">
        <div tabIndex={0} className="tr-alive relative overflow-hidden rounded-[4px] border border-[#E3E0D8] bg-[#FBFAF6] px-8 md:px-16 py-16 md:py-24 cursor-default">
          <div className="max-w-[560px]">
            <Kicker n="02" label={t("home.trustKicker")} />
            <h2 className="font-display font-light text-ink leading-[1.03] tracking-[-0.015em] text-[clamp(34px,5vw,60px)]">
              {t("home.trustH1pre")}<em className="italic font-normal">{t("home.trustH1em")}</em>.
            </h2>
            <p className="text-[15px] text-[#57564F] leading-[1.62] mt-6 max-w-[420px]">
              {t("home.trustSub")}
            </p>
            <Link href="/vetting" className="mt-7 inline-block text-[14px] font-medium text-ink underline decoration-[#C9C5B8] underline-offset-[5px] hover:decoration-ink transition-colors">
              {t("home.trustLink")}
            </Link>
          </div>

          {/* Category chips verify themselves around the shield */}
          <div className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 w-[380px] h-[240px]" aria-hidden="true">
            <span className="tr-ring absolute left-1/2 top-1/2 w-[88px] h-[88px] rounded-[6px] border-2 border-ink/40" />
            <div className="tr-shield absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88px] h-[88px] rounded-[6px] bg-[#100F0B] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#F7F5F0]" style={{ fontSize: "38px", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            {CHIP_CLUSTER.map((c, i) => (
              <span
                key={c.label}
                className={`tr-chip tr-chip-${i} absolute px-3 py-1.5 rounded-full bg-[#FBFAF6] border border-[#E3E0D8] text-[12px] font-medium text-[#57564F]`}
                style={{ left: c.x, top: c.y }}
              >
                <span className="tr-check text-emerald-600 font-bold">✓&nbsp;</span>{c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why teams switch ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-28 md:pt-36 pb-10">
        <Kicker n="03" label={t("home.whyKicker")} />
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,52px)] max-w-[16ch] mb-14">
          {t("home.whyH2")}
        </h2>
        <AliveGrid locale={locale} />
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 pb-10">
        <Kicker n="04" label={t("home.howKicker")} />
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,52px)] max-w-[18ch] mb-14">
          {t("home.howH2")}
        </h2>
        <HowItWorks locale={locale} />
      </section>

      {/* ── Split: vetting ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Kicker n="05" label={t("home.interviewKicker")} />
          <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,50px)] max-w-[15ch]">
            {t("home.interviewH2")}
          </h2>
          <p className="text-[15px] text-[#57564F] leading-[1.62] max-w-[440px] mt-6">
            {t("home.interviewSub")}
          </p>
          <Link href="/vetting" className="mt-7 inline-block text-[14px] font-medium text-ink underline decoration-[#C9C5B8] underline-offset-[5px] hover:decoration-ink transition-colors">
            {t("home.interviewLink")}
          </Link>
        </div>

        {/* Collage of interview artifacts, lights up on hover */}
        <div tabIndex={0} className="vc-alive grid grid-cols-2 gap-3 cursor-default">
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5 col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">{t("home.interviewQLabel")}</p>
            <p className="text-[14px] text-[#2A2A24] leading-relaxed">
              &ldquo;{t("home.interviewQpre")}<span className="vc-probe">{t("home.interviewQprobe")}</span>&rdquo;
            </p>
          </div>
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">{t("home.interviewResult")}</p>
            <span className="vc-stamp inline-block px-2.5 py-1 rounded-[3px] border border-emerald-600/30 bg-emerald-600/10 text-emerald-800 text-[12px] font-medium">
              {t("home.interviewStamp")}
            </span>
          </div>
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">{t("home.interviewRubricLabel")}</p>
            <p className="text-[12.5px] text-[#57564F] leading-relaxed">{t("home.interviewRubric")}</p>
          </div>
        </div>
      </section>

      {/* ── Get paid anywhere ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-16 pb-24">
        <Kicker n="06" label={t("home.payKicker")} />
        <GlobalPay locale={locale} />
      </section>

      {/* ── Live tasks (real data) ── */}
      <LiveTasks locale={locale} />

      {/* ── Dark duo: two sides ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 py-24 grid md:grid-cols-2 gap-4">
        {[
          { k: t("home.duoClientK"), h: t("home.duoClientH"), d: t("home.duoClientD"), cta: t("home.duoClientCta"), href: "/signup" },
          { k: t("home.duoFreelK"), h: t("home.duoFreelH"), d: t("home.duoFreelD"), cta: t("home.duoFreelCta"), href: "/signup?next=%2Fvetting" },
        ].map(x => (
          <div key={x.k} className="duo-card relative overflow-hidden rounded-[4px] bg-[#100F0B] p-9 md:p-11 min-h-[300px] flex flex-col">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-white/40 mb-4">{x.k}</p>
            <h3 className="font-display font-light text-[#F7F5F0] leading-[1.08] tracking-[-0.01em] text-[clamp(26px,3.2vw,38px)] max-w-[14ch]">
              {x.h}
            </h3>
            <p className="text-[13.5px] text-white/55 leading-relaxed max-w-[380px] mt-5 mb-8">{x.d}</p>
            <Link href={x.href} className="mt-auto inline-flex items-center gap-2 h-10 w-fit px-5 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors">
              {x.cta}
            </Link>
          </div>
        ))}
      </section>

      {/* ── FAQ (visible content backs the FAQPage schema above) ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-8 pb-20">
        <Kicker n="07" label={t("home.faqKicker")} />
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-16">
          <div>
            <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(30px,4vw,46px)]">
              {t("home.faqH2")}
            </h2>
            <Link href={faqMoreHref} className="mt-6 inline-block text-[14px] font-medium text-ink underline decoration-[#C9C5B8] underline-offset-[5px] hover:decoration-ink transition-colors">
              {t("home.faqMore")}
            </Link>
          </div>
          <dl className="divide-y divide-[#E3E0D8] border-t border-[#E3E0D8]">
            {faqs.map(f => (
              <div key={f.q} className="py-5">
                <dt className="text-[15.5px] font-semibold text-ink leading-snug">{f.q}</dt>
                <dd className="mt-2 text-[14px] text-[#57564F] leading-[1.6]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Compare row (internal links) ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pb-28">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8A887E] mb-5">{t("home.compare")}</p>
        <div className="flex flex-wrap gap-2.5">
          {compare.map(([label, href]) => (
            <Link key={href} href={href}
              className="inline-flex items-center px-4 py-2 rounded-full border border-[#E3E0D8] text-[13px] font-medium text-[#57564F] hover:border-ink hover:text-ink transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
