import Link from "next/link";
import { SKILLS } from "@/lib/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Freelancers",
  description: "Browse 25+ skill categories. AI-matched talent in 60 seconds. 8% fee only on hire.",
};

const CATEGORIES = ["Engineering","Design","Data","Writing","Marketing","Creative"];

export default function HirePage() {
  const byCategory = CATEGORIES.reduce<Record<string, [string, typeof SKILLS[string]][]>>((acc, cat) => {
    acc[cat] = Object.entries(SKILLS).filter(([, s]) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-surface-gray">
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-16">

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-on-surface mb-2">Find talent by skill</h1>
          <p className="font-body text-on-surface-variant text-lg">AI-matched. Verified. 8% fee only when you hire.</p>
        </div>

        {CATEGORIES.map(cat => {
          const skills = byCategory[cat];
          if (!skills?.length) return null;
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-xl font-bold font-headline text-on-surface mb-4">{cat}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {skills.map(([slug, s]) => (
                  <Link key={slug} href={`/hire/${slug}`}
                    className="bg-white rounded-xl p-5 border border-border-crisp hover:border-electric-violet hover:shadow-[0_4px_16px_rgba(124,58,237,0.08)] transition-all group">
                    <p className="font-bold font-body text-on-surface text-sm group-hover:text-electric-violet transition-colors mb-1">{s.label}</p>
                    <p className="text-xs font-body text-on-surface-variant">${s.avgRate}/hr avg</p>
                    <span className={`inline-block mt-2 text-xs font-semibold font-body px-2.5 py-0.5 rounded-full ${
                      s.demand === "high"
                        ? "bg-electric-violet/10 text-electric-violet"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>{s.demand}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
