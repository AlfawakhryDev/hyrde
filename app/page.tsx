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
    "Every freelancer on Hyrde passed an adaptive AI skill interview. Post a task and the AI matches it to the best-vetted specialist in that exact category — no bidding, no proposal spam, no pay-to-apply.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Hire Interview-Vetted Freelancers, AI-Matched | Hyrde",
    description:
      "AI-vetted talent, category-matched to your task. No bidding, no proposal spam. Free to hire — early access.",
    url: "https://hyrde.net",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hyrde — AI-vetted freelance talent" }],
  },
};

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
    <div className="min-h-screen bg-[#ffffff]">

      {/* ── Hero — outcomes, not gigs (the headline promise) ── */}
      {/* Fills the viewport on every resolution: min-h uses svh (mobile-safe) and
          the content is vertically centered in the space below the fixed nav. */}
      <section className="relative -mt-[104px] min-h-[100svh] flex items-center overflow-hidden bg-[#0A0A0B]">
        {/* Ambient: violet glow + faint grid — reacts to the cursor */}
        <HeroBackdrop />
        <div className="relative w-full mx-auto max-w-[1180px] px-5 md:px-8 pt-[112px] pb-10 md:pt-[116px] md:pb-12">
          <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-10 lg:gap-14 items-center">

            {/* Left — the pitch */}
            <div>
              <div className="flex items-center gap-2 text-white mb-5">
                <HyrdeMark size={24} />
              </div>

              <p className="text-[12.5px] font-medium text-[#A99EE8] mb-3.5">New — beyond single tasks</p>
              <h1 className="font-light text-white leading-[1.0] tracking-[-0.035em] text-[clamp(36px,4.6vw,62px)] max-w-[14ch]">
                Don&apos;t hire a freelancer.{" "}
                <span className="inline-block bg-[#ffffff] text-[#0A0A0B] rounded-2xl px-3.5 leading-[1.12] -rotate-1">Hire an outcome</span>.
              </h1>

              <div className="w-full max-w-[520px] border-b border-white/15 my-5" aria-hidden="true" />

              <p className="text-white/60 text-[15px] md:text-[16px] max-w-[500px] leading-relaxed mb-4">
                Say what you actually want — &ldquo;I need an MVP,&rdquo; &ldquo;redesign my Shopify store&rdquo; — and
                the AI scopes it into a milestone plan, matches a vetted specialist to each, and
                sequences delivery. You manage the plan, not a pile of freelancers.
              </p>

              <ul className="space-y-1.5 max-w-[440px] mb-6">
                {[
                  "AI decomposes the outcome into ordered milestones",
                  "Each milestone matched to one vetted specialist",
                  "Approve a milestone → the next matches automatically",
                ].map(b => (
                  <li key={b} className="flex items-start gap-3 text-[13.5px] text-white/70 leading-snug">
                    <span className="text-[#A99EE8] font-bold mt-px" aria-hidden="true">✓</span>{b}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#ffffff] text-[#0A0A0B] text-sm font-medium hover:bg-[#f0f0f2] transition-colors"
                >
                  Describe your outcome
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/signup?next=%2Fvetting"
                  className="h-11 inline-flex items-center px-6 rounded-full bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                  Find work
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

      {/* ── Single tasks too — the matching engine, playing live ── */}
      <section className="relative overflow-hidden bg-[#0A0A0B]">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 15% 30%, rgba(91,79,207,0.28), transparent 60%)" }}
        />
        <div className="relative mx-auto max-w-[1180px] px-5 md:px-8 py-20 md:py-28 grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[12px] font-medium text-[#A99EE8] mb-4">Or just one thing</p>
            <h2 className="font-light text-white leading-[1.02] tracking-[-0.03em] text-[clamp(32px,4.6vw,56px)] max-w-[13ch]">
              The proposal pile ends{" "}
              <span className="inline-block bg-[#ffffff] text-[#0A0A0B] rounded-xl px-3 leading-[1.15] -rotate-1">here</span>.
            </h2>
            <p className="text-white/60 text-[15px] md:text-[16px] max-w-[440px] leading-relaxed mt-7">
              Got a single task? Post it and the AI matches it to the one best-vetted
              specialist — no bidding, no browsing, no pay-to-apply. Every freelancer here
              passed an adaptive AI skill interview.
            </p>
            <Link
              href="/signup"
              className="mt-9 h-11 inline-flex items-center gap-2 px-6 rounded-full bg-[#ffffff] text-[#0A0A0B] text-sm font-medium hover:bg-[#f0f0f2] transition-colors"
            >
              Post a task
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="lg:pl-2">
            <MatchDemo />
          </div>
        </div>
      </section>

      {/* ── Gradient banner — trust (chips verify themselves on hover) ── */}
      <style>{`
        .tr-alive { outline: none; }
        .tr-alive .tr-shield { transition: transform .45s cubic-bezier(.2,.9,.3,1.3); }
        .tr-alive:is(:hover,:focus-within) .tr-shield { transform: translate(-50%,-50%) scale(1.08); }
        .tr-alive .tr-ring { opacity: 0; }
        .tr-alive:is(:hover,:focus-within) .tr-ring { animation: tr-ring 1.1s ease-out .1s; }
        @keyframes tr-ring { 0% { opacity:.7; transform: translate(-50%,-50%) scale(.7) } 100% { opacity:0; transform: translate(-50%,-50%) scale(1.9) } }
        .tr-alive .tr-chip { transition: all .35s ease; }
        .tr-alive .tr-check { display:inline-block; max-width:0; overflow:hidden; vertical-align:bottom; transition: max-width .3s ease; }
        ${[0,1,2,3,4,5].map(i =>
          `.tr-alive:is(:hover,:focus-within) .tr-chip-${i} { box-shadow: 0 0 0 1.5px rgba(91,79,207,.45), 0 6px 20px rgba(91,79,207,.16); color:#3A3A44; transform: translateY(-3px); transition-delay:${0.08+i*0.1}s }
           .tr-alive:is(:hover,:focus-within) .tr-chip-${i} .tr-check { max-width:20px; transition-delay:${0.16+i*0.1}s }`
        ).join("\n")}
        .vc-alive { outline: none; }
        .vc-alive .vc-q { transition: all .35s ease; }
        .vc-alive:is(:hover,:focus-within) .vc-q { background:#ffffff; box-shadow: 0 10px 32px rgba(10,10,15,.08); }
        .vc-alive .vc-probe { background-image: linear-gradient(#5B4FCF,#5B4FCF); background-repeat:no-repeat; background-size: 0% 1.5px; background-position: 0 100%; transition: background-size .6s ease .15s; }
        .vc-alive:is(:hover,:focus-within) .vc-probe { background-size: 100% 1.5px; }
        .vc-alive .vc-stamp { opacity:.4; transform: scale(.92); transition: all .4s cubic-bezier(.2,.9,.3,1.3) .45s; }
        .vc-alive:is(:hover,:focus-within) .vc-stamp { opacity:1; transform: scale(1.04) rotate(-2deg); }
        .vc-alive .vc-rubric { transition: all .35s ease .6s; }
        .vc-alive:is(:hover,:focus-within) .vc-rubric { color:#5B4FCF; }
        .duo-card { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; }
        .duo-card:hover { transform: translateY(-4px); box-shadow: 0 22px 56px -20px rgba(91,79,207,.35); }
        .duo-card .duo-glow { opacity: 0; transition: opacity .5s ease; }
        .duo-card:hover .duo-glow { opacity: 1; }
      `}</style>
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 mt-6">
        <div tabIndex={0} className="tr-alive relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#EFEDFF] via-[#F8F7FF] to-[#EDF5FF] px-8 md:px-14 py-14 md:py-20 cursor-default">
          <div className="max-w-[520px]">
            <h2 className="font-light text-[#4A4A55] leading-[1.02] tracking-[-0.03em] text-[clamp(34px,5vw,58px)]">
              A new standard for trust
            </h2>
            <Link href="/vetting" className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#4A4A55] hover:text-electric-violet transition-colors">
              <span aria-hidden="true">↳</span> How vetting works
            </Link>
          </div>

          {/* Floating category chips verify themselves around the shield */}
          <div className="hidden lg:block absolute right-10 top-1/2 -translate-y-1/2 w-[380px] h-[240px]" aria-hidden="true">
            <span className="tr-ring absolute left-1/2 top-1/2 w-[92px] h-[92px] rounded-2xl border-2 border-electric-violet/60" />
            <div className="tr-shield absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92px] h-[92px] rounded-2xl bg-[#ffffff] shadow-[0_12px_40px_rgba(91,79,207,0.18)] flex items-center justify-center">
              <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            {CHIP_CLUSTER.map((c, i) => (
              <span
                key={c.label}
                className={`tr-chip tr-chip-${i} absolute px-3 py-1.5 rounded-full bg-[#ffffff] shadow-[0_4px_16px_rgba(10,10,15,0.08)] text-[12px] font-medium text-[#4A4A55]`}
                style={{ left: c.x, top: c.y }}
              >
                <span className="tr-check text-emerald-500 font-bold">✓&nbsp;</span>{c.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why teams switch — cards that perform on hover ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 pt-28 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <h2 className="font-light text-[#7A7A85] leading-[1.05] tracking-[-0.03em] text-[clamp(30px,4.4vw,46px)] max-w-[16ch]">
            Why teams switch — the tip of the iceberg
          </h2>
          <p className="text-[13px] text-[#9a9aa4] mb-1.5 hidden md:block">
            <span aria-hidden="true">↳</span> Hover a card — everything below actually happens on Hyrde
          </p>
        </div>
        <AliveGrid />
      </section>

      {/* ── How it works — three steps that perform ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 pt-20 pb-10">
        <h2 className="font-light text-[#7A7A85] leading-[1.05] tracking-[-0.03em] text-[clamp(30px,4.4vw,46px)] max-w-[18ch] mb-12">
          Brief to paid, in three moves
        </h2>
        <HowItWorks />
      </section>

      {/* ── Split: vetting ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-light text-[#4A4A55] leading-[1.04] tracking-[-0.03em] text-[clamp(32px,4.6vw,52px)] max-w-[15ch]">
            Vetting built for the AI-spam era
          </h2>
          <p className="text-[15px] text-[#6B6B76] leading-relaxed max-w-[440px] mt-6">
            Badges can be farmed. Portfolios can be generated. So we interview instead:
            four adaptive questions — a scenario, a probe into your own answer, a live
            work sample, a shipped-project deep-dive — graded 0–100 against a strict
            rubric. Generic answers are detected and capped.
          </p>
          <Link href="/vetting" className="mt-7 inline-flex items-center gap-2 text-[14px] font-medium text-[#4A4A55] hover:text-electric-violet transition-colors">
            <span aria-hidden="true">↳</span> Take the interview
          </Link>
        </div>

        {/* Collage of interview artifacts — probes, stamps, and lights up on hover */}
        <div tabIndex={0} className="vc-alive grid grid-cols-2 gap-3 cursor-default">
          <div className="vc-q rounded-2xl bg-[#F4F3F8] p-5 col-span-2">
            <p className="text-[11px] font-medium text-electric-violet mb-2">Interviewer · 2/4</p>
            <p className="text-[13.5px] text-[#3A3A44] leading-relaxed">
              &ldquo;You said data ends the argument politely — <span className="vc-probe">walk me through the actual
              A/B setup. What sample size before you call it?</span>&rdquo;
            </p>
          </div>
          <div className="vc-q rounded-2xl bg-[#F4F3F8] p-5">
            <p className="text-[11px] font-medium text-[#8A8A94] mb-2">Result</p>
            <span className="vc-stamp inline-block px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 text-[12px] font-medium">
              Copywriting · Strong 87
            </span>
          </div>
          <div className="vc-q rounded-2xl bg-[#F4F3F8] p-5">
            <p className="text-[11px] font-medium text-[#8A8A94] mb-2">Rubric</p>
            <p className="vc-rubric text-[12.5px] text-[#5B5B66] leading-relaxed">Specificity 30 · Judgment 30 · Work sample 25 · Depth 15</p>
          </div>
        </div>
      </section>

      {/* ── Get paid anywhere — the rails light up ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 pb-24">
        <GlobalPay />
      </section>

      {/* ── Live tasks (real data) ── */}
      <LiveTasks />

      {/* ── Dark duo: two sides ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 pb-24 grid md:grid-cols-2 gap-4">
        {[
          {
            k: "For clients",
            h: "Post it. The AI matches a vetted specialist.",
            d: "Structured brief in one sentence with AI polish, auto-matched to the best-vetted specialist, AI-reviewed delivery. Free during early access.",
            cta: "Post a task free",
            href: "/signup",
          },
          {
            k: "For freelancers",
            h: "Prove it once. Never bid again.",
            d: "Pass the ~10-minute interview and matched work comes to you. Keep 100%, get paid on your rails — InstaPay, Airtm, PayPal, USDT.",
            cta: "Find work",
            href: "/signup?next=%2Fvetting",
          },
        ].map(x => (
          <div key={x.k} className="duo-card relative overflow-hidden rounded-2xl bg-[#0A0A0B] p-8 md:p-10 min-h-[300px] flex flex-col">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(ellipse 80% 70% at 80% 0%, rgba(91,79,207,0.25), transparent 60%)" }}
            />
            <div
              aria-hidden="true"
              className="duo-glow absolute inset-0"
              style={{ backgroundImage: "radial-gradient(ellipse 90% 80% at 80% 0%, rgba(91,79,207,0.45), transparent 65%)" }}
            />
            <p className="relative text-[12px] font-medium text-white/50 mb-3">{x.k}</p>
            <h3 className="relative font-light text-white leading-[1.05] tracking-[-0.03em] text-[clamp(26px,3.2vw,38px)] max-w-[14ch]">
              {x.h}
            </h3>
            <p className="relative text-[13.5px] text-white/55 leading-relaxed max-w-[380px] mt-4 mb-8">{x.d}</p>
            <Link href={x.href} className="relative mt-auto inline-flex items-center gap-2 h-10 w-fit px-5 rounded-full bg-[#ffffff] text-[#0A0A0B] text-sm font-medium hover:bg-[#f0f0f2] transition-colors">
              {x.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ))}
      </section>

      {/* ── Compare row (internal links) ── */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8 pb-28">
        <p className="text-[13px] text-[#8A8A94] mb-4">Coming from another platform?</p>
        <div className="flex flex-wrap gap-3">
          {[
            ["Hyrde vs Upwork", "/upwork-alternative"],
            ["Hyrde vs Fiverr", "/fiverr-alternative"],
            ["Hyrde vs Toptal", "/toptal-alternative"],
            ["Hiring guides", "/guides"],
            ["Browse talent", "/hire"],
          ].map(([label, href]) => (
            <Link key={href} href={href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#E5E5EA] text-[13px] font-medium text-[#4A4A55] hover:border-[#B9B9C2] transition-colors">
              <span aria-hidden="true">↳</span> {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
