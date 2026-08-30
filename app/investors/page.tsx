import type { Metadata } from "next";
import Link from "next/link";
import { HyrdeMark } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Hyrde. Investor Brief",
  description: "Hyrde is building the AI workforce platform: hire outcomes, not freelancers.",
  robots: { index: false, follow: false }, // private link. Not for search
};

// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THESE — the only hand-maintained numbers on this page. Everything else
//  describes what's actually built. Keep it honest; investors verify.
// ─────────────────────────────────────────────────────────────────────────────
const RAISE = {
  stage: "Pre-seed",
  amount: "$400K",          // ← your target raise
  instrument: "SAFE",       // ← SAFE / equity / note
  use: "12–18 months of runway: engineering (2 hires already onboarding), freelancer supply in 2 MENA markets, and the outcome-execution layer.",
};
const CONTACT_EMAIL = "abdelrahman@hyrde.net";

const signal = [
  ["Live product", "Fully working platform in production at hyrde.net. Not a prototype."],
  ["AI matching engine", "Posts auto-match to the best interview-vetted specialist. No bidding, no browsing."],
  ["Outcome projects", "Clients describe an outcome (“I need an MVP”); AI scopes it into a sequenced milestone plan."],
  ["Vetting that can't be farmed", "Every freelancer passes an adaptive AI skill interview, graded 0–100."],
  ["Revenue live", "Client subscription tiers, billed today via cross-border rails (no Stripe dependency)."],
  ["Cross-border payments", "Built for markets Stripe doesn't serve. Freelancers keep 100%, paid on their own rails."],
];

const moat = [
  {
    h: "Proprietary execution data",
    b: "Every completed milestone teaches Hyrde which specialists deliver, which estimates held, which combinations work. Competitors have the same LLMs. They don't have this ledger, and it can't be bought.",
  },
  {
    h: "Outcome memory & switching cost",
    b: "Hyrde remembers a client's brand voice, standards, and past projects. The longer you use it, the better it scopes for you. And the more painful it is to start over elsewhere.",
  },
  {
    h: "Compounding match quality",
    b: "More projects → better outcome prediction → better teams → better delivery → more projects. A data flywheel, not a feature a competitor copies in a sprint.",
  },
];

const versus = [
  ["Upwork / Fiverr", "You wade through bids and proposals.", "AI assigns one vetted specialist. Zero bidding."],
  ["Toptal / A.Team", "Human recruiters, slow, premium-priced.", "AI-native matching in minutes, no recruiter markup."],
  ["Everyone", "You hire a person for a task.", "You hire an outcome; Hyrde manages the plan."],
];

