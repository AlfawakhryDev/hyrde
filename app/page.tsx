import type { Metadata } from "next";
import Link from "next/link";
import LiveTasks from "@/components/home/LiveTasks";
import { HyrdeMark } from "@/components/Logo";
import HeroBackdrop from "@/components/home/HeroBackdrop";
import MatchDemo from "@/components/home/MatchDemo";
import AliveGrid from "@/components/home/AliveGrid";
import HowItWorks from "@/components/home/HowItWorks";
import GlobalPay from "@/components/home/GlobalPay";
import OutcomeShowcase from "@/components/home/OutcomeShowcase";

export const metadata: Metadata = {
  title: { absolute: "Hire Interview-Vetted Freelancers, AI-Matched | Hyrde" },
  description:
    "Every freelancer on Hyrde passed an adaptive AI skill interview. Post a task and the AI matches it to the best-vetted specialist in that category. No bidding, no proposal spam, no pay-to-apply.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hire Interview-Vetted Freelancers, AI-Matched | Hyrde",
    description:
      "AI-vetted talent, matched to your task. No bidding, no proposal spam. Free to hire during early access.",
    url: "https://hyrde.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde, AI-vetted freelance talent" }],
  },
};

// Editorial section label: a mono index and a hairline, the way a printed spec
// is numbered. Replaces the pastel "kicker" pills.
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

