import type { Metadata } from "next";
import Link from "next/link";

const CANONICAL = "/hire-freelancers-with-ai";
const TITLE = "Hire Freelancers with AI — Vetted Matches in 60 Seconds | Hyrde";
const DESCRIPTION =
  "Hire freelancers with AI on Hyrde. Describe your project in plain language and AI returns the top 5 pre-vetted freelancers, ranked and explained, in 60 seconds. No bidding, no proposal spam — flat 8%, only on success.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "hire freelancers with AI", "hire freelancers using AI", "AI freelancer matching",
    "AI hiring platform", "AI talent matching", "hire talent with AI",
    "AI freelance platform", "AI to hire freelancers", "hire developers with AI",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Hire Freelancers with AI — Vetted Matches in 60 Seconds",
    description:
      "Describe your project; AI returns the top 5 pre-vetted freelancers in 60 seconds. No bidding. Flat 8% — only on success.",
    url: `https://hyrde.net${CANONICAL}`,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hire freelancers with AI — Hyrde" }],
  },
};

const STEPS = [
  {
    icon: "edit_note",
    title: "1. Describe what you need",
    body: "Write your project in plain language — no rigid forms, no job-spec jargon. The AI reads your brief the way a senior recruiter would.",
  },
  {
    icon: "manage_search",
    title: "2. AI scopes & scores every freelancer",
    body: "Hyrde’s AI scopes the role, then scores every pre-vetted freelancer against your exact requirements — skills, evidence of past work, and fit.",
  },
  {
    icon: "auto_awesome",
    title: "3. Get your top 5 in 60 seconds",
    body: "You get a ranked shortlist of the 5 best matches — each with a plain-English explanation of why the AI picked them. No 500-proposal pile.",
  },
  {
    icon: "handshake",
    title: "4. Pick, hire, pay only on success",
    body: "Choose who you like and start the work. You pay a flat 8% — and only after the task is successfully completed.",
  },
];

const COMPARE = [
  { dim: "Finding talent", old: "Post a job, wait, sift 50–500 proposals", ai: "AI returns the top 5 matches in 60 seconds" },
  { dim: "Quality", old: '"Top Rated" badges that can be gamed', ai: "Every freelancer pre-vetted before you see them" },
  { dim: "Selection", old: "Read proposals, guess who is real", ai: "Ranked, with AI explanations for each match" },
  { dim: "Fees", old: "Effective 22–34% all-in take rate", ai: "Flat 8% — only on success" },
  { dim: "Effort", old: "Hours of screening per role", ai: "Minutes — the AI does the screening" },
];

const FAQS = [
  {
    q: "Can I really hire freelancers with AI?",
    a: "Yes. Hyrde is built around it: you describe your project in plain language, and AI scopes the role, scores every pre-vetted freelancer against your brief, and returns a ranked shortlist of the top 5 — usually in about 60 seconds. You stay in control of the final choice; the AI does the searching and screening.",
  },
  {
    q: "What is AI freelancer matching?",
    a: "AI freelancer matching uses a model to read your requirements and compare them against talent profiles, work samples, and evidence of past results — then rank the best fits. Instead of you reading hundreds of proposals, the AI surfaces the few people most qualified for exactly what you described.",
  },
  {
    q: "How is hiring freelancers with AI better than Upwork or Fiverr?",
    a: "On traditional marketplaces you post a job and wait for dozens of proposals, then guess who is genuine. With Hyrde’s AI matching there is no bidding: talent is pre-vetted, you get a ranked top-5 with explanations, and the fee is a flat 8% charged only on success — versus the 22–34% effective take rate clients report elsewhere.",
  },
  {
    q: "Is it safe to hire freelancers with AI?",
    a: "AI handles the matching and shortlisting; you make the hiring decision. Every freelancer on Hyrde is pre-vetted with an AI work-sample assessment before you ever see them, which reduces the fake-portfolio and disappearing-contractor risks common on open marketplaces.",
  },
  {
    q: "What does it cost to hire freelancers with AI on Hyrde?",
    a: "Posting a project, AI matching, browsing, and shortlisting are free. You only pay a flat 8% fee, and only after a task is successfully completed. Freelancers pay nothing.",
  },
  {
    q: "What kinds of freelancers can I hire with AI?",
    a: "Developers, designers, data scientists, ML engineers, marketers, writers, product designers and more — across 24+ skills and 12 cities (or fully remote). The same AI matching works for any role you can describe.",
  },
];