export default function InvestorsPage() {
  return (
    <div className="bg-[#ffffff]">
      {/* ── Hero ── */}
      <section className="relative -mt-[104px] overflow-hidden bg-[#0A0A0B]">
        <div aria-hidden="true" className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 20% 20%, rgba(91,79,207,0.3), transparent 60%)" }} />
        <div className="relative mx-auto max-w-[980px] px-5 md:px-8 pt-[160px] pb-24 md:pt-[190px] md:pb-28">
          <div className="flex items-center gap-2 text-white mb-8">
            <HyrdeMark size={24} />
            <span className="text-[17px] font-semibold tracking-[-0.02em]">hyrde</span>
            <span className="ml-3 text-[12px] font-medium text-[#A99EE8] border border-white/15 rounded-full px-3 py-1">Investor brief</span>
          </div>
          <h1 className="font-light text-white leading-[1.02] tracking-[-0.035em] text-[clamp(38px,6vw,72px)] max-w-[15ch]">
            The AI workforce platform. Hire{" "}
            <span className="inline-block bg-[#ffffff] text-[#0A0A0B] rounded-2xl px-3 leading-[1.15] -rotate-1">outcomes</span>,
            not freelancers.
          </h1>
          <p className="text-white/60 text-[16px] md:text-[18px] max-w-[600px] leading-relaxed mt-8">
            Companies don&apos;t want a React developer. They want an app that works. Hyrde takes an
            outcome, scopes it, matches interview-vetted specialists, and manages delivery. Every
            project makes the system smarter. That compounding execution data is the moat.
          </p>
          <div className="flex flex-wrap gap-3 mt-10">
            <Link href="https://hyrde.net" className="h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#ffffff] text-[#0A0A0B] text-sm font-medium hover:bg-[#f0f0f2] transition-colors">
              See the live product <span aria-hidden="true">→</span>
            </Link>
            <a href={`mailto:${CONTACT_EMAIL}`} className="h-11 inline-flex items-center px-6 rounded-full bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-colors">
              Talk to the founder
            </a>
          </div>
        </div>
      </section>

      {/* ── The shift ── */}
      <section className="mx-auto max-w-[980px] px-5 md:px-8 py-20 md:py-28">
        <p className="text-[13px] font-medium text-electric-violet mb-4">The shift</p>
        <h2 className="font-light text-[#232329] leading-[1.08] tracking-[-0.03em] text-[clamp(28px,4vw,46px)] max-w-[20ch]">
          Marketplaces sell access to people. Hyrde sells the result.
        </h2>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[
            ["The old way", "Post a job. Get 50 proposals. Screen, interview, negotiate, manage, and hope. The platform takes 20%+ and adds no intelligence."],
            ["The AI-native way", "Describe the outcome. AI scopes it, assigns vetted specialists, sequences milestones, reviews delivery. You manage a plan, not a pile of people."],
            ["Why now", "LLMs made scoping, matching, and review automatable for the first time. The winner isn't who has AI. It's who accumulates the execution data to use it best."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-2xl bg-[#F7F6FA] p-6">
              <h3 className="text-[16px] font-semibold text-[#232329] mb-2.5">{h}</h3>
              <p className="text-[13.5px] text-[#5B5B66] leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Built & live ── */}
      <section className="bg-[#0A0A0B]">
        <div className="mx-auto max-w-[980px] px-5 md:px-8 py-20 md:py-24">
          <p className="text-[13px] font-medium text-[#A99EE8] mb-4">Not a deck. A working company</p>
          <h2 className="font-light text-white leading-[1.08] tracking-[-0.03em] text-[clamp(28px,4vw,44px)] max-w-[18ch]">
            Everything below is live in production today.
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-7 mt-12">
            {signal.map(([h, b]) => (
              <div key={h} className="flex gap-3.5">
                <span className="text-[#A99EE8] text-lg font-bold mt-px shrink-0" aria-hidden="true">✓</span>
                <div>
                  <h3 className="text-[15px] font-semibold text-white mb-1">{h}</h3>
                  <p className="text-[13.5px] text-white/55 leading-relaxed">{b}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[13px] text-white/40 mt-12 border-t border-white/10 pt-6">
            Stage: early access, pre-seed. Solo-built to production; onboarding the first engineers now.
            Live metrics available on request in the data room. We don&apos;t vanity-quote user counts.
          </p>
        </div>
      </section>

      {/* ── The moat ── */}
      <section className="mx-auto max-w-[980px] px-5 md:px-8 py-20 md:py-28">
        <p className="text-[13px] font-medium text-electric-violet mb-4">The moat</p>
        <h2 className="font-light text-[#232329] leading-[1.08] tracking-[-0.03em] text-[clamp(28px,4vw,46px)] max-w-[20ch]">
          The defensibility isn&apos;t the AI. It&apos;s the data the AI creates.
        </h2>
        <p className="text-[15px] text-[#5B5B66] leading-relaxed max-w-[560px] mt-5">
          Assume every competitor can call the same models. What they can&apos;t call is Hyrde&apos;s
          proprietary record of what actually shipped, from whom, at what quality.
        </p>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {moat.map(m => (
            <div key={m.h} className="rounded-2xl bg-gradient-to-br from-[#EDEBFF] to-[#F7F6FF] p-6">
              <h3 className="text-[16px] font-semibold text-[#232329] mb-2.5">{m.h}</h3>
              <p className="text-[13.5px] text-[#5B5B66] leading-relaxed">{m.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wedge + model ── */}
      <section className="mx-auto max-w-[980px] px-5 md:px-8 pb-24 grid md:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#F7F6FA] p-8">
          <h3 className="text-[18px] font-semibold text-[#232329] mb-3">The wedge: MENA-first</h3>
          <p className="text-[14px] text-[#5B5B66] leading-relaxed">
            Global platforms can&apos;t pay talent in markets Stripe won&apos;t serve. Hyrde was built there
            first. Cross-border payouts on local rails, freelancers keep 100%. We own a market the
            incumbents structurally can&apos;t, then expand outward with the data lead already compounding.
          </p>
        </div>
        <div className="rounded-2xl bg-[#F7F6FA] p-8">
          <h3 className="text-[18px] font-semibold text-[#232329] mb-3">The model</h3>
          <p className="text-[14px] text-[#5B5B66] leading-relaxed">
            Client subscriptions live today (billed cross-border). Freelancers stay free. Supply is the
            flywheel. As outcome volume grows, a take-rate on managed delivery layers on top. Margins
            expand as AI absorbs the scoping, matching, and QA that recruiters used to charge for.
          </p>
        </div>
      </section>

      {/* ── Versus ── */}
      <section className="mx-auto max-w-[980px] px-5 md:px-8 pb-24">
        <h2 className="font-light text-[#232329] leading-[1.08] tracking-[-0.03em] text-[clamp(26px,3.6vw,40px)] mb-10">
          Different, not incrementally better.
        </h2>
        <div className="divide-y divide-[#ECECF0] border-y border-[#ECECF0]">
          {versus.map(([who, them, us]) => (
            <div key={who} className="grid md:grid-cols-[160px_1fr_1fr] gap-2 md:gap-6 py-5">
              <span className="text-[14px] font-semibold text-[#232329]">{who}</span>
              <span className="text-[13.5px] text-[#8A8A94]">{them}</span>
              <span className="text-[13.5px] text-[#232329] font-medium">{us}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── The raise ── */}
      <section className="bg-[#0A0A0B]">
        <div className="mx-auto max-w-[980px] px-5 md:px-8 py-20 md:py-24">
          <p className="text-[13px] font-medium text-[#A99EE8] mb-4">The raise</p>
          <h2 className="font-light text-white leading-[1.08] tracking-[-0.03em] text-[clamp(28px,4vw,44px)] max-w-[16ch]">
            Raising {RAISE.amount} to turn a live product into a category.
          </h2>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-12 pb-10 border-b border-white/10">
            {[["Stage", RAISE.stage], ["Target", RAISE.amount], ["Instrument", RAISE.instrument]].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[13px] text-white/45 mb-1">{k}</dt>
                <dd className="text-[22px] font-semibold tracking-[-0.02em] text-white">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[14.5px] text-white/60 leading-relaxed max-w-[600px] mt-8">
            <span className="text-white font-medium">Use of funds. </span>{RAISE.use}
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-10 h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#ffffff] text-[#0A0A0B] text-sm font-medium hover:bg-[#f0f0f2] transition-colors">
            Request the data room <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      {/* ── Footer note ── */}
      <section className="mx-auto max-w-[980px] px-5 md:px-8 py-16 text-center">
        <HyrdeMark size={22} />
        <p className="text-[13px] text-[#8A8A94] mt-4">
          Hyrde · Built in Cairo, for the world · {CONTACT_EMAIL}
        </p>
      </section>
    </div>
  );
}
