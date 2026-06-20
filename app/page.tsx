import type { Metadata } from "next";
import Link from "next/link";
import { SKILLS } from "@/lib/data";
import CostOfHiringSection from "@/components/CostOfHiringSection";
import StatCounter from "@/components/StatCounter";

export const metadata: Metadata = {
  title: { absolute: "Hire Pre-Vetted Freelancers, AI-Matched in 60 Seconds | Hyrde" },
  description:
    "Describe your project and get the top 5 pre-vetted freelancers in 60 seconds. No bidding, no proposal spam. Free to hire during early access.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hire Pre-Vetted Freelancers, AI-Matched in 60 Seconds | Hyrde",
    description:
      "Describe your project; get the top 5 vetted freelancers in 60 seconds. No bidding. Free to hire — early access.",
    url: "https://hyrde.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde — AI-native freelance platform" }],
  },
};

const FEATURED_SKILLS = [
  "react-developer","ux-designer","data-scientist",
  "copywriter","product-designer","ml-engineer",
  "shopify-developer","growth-marketer",
];

const STATS = [
  { value: "$0",  label: "Cost to freelancers" },
  { value: "$0",  label: "To hire — early access" },
  { value: "5",   label: "AI-matched max"  },
  { value: "60s", label: "To your matches" },
];

const AGENTS = [
  { icon: "manage_search", name: "The Matcher",    desc: "Finds the right jobs for your exact skillset. No spray-and-pray. Curated matches only."        },
  { icon: "edit_note",     name: "The Agent",      desc: "Surfaces you to matching briefs and writes an evidence-backed intro on your behalf. No proposals to send — ever."  },
  { icon: "price_check",   name: "The Pricer",     desc: "Real-time market rates. Know exactly what to charge — and when to raise it."                    },
  { icon: "gavel",         name: "The Lawyer",     desc: "Reviews every contract before you sign. Flags risky clauses, missing terms, and traps."         },
  { icon: "task_alt",      name: "The PM",         desc: "Manages milestones, scope, and client comms so nothing falls through the cracks."               },
  { icon: "receipt_long",  name: "The Accountant", desc: "Invoices, tax estimates, year-end summaries — fully automated."                                 },
];

