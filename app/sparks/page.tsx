"use client";
import { useState } from "react";
import Link from "next/link";
import { MOCK_SPARKS, SPARK_CATEGORIES, type Spark } from "@/lib/sparks";

const CATEGORY_COLOR: Record<string, string> = {
  code:     "bg-blue-50 text-blue-600",
  design:   "bg-purple-50 text-purple-600",
  copy:     "bg-amber-50 text-amber-600",
  data:     "bg-green-50 text-green-600",
  motion:   "bg-pink-50 text-pink-600",
  research: "bg-indigo-50 text-indigo-600",
};

function timeAgo(h: number) {
  if (h < 1)  return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SparkCard({ spark }: { spark: Spark }) {
  return (
    <div className={`bg-white rounded-2xl border flex flex-col gap-3 p-4 hover:shadow-md transition-all ${
      spark.featured ? "border-electric-violet/30 shadow-sm" : "border-border-crisp"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${CATEGORY_COLOR[spark.category] ?? "bg-surface-gray text-on-surface-variant"}`}>
          <span className="material-symbols-outlined" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{spark.categoryIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {spark.featured && (
              <span className="text-[9px] font-semibold bg-electric-violet text-white px-1.5 py-0.5 rounded-full shrink-0">Featured</span>
            )}
            <h3 className="text-sm font-bold font-headline text-tech-blue-deep leading-snug">{spark.title}</h3>
          </div>
          <p className="text-xs font-body text-on-surface-variant leading-relaxed line-clamp-2">{spark.description}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {spark.skills.map(s => (
          <span key={s} className="text-[10px] font-body bg-surface-gray text-on-surface-variant px-2 py-0.5 rounded-full">{s}</span>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-semibold font-body bg-green-50 text-green-700 px-2 py-1 rounded-full">
          ${spark.budgetMin}–${spark.budgetMax}
        </span>
        <span className="text-[11px] font-semibold font-body bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          {spark.timelineLabel}
        </span>
        <span className="text-[11px] font-body text-on-surface-variant ml-auto shrink-0">
          {spark.matchCount} AI matches
        </span>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border-crisp">
        <span className="text-[10px] font-body text-on-surface-variant/60">{timeAgo(spark.postedHoursAgo)}</span>
        <Link
          href="/agent"
          className="ml-auto text-xs font-semibold font-body text-white bg-electric-violet px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
        >
          Claim Spark →
        </Link>
      </div>
    </div>
  );
}

export default function SparksPage() {
  const [active, setActive] = useState("all");

  const filtered = active === "all" ? MOCK_SPARKS : MOCK_SPARKS.filter(s => s.category === active);
  const featured = MOCK_SPARKS.filter(s => s.featured);

  return (
    <div className="min-h-screen bg-surface-gray">

      {/* Hero */}
      <section className="bg-tech-blue-deep pt-24 pb-14 relative overflow-hidden">
        <div className="absolute -top-20 right-0 w-[38rem] h-[38rem] rounded-full bg-electric-violet opacity-20 blur-3xl pointer-events-none" />
        <div className="max-w-[1280px] mx-auto px-6 md:px-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full mb-5">
            <span className="material-symbols-outlined text-electric-violet animate-floaty" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="text-[11px] font-semibold font-body text-white/80 uppercase tracking-widest">New — Hyrde Sparks</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-white leading-[1.05] mb-4 max-w-2xl">
            Quick wins.<br />
            <span className="text-electric-violet">Matched in seconds.</span>
          </h1>
          <p className="font-body text-white/55 text-base max-w-xl leading-relaxed mb-10">
            Micro-tasks under $500, delivered in days — AI-matched to vetted talent the moment you post. No proposals, no bidding, no back-and-forth.
          </p>
          <div className="flex flex-wrap gap-8">
            {[
              { value: "120+",   label: "Sparks live now"   },
              { value: "$180",   label: "Average budget"    },
              { value: "< 60s",  label: "AI match time"     },
              { value: "2 days", label: "Average delivery"  },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-bold font-headline text-white leading-none">{s.value}</p>
                <p className="text-xs font-body text-white/45 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-10">

        {/* Featured */}
        {active === "all" && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>star</span>
              <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Featured Sparks</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map(s => <SparkCard key={s.id} spark={s} />)}
            </div>
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          {SPARK_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all ${
                active === cat.id
                  ? "bg-electric-violet text-white shadow-sm"
                  : "bg-white border border-border-crisp text-on-surface-variant hover:border-electric-violet/40"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "13px", fontVariationSettings: active === cat.id ? "'FILL' 1" : "'FILL' 0" }}
              >
                {cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <p className="text-xs font-body text-on-surface-variant mb-4">
          {filtered.length} spark{filtered.length !== 1 ? "s" : ""} available
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <SparkCard key={s.id} spark={s} />)}
        </div>

        {/* Post a Spark CTA */}
        <div className="mt-14 bg-tech-blue-deep rounded-2xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 70% 50%, #5B4FCF 0%, transparent 60%)" }} />
          <span className="material-symbols-outlined text-electric-violet mb-3 block animate-floaty relative z-10" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
          <h2 className="text-2xl font-bold font-headline text-white mb-2 relative z-10">Got a quick task?</h2>
          <p className="font-body text-white/55 text-sm mb-7 max-w-sm mx-auto relative z-10">
            Post a Spark and get AI-matched with a vetted expert in under 60 seconds — no proposals, no bidding.
          </p>
          <Link
            href="/post-job"
            className="relative z-10 inline-flex items-center gap-2 bg-electric-violet text-white font-semibold font-body px-6 py-3 rounded-full hover:opacity-90 transition-opacity text-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>add</span>
            Post a Spark
          </Link>
        </div>
      </div>
    </div>
  );
}