const CHIP_CLUSTER = [
  { label: "Development",       x: "6%",  y: "12%" },
  { label: "Design",            x: "62%", y: "6%"  },
  { label: "Copywriting",       x: "74%", y: "38%" },
  { label: "Marketing",         x: "8%",  y: "58%" },
  { label: "Data",              x: "58%", y: "72%" },
  { label: "Technical writing", x: "22%", y: "84%" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper">

      {/* ── Hero — outcomes, not gigs ── */}
      <section className="relative -mt-[104px] min-h-[100svh] flex items-center overflow-hidden bg-[#100F0B]">
        <HeroBackdrop />
        <div className="relative w-full mx-auto max-w-[1180px] px-5 md:px-8 pt-[120px] pb-12 md:pt-[124px]">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-16 items-center">

            {/* Left — the pitch */}
            <div>
              <div className="flex items-center gap-2.5 text-white/90 mb-8">
                <HyrdeMark size={22} />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/40">Vetted, then matched</span>
              </div>

              <h1 className="font-display font-light text-[#F7F5F0] leading-[1.04] tracking-[-0.015em] text-[clamp(40px,5.4vw,70px)] max-w-[13ch]">
                Don&apos;t hire a freelancer. Hire an <em className="italic font-normal text-white">outcome</em>.
              </h1>

              <p className="text-white/55 text-[15.5px] md:text-[16.5px] max-w-[500px] leading-[1.62] mt-8">
                Tell us what you actually want, like &ldquo;I need an MVP&rdquo; or &ldquo;redesign my
                Shopify store.&rdquo; We scope it into a milestone plan, match a vetted specialist to
                each step, and sequence delivery. You manage the plan, not a pile of freelancers.
              </p>

              <div className="mt-8 border-t border-white/10 pt-6 max-w-[460px] flex flex-col gap-2.5">
                {[
                  "The outcome, decomposed into ordered milestones",
                  "Each milestone matched to one vetted specialist",
                  "Approve a milestone, the next one matches itself",
                ].map((b, i) => (
                  <div key={b} className="flex items-baseline gap-3.5 text-[13.5px] text-white/65 leading-snug">
                    <span className="font-mono text-[11px] text-white/30 shrink-0">0{i + 1}</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-9">
                <Link
                  href="/signup"
                  className="h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors"
                >
                  Describe your outcome
                </Link>
                <Link
                  href="/signup?next=%2Fvetting"
                  className="text-sm font-medium text-white/70 hover:text-white underline decoration-white/25 underline-offset-[5px] hover:decoration-white/60 transition-colors"
                >
                  I want to be hired
                </Link>
              </div>
            </div>

            {/* Right — the outcome plan, building itself */}
            <div className="lg:pl-2">
              <OutcomeShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* ── Single tasks too — the matching engine, live ── */}
      <section className="relative overflow-hidden bg-[#100F0B]">
        <div className="relative mx-auto max-w-[1180px] px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <Kicker n="01" label="Single tasks" dark />
            <h2 className="font-display font-light text-[#F7F5F0] leading-[1.06] tracking-[-0.015em] text-[clamp(32px,4.6vw,54px)] max-w-[13ch]">
              The proposal pile ends <em className="italic font-normal">here</em>.
            </h2>
            <p className="text-white/55 text-[15.5px] md:text-[16px] max-w-[440px] leading-[1.62] mt-7">
              Got a single task? Post it and the AI matches it to the one best-vetted
              specialist. No bidding, no browsing, no pay-to-apply. Every freelancer here
              passed an adaptive AI skill interview.
            </p>
            <Link
              href="/signup"
              className="mt-9 h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#F7F5F0] text-[#100F0B] text-sm font-medium hover:bg-white transition-colors"
            >
              Post a task
            </Link>
          </div>

          <div className="lg:pl-2">
            <MatchDemo />
          </div>
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
            <Kicker n="02" label="What makes it trustworthy" />
            <h2 className="font-display font-light text-ink leading-[1.03] tracking-[-0.015em] text-[clamp(34px,5vw,60px)]">
              A different definition of <em className="italic font-normal">vetted</em>.
            </h2>
            <p className="text-[15px] text-[#57564F] leading-[1.62] mt-6 max-w-[420px]">
              Not a badge you bought or a portfolio you can generate. An interview you have to pass,
              in the category you claim.
            </p>
            <Link href="/vetting" className="mt-7 inline-block text-[14px] font-medium text-ink underline decoration-[#C9C5B8] underline-offset-[5px] hover:decoration-ink transition-colors">
              How vetting works
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
        <Kicker n="03" label="Why teams switch" />
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,52px)] max-w-[16ch] mb-14">
          Built for people who have been burned by the last platform.
        </h2>
        <AliveGrid />
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 pb-10">
        <Kicker n="04" label="How it works" />
        <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,52px)] max-w-[18ch] mb-14">
          Brief to paid, in three moves.
        </h2>
        <HowItWorks />
      </section>

      {/* ── Split: vetting ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Kicker n="05" label="The interview" />
          <h2 className="font-display font-light text-ink leading-[1.05] tracking-[-0.015em] text-[clamp(32px,4.6vw,50px)] max-w-[15ch]">
            Vetting built for the AI-spam era.
          </h2>
          <p className="text-[15px] text-[#57564F] leading-[1.62] max-w-[440px] mt-6">
            Badges can be farmed. Portfolios can be generated. So we interview instead.
            Four adaptive questions, a scenario, a probe into your own answer, a live
            work sample, and a shipped-project deep dive, graded out of 100 against a strict
            rubric. Generic answers get detected and capped.
          </p>
          <Link href="/vetting" className="mt-7 inline-block text-[14px] font-medium text-ink underline decoration-[#C9C5B8] underline-offset-[5px] hover:decoration-ink transition-colors">
            Take the interview
          </Link>
        </div>

        {/* Collage of interview artifacts, lights up on hover */}
        <div tabIndex={0} className="vc-alive grid grid-cols-2 gap-3 cursor-default">
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5 col-span-2">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">Interviewer · 2 / 4</p>
            <p className="text-[14px] text-[#2A2A24] leading-relaxed">
              &ldquo;You said data ends the argument politely. <span className="vc-probe">Walk me through the actual
              A/B setup. What sample size before you call it?</span>&rdquo;
            </p>
          </div>
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">Result</p>
            <span className="vc-stamp inline-block px-2.5 py-1 rounded-[3px] border border-emerald-600/30 bg-emerald-600/10 text-emerald-800 text-[12px] font-medium">
              Copywriting · Strong 87
            </span>
          </div>
          <div className="vc-q rounded-[4px] border border-[#E7E4DB] bg-[#FBFAF6] p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#8A887E] mb-2.5">Rubric</p>
            <p className="text-[12.5px] text-[#57564F] leading-relaxed">Specificity 30 · Judgment 30 · Work sample 25 · Depth 15</p>
          </div>
        </div>
      </section>

      {/* ── Get paid anywhere ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pt-16 pb-24">
        <Kicker n="06" label="Getting paid" />
        <GlobalPay />
      </section>

      {/* ── Live tasks (real data) ── */}
      <LiveTasks />

      {/* ── Dark duo: two sides ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 py-24 grid md:grid-cols-2 gap-4">
        {[
          {
            k: "For clients",
            h: "Post it. A vetted specialist gets matched.",
            d: "Structured brief in one sentence with AI polish, auto-matched to the best-vetted specialist, AI-reviewed delivery. Free during early access.",
            cta: "Post a task free",
            href: "/signup",
          },
          {
            k: "For freelancers",
            h: "Prove it once. Never bid again.",
            d: "Pass the 10-minute interview and matched work comes to you. Keep 100%, and get paid on your own rails: InstaPay, Airtm, PayPal, or USDT.",
            cta: "Find work",
            href: "/signup?next=%2Fvetting",
          },
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

      {/* ── Compare row (internal links) ── */}
      <section className="mx-auto max-w-[1180px] px-5 md:px-8 pb-28">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-[#8A887E] mb-5">Coming from another platform?</p>
        <div className="flex flex-wrap gap-2.5">
          {[
            ["Hyrde vs Upwork", "/upwork-alternative"],
            ["Hyrde vs Fiverr", "/fiverr-alternative"],
            ["Hyrde vs Toptal", "/toptal-alternative"],
            ["Hiring guides", "/guides"],
            ["Browse talent", "/hire"],
          ].map(([label, href]) => (
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