const PRICING = [
  {
    icon: "business_center",
    who: "For clients",
    price: "Free to post",
    detail: "Free to hire during early access — no platform fee, no listing fees, no subscriptions. Paid plans come later; early users get locked-in perks.",
  },
  {
    icon: "person",
    who: "For freelancers",
    price: "Free forever",
    detail: "Keep what you earn. No connects, no proposals, no pay-to-apply — your AI agent brings the right jobs to you.",
  },
  {
    icon: "smart_toy",
    who: "AI agents",
    price: "Pay-as-you-go",
    detail: "Contract review, proposal writing, rate analysis — pay only for what you actually use.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-gray overflow-hidden relative">

      {/* Ambient glow blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-violet rounded-full glow-accent -mr-64 -mt-32 pointer-events-none" />
      <div className="absolute top-[55%] left-0 w-[400px] h-[400px] bg-ai-glow rounded-full glow-accent -ml-32 pointer-events-none" />

      {/* ── Hero ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-20 text-center relative">
        <div className="mb-7 select-none">
          <span className="inline-block text-7xl md:text-[112px] font-bold font-headline tracking-tight leading-none text-on-surface">
            hyrde.net
          </span>
        </div>

        <div className="ai-shimmer-pill inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 shadow-[0_2px_12px_rgba(91,79,207,0.10)]">
          <span className="material-symbols-outlined text-electric-violet animate-floaty" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="text-xs font-semibold font-body text-on-surface uppercase tracking-widest">No bidding, ever — AI-matched in 60 seconds</span>
        </div>

        <h1 className="text-5xl md:text-[64px] font-bold font-headline text-on-surface mb-6 max-w-4xl mx-auto leading-[1.08] tracking-tight">
          Hire pre-vetted freelancers{" "}
          <span className="text-electric-violet">in 60 seconds.</span>
        </h1>

        <p className="text-xl font-body text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe your project in plain language — our AI scores every freelancer against your brief
          and returns the top 5 with explanations. Free to post.{" "}
          <strong className="text-on-surface font-semibold">Free to hire while we're in early access.</strong>
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 mb-6 max-w-2xl mx-auto">
          <Link href="/get-started"
            className="group flex-1 flex flex-col items-center justify-center gap-1 px-8 py-6 bg-electric-violet text-white rounded-2xl font-body hover:shadow-[0_0_36px_rgba(91,79,207,0.45)] transition-all hover:-translate-y-1 active:scale-95">
            <span className="flex items-center gap-2 text-lg font-bold font-headline">
              <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>business_center</span>
              Hire a talent
            </span>
            <span className="text-xs font-body text-white/80">Vetted shortlist in 60 seconds · free to post</span>
          </Link>
          <Link href="/join"
            className="group flex-1 flex flex-col items-center justify-center gap-1 px-8 py-6 bg-white border-2 border-tech-blue-deep text-on-surface rounded-2xl font-body hover:bg-tech-blue-deep hover:text-white transition-all hover:-translate-y-1 active:scale-95">
            <span className="flex items-center gap-2 text-lg font-bold font-headline">
              <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>person_add</span>
              Join as a freelancer
            </span>
            <span className="text-xs font-body opacity-80">Free forever · jobs come to you, no bidding</span>
          </Link>
        </div>

        {/* Quick-post inline search */}
        <form action="/post-job" method="get" className="flex max-w-xl mx-auto gap-2">
          <input
            name="brief"
            type="text"
            placeholder="Describe what you need — our AI finds the right people…"
            className="flex-1 border border-border-crisp rounded-full px-5 py-3.5 text-sm font-body text-on-surface bg-white focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10 min-w-0"
          />
          <button
            type="submit"
            className="bg-electric-violet text-white px-7 py-3.5 rounded-full text-sm font-semibold font-body hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            Match now
          </button>
        </form>

        <p className="text-sm font-body text-on-surface-variant mt-5">
          New to this?{" "}
          <Link href="/hire-freelancers-with-ai" className="text-electric-violet font-semibold underline underline-offset-2 hover:opacity-80">
            See how to hire freelancers with AI
          </Link>{" "}
          — matched in 60 seconds.
        </p>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.value} className="bg-white rounded-xl p-7 border border-border-crisp text-center">
              <h3 className="text-4xl font-bold font-headline text-electric-violet mb-1">{s.value}</h3>
              <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="relative bg-tech-blue-deep rounded-3xl p-10 md:p-14 text-center overflow-hidden">
          <div className="absolute inset-0 bg-electric-violet/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 mb-7">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-glow opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-ai-glow" />
              </span>
              <span className="text-xs font-semibold font-body text-white uppercase tracking-widest">Early access — onboarding now</span>
            </div>

            <p className="text-6xl md:text-7xl font-bold font-headline text-ai-glow leading-none mb-2">
              <StatCounter value={500} suffix="+" />
            </p>
            <p className="text-xs font-semibold font-body text-on-primary-container uppercase tracking-widest mb-7">
              clients &amp; freelancers already on the waitlist
            </p>

            <h2 className="text-3xl md:text-5xl font-bold font-headline text-white mb-4 leading-tight">
              Join the waitlist
            </h2>
            <p className="font-body text-on-primary-container text-lg max-w-xl mx-auto mb-9">
              Get early access before we open the doors. Tell us whether you&apos;re here to hire or to freelance — it takes about 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-xl mx-auto">
              <Link href="/get-started"
                className="group flex-1 flex flex-col items-center justify-center gap-1 px-8 py-5 bg-electric-violet text-white rounded-2xl font-body hover:shadow-[0_0_36px_rgba(91,79,207,0.45)] transition-all hover:-translate-y-1 active:scale-95">
                <span className="flex items-center gap-2 text-lg font-bold font-headline">
                  <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>business_center</span>
                  I want to hire
                </span>
                <span className="text-xs font-body text-white/80">Get matched with vetted talent</span>
              </Link>
              <Link href="/join"
                className="group flex-1 flex flex-col items-center justify-center gap-1 px-8 py-5 bg-white text-on-surface rounded-2xl font-body hover:bg-ai-glow transition-all hover:-translate-y-1 active:scale-95">
                <span className="flex items-center gap-2 text-lg font-bold font-headline">
                  <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>person_add</span>
                  I&apos;m a freelancer
                </span>
                <span className="text-xs font-body opacity-70">Free forever · jobs come to you</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PART 3 — Hiring is broken: animated cost-of-hiring stats ── */}
      <CostOfHiringSection />

      {/* ── Switcher: tired of Upwork / Fiverr / Toptal ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">Coming from another platform?</p>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            Tired of disappearing contractors and fake 5-star badges?
          </h2>
          <p className="font-body text-on-surface-variant mt-3 max-w-xl mx-auto">
            See exactly how Hyrde fixes what burns clients on the big marketplaces — vetted talent, no bidding, and free to hire during early access.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/upwork-alternative", name: "Upwork", pain: "Ghosting contractors, gameable badges, 22–34% real fees" },
            { href: "/fiverr-alternative", name: "Fiverr", pain: "Gig roulette, race-to-the-bottom quality, surprise extras" },
            { href: "/toptal-alternative", name: "Toptal", pain: "Premium markups, upfront deposits, opaque pricing" },
          ].map(x => (
            <Link key={x.href} href={x.href}
              className="group bg-white rounded-xl p-6 border border-border-crisp hover:border-electric-violet hover:shadow-[0_4px_20px_rgba(91,79,207,0.08)] transition-all">
              <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">Hyrde vs</p>
              <p className="text-lg font-bold font-headline text-on-surface mb-2 flex items-center justify-between">
                {x.name}
                <span className="material-symbols-outlined text-electric-violet group-hover:translate-x-1 transition-transform" style={{ fontSize: "18px" }}>arrow_forward</span>
              </p>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">{x.pain}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works for clients ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">For clients</p>
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface mb-5 leading-tight">
              Describe it in plain language.<br />Get 5 real matches in 60 seconds.
            </h2>
            <p className="font-body text-on-surface-variant leading-relaxed mb-6">
              No sifting through dozens of proposals. No algorithms that favor whoever spent the most. Just the 5 people most qualified for exactly what you described — ranked by AI, explained in plain English.
            </p>
            <div className="space-y-3">
              {[
                "Free to post — no upfront cost",
                "AI reads your brief and scores every freelancer",
                "See exactly why each person was matched",
                "Free to hire — no platform fee during early access",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-electric-violet/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                  <span className="text-sm font-body text-on-surface">{item}</span>
                </div>
              ))}
            </div>
            <Link href="/post-job" className="inline-flex items-center gap-2 mt-8 bg-electric-violet text-white px-7 py-3 rounded-full text-sm font-semibold font-body hover:opacity-90 transition-opacity">
              Post a project free
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-border-crisp p-6 shadow-sm">
            <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-4">Live match result</p>
            {[
              { name: "Sara R.", role: "React Developer", score: 96, note: "6 yrs React, ex-Stripe. Shipped 3 SaaS products.", rate: "$90/hr" },
              { name: "Mo K.",   role: "React Developer", score: 91, note: "TypeScript specialist. Fintech focus. Fast iterations.", rate: "$75/hr" },
              { name: "Ana L.",  role: "Fullstack Dev",   score: 84, note: "Full-stack React/Node. 5 yrs. Open-source contributor.", rate: "$85/hr" },
            ].map((f, i) => {
              const initials = f.name.split(" ").map(n => n[0]).join("");
              return (
                <div key={f.name} className={`flex items-center gap-3 py-3 ${i < 2 ? "border-b border-border-crisp" : ""}`}>
                  <div className="w-9 h-9 rounded-full ai-match-gradient flex items-center justify-center font-bold text-white text-xs shrink-0">{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-body text-on-surface">{f.name} <span className="font-normal text-on-surface-variant">· {f.role}</span></p>
                    <p className="text-xs font-body text-on-surface-variant truncate">{f.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold font-body text-electric-violet bg-electric-violet/10 px-2 py-0.5 rounded-full">{f.score}%</span>
                    <p className="text-xs text-on-surface-variant mt-0.5">{f.rate}</p>
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-on-surface-variant mt-3 text-center">+2 more matches · AI-ranked against your brief</p>
          </div>
        </div>
      </section>

      {/* ── AI Agents for freelancers ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">For freelancers</p>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface">
            AI agents built into the platform
          </h2>
          <p className="font-body text-on-surface-variant mt-3 max-w-xl mx-auto">
            Not just a job board. A full AI team running your freelance business while you focus on the work.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {AGENTS.map(a => (
            <div key={a.name} className="bg-white rounded-xl p-6 border border-border-crisp hover:border-electric-violet/40 hover:shadow-[0_4px_20px_rgba(91,79,207,0.07)] transition-all">
              <div className="w-11 h-11 rounded-xl bg-electric-violet/8 border border-electric-violet/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "22px" }}>{a.icon}</span>
              </div>
              <p className="font-semibold font-body text-on-surface text-sm mb-1.5">{a.name}</p>
              <p className="text-sm font-body text-on-surface-variant leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/freelancer/join"
            className="inline-flex items-center gap-2 bg-tech-blue-deep text-white px-8 py-3.5 rounded-full text-sm font-semibold font-body hover:opacity-90 transition-opacity">
            Join free — zero cost, ever
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Pricing — fair by design ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="bg-tech-blue-deep rounded-2xl p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-electric-violet/5 pointer-events-none" />
          <div className="relative z-10">
            <p className="text-xs font-semibold text-ai-glow uppercase tracking-widest mb-4">Transparent pricing</p>
            <div className="md:flex md:items-end md:justify-between mb-10 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3 leading-tight">
                  Fair by design.<br />
                  <span className="text-ai-glow">No surprises, ever.</span>
                </h2>
                <p className="text-on-primary-container max-w-md leading-relaxed">
                  Everyone sees the same price. No hidden fees. No tiers that gate basic access.
                  A <strong className="text-white">$455B market</strong> — we grow when you grow.
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {PRICING.map(p => (
                <div key={p.who} className="bg-white/8 border border-white/10 rounded-xl p-6 hover:bg-white/12 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-electric-violet/20 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: "20px" }}>{p.icon}</span>
                  </div>
                  <p className="text-xs font-semibold text-on-primary-container uppercase tracking-widest mb-2">{p.who}</p>
                  <p className="text-2xl font-bold font-headline text-white mb-3">{p.price}</p>
                  <p className="text-sm text-on-primary-container leading-relaxed">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Browse by skill ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 mb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">Browse talent</p>
            <h2 className="text-3xl font-bold font-headline text-on-surface">Find by skill</h2>
          </div>
          <Link href="/hire" className="text-sm font-semibold font-body text-electric-violet hover:underline underline-offset-2">
            View all skills →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURED_SKILLS.map(slug => {
            const skill = SKILLS[slug];
            if (!skill) return null;
            return (
              <Link key={slug} href={`/hire/${slug}`}
                className="bg-white rounded-xl p-5 border border-border-crisp hover:border-electric-violet hover:shadow-[0_4px_16px_rgba(91,79,207,0.08)] transition-all group">
                <p className="font-semibold font-body text-on-surface text-sm group-hover:text-electric-violet transition-colors mb-1">
                  {skill.label}
                </p>
                <p className="text-xs font-body text-on-surface-variant">${skill.avgRate}/hr avg</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs font-semibold font-body px-2.5 py-0.5 rounded-full ${
                    skill.demand === "high"
                      ? "bg-electric-violet/10 text-electric-violet"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    {skill.demand}
                  </span>
                  <span className="material-symbols-outlined text-electric-violet group-hover:translate-x-1 transition-transform" style={{ fontSize: "16px" }}>arrow_forward</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-16">
        <div className="bg-white border border-border-crisp rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-on-surface mb-4">
            The fastest way to get hired.
          </h2>
          <p className="font-body text-on-surface-variant mb-10 max-w-xl mx-auto text-lg">
            Join hand-picked freelancers on Hyrde. Free forever to join. Keep what you earn. AI does the rest.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/freelancer/join"
              className="w-full sm:w-auto px-12 py-4 bg-electric-violet text-white rounded-full text-sm font-semibold font-body hover:opacity-90 transition-opacity">
              Create your profile
            </Link>
            <Link href="/post-job"
              className="w-full sm:w-auto px-12 py-4 bg-surface-gray border border-border-crisp text-on-surface rounded-full text-sm font-semibold font-body hover:bg-white transition-colors">
              Post a job
            </Link>
          </div>
          <p className="mt-5 text-xs font-body text-on-surface-variant">No credit card. No connects. No nonsense.</p>
        </div>
      </section>

    </div>
  );
}