export default function HireFreelancersWithAIPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(f => ({
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
      { "@type": "ListItem", position: 2, name: "Hire freelancers with AI", item: `https://hyrde.net${CANONICAL}` },
    ],
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "AI freelancer matching",
    serviceType: "Hire freelancers with AI",
    provider: { "@type": "Organization", name: "Hyrde", url: "https://hyrde.net" },
    areaServed: "Worldwide",
    description:
      "AI-native hiring: describe a project in plain language and get the top 5 pre-vetted freelancers, ranked and explained, in 60 seconds.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free to post and match; flat 8% fee only on a successful hire." },
  };

  return (
    <div className="min-h-screen bg-surface-gray">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[560px] h-[560px] bg-electric-violet rounded-full glow-accent -mr-56 -mt-40 pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-14 relative">
          <nav className="text-xs font-body text-on-surface-variant mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-electric-violet transition-colors">Home</Link>
            <span>/</span>
            <span className="text-on-surface">Hire freelancers with AI</span>
          </nav>

          <div className="ai-shimmer-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="text-xs font-semibold font-body text-on-surface uppercase tracking-widest">AI-matched in 60 seconds — no bidding</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline text-on-surface mb-5 max-w-3xl leading-[1.07] tracking-tight">
            Hire freelancers with AI —{" "}
            <span className="text-electric-violet">matched in 60 seconds.</span>
          </h1>

          <p className="text-lg md:text-xl font-body text-on-surface-variant max-w-2xl mb-8 leading-relaxed">
            Stop sifting hundreds of proposals. Describe your project in plain language and Hyrde’s AI
            returns the <strong className="text-on-surface font-semibold">top 5 pre-vetted freelancers</strong>,
            ranked and explained — in about a minute. Free to post.{" "}
            <strong className="text-on-surface font-semibold">Flat 8%, only on success.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <Link href="/get-started"
              className="flex-1 text-center bg-electric-violet text-white font-bold font-headline px-8 py-4 rounded-2xl hover:shadow-[0_0_36px_rgba(91,79,207,0.45)] transition-all hover:-translate-y-0.5">
              Hire with AI — free to post
            </Link>
            <Link href="/upwork-alternative"
              className="flex-1 text-center bg-white border border-border-crisp text-on-surface font-semibold font-body px-8 py-4 rounded-2xl hover:border-electric-violet transition-colors">
              See why clients switch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Definition (snippet-friendly) ── */}
      <section className="bg-white border-y border-border-crisp py-14">
        <div className="max-w-[820px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface mb-4">
            What does it mean to hire freelancers with AI?
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed">
            Hiring freelancers with AI means letting a model do the searching, screening, and ranking that
            used to take hours of manual work. Instead of posting a job and wading through 50–500 proposals,
            you describe what you need once. The AI scopes the role, scores every pre-vetted freelancer
            against your brief, and hands back a short, ranked list of the people most likely to deliver —
            each with a plain-English reason they were matched. You make the final call; the AI removes the
            grunt work and the guesswork.
          </p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface mb-2 text-center">
          How to hire freelancers with AI, step by step
        </h2>
        <p className="font-body text-on-surface-variant text-center max-w-xl mx-auto mb-10">
          Four steps, about a minute to your shortlist.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(s => (
            <div key={s.title} className="bg-white rounded-2xl border border-border-crisp p-6">
              <span className="w-11 h-11 rounded-xl bg-electric-violet/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "23px", fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </span>
              <h3 className="font-bold font-headline text-on-surface mb-2 text-sm">{s.title}</h3>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="bg-white border-y border-border-crisp py-16">
        <div className="max-w-[920px] mx-auto px-6 md:px-12">
          <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface mb-8 text-center">
            AI matching vs. the old way of hiring freelancers
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border-crisp">
            <div className="grid grid-cols-3 bg-surface-container-high text-xs font-semibold font-body uppercase tracking-widest text-on-surface-variant">
              <div className="p-4"></div>
              <div className="p-4">Traditional marketplace</div>
              <div className="p-4 text-electric-violet">Hire with AI (Hyrde)</div>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.dim} className={`grid grid-cols-3 text-sm font-body ${i % 2 ? "bg-surface-gray" : "bg-white"}`}>
                <div className="p-4 font-semibold text-on-surface">{row.dim}</div>
                <div className="p-4 text-on-surface-variant">{row.old}</div>
                <div className="p-4 text-on-surface font-medium">{row.ai}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-[820px] mx-auto px-6 md:px-12 py-16">
        <h2 className="text-2xl md:text-3xl font-bold font-headline text-on-surface mb-6">
          Hiring freelancers with AI: FAQ
        </h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="bg-white rounded-xl border border-border-crisp p-5 group">
              <summary className="font-semibold font-body text-on-surface cursor-pointer list-none flex items-center justify-between gap-4">
                {f.q}
                <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform" style={{ fontSize: "20px" }}>expand_more</span>
              </summary>
              <p className="font-body text-on-surface-variant text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-20">
        <div className="bg-tech-blue-deep rounded-3xl px-8 py-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-16 w-80 h-80 bg-electric-violet rounded-full glow-accent" />
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4 relative">
            Ready to hire freelancers with AI?
          </h2>
          <p className="font-body text-white/70 max-w-xl mx-auto mb-8 relative">
            Describe your project and get your top 5 vetted matches in 60 seconds. Free to post — you pay a flat 8% only on success.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative">
            <Link href="/get-started"
              className="bg-white text-tech-blue-deep font-bold font-headline px-8 py-4 rounded-full hover:scale-[0.98] transition-transform">
              Hire with AI now
            </Link>
            <Link href="/rates"
              className="bg-white/10 border border-white/20 text-white font-semibold font-body px-8 py-4 rounded-full hover:bg-white/20 transition-colors">
              See 2026 freelance rates
            </Link>
          </div>
          <p className="text-xs font-body text-white/50 mt-6 relative">
            Related:{" "}
            <Link href="/hire" className="underline underline-offset-2 hover:text-ai-glow">browse talent by skill</Link>
            {" · "}
            <Link href="/upwork-alternative" className="underline underline-offset-2 hover:text-ai-glow">the AI Upwork alternative</Link>
            {" · "}
            <Link href="/guides" className="underline underline-offset-2 hover:text-ai-glow">hiring guides</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
