import type { Metadata } from "next";
import Link from "next/link";
import { readStore } from "@/lib/store";
import { MOCK_FREELANCERS, SKILLS, CITIES } from "@/lib/data";
import type { RegisteredFreelancer } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Talent",
  description: "Verified freelancers on Hyrde. AI-scored profiles. 8% fee only on hire.",
};

const CATEGORIES = ["All", "Engineering", "Design", "Data", "Writing", "Marketing", "Creative"];

function scoreColor(s: number) {
  if (s >= 90) return "text-electric-violet bg-electric-violet/10";
  if (s >= 80) return "text-tech-blue-muted bg-surface-container-high";
  return "text-on-surface-variant bg-surface-container-high";
}

export default async function TalentPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const activeCategory = cat ?? "All";
  const registered = readStore<RegisteredFreelancer[]>("freelancers", []);

  // Combine mock (verified) + registered (community)
  const allTalent = [
    ...MOCK_FREELANCERS.map(f => ({
      id: f.id,
      name: f.name,
      skill: f.skill,
      skillLabel: SKILLS[f.skill]?.label ?? f.skill,
      category: SKILLS[f.skill]?.category ?? "General",
      rate: f.rate,
      bio: f.bio,
      location: CITIES[f.location]?.label ?? f.location,
      score: f.score,
      verified: true,
      joinedAt: "",
    })),
    ...registered.map(f => ({
      id: f.id,
      name: f.name,
      skill: f.skill,
      skillLabel: SKILLS[f.skill]?.label ?? f.skill,
      category: SKILLS[f.skill]?.category ?? "General",
      rate: parseInt(f.rate) || 0,
      bio: f.bio,
      location: f.location,
      score: 75, // default score for new registrations
      verified: false,
      joinedAt: f.joinedAt,
    })),
  ];

  const filteredTalent = activeCategory === "All"
    ? allTalent
    : allTalent.filter(f => f.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface-gray">
      {/* Hero */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-violet/10 text-electric-violet text-xs font-semibold font-body mb-3">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
              {filteredTalent.length} freelancers{activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            </span>
            <h1 className="text-4xl font-bold font-headline text-on-surface">
              Verified talent
            </h1>
            <p className="font-body text-on-surface-variant mt-1">
              AI-scored profiles. 8% platform fee — only when you hire.
            </p>
          </div>
          <Link
            href="/post-job"
            className="bg-tech-blue-deep text-white font-semibold font-body px-6 py-3 rounded-full text-sm hover:scale-[0.97] transition-transform whitespace-nowrap"
          >
            Post a project
          </Link>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => {
            const isActive = cat === activeCategory;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/talent" : `/talent?cat=${cat}`}
                className={`text-xs font-semibold font-body px-4 py-2 rounded-full border transition-colors ${
                  isActive
                    ? "border-electric-violet bg-electric-violet text-white"
                    : "border-border-crisp bg-white hover:border-electric-violet hover:text-electric-violet text-on-surface-variant"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>

        {/* Talent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalent.map(f => {
            const initials = f.name
              .split(" ")
              .map(n => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={f.id}
                className="bg-white rounded-xl border border-border-crisp p-5 hover:border-electric-violet/40 hover:shadow-[0_4px_16px_rgba(124,58,237,0.07)] transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full ai-match-gradient flex items-center justify-center font-bold font-headline text-white text-sm shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold font-body text-on-surface text-sm">
                        {f.name}
                      </p>
                      <p className="text-xs text-on-surface-variant font-body">
                        {f.skillLabel}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold font-body px-2.5 py-1 rounded-full shrink-0 ${scoreColor(f.score)}`}
                  >
                    {f.score}%
                  </span>
                </div>

                <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                  {f.bio || "Experienced professional on Hyrde."}
                </p>

                {/* Match strength */}
                <div className="h-1 bg-surface-container-high rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full ai-match-gradient rounded-full"
                    style={{ width: `${f.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border-crisp">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs font-body text-on-surface-variant">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "13px" }}
                      >
                        location_on
                      </span>
                      {f.location}
                    </span>
                    {f.verified && (
                      <span className="text-xs font-semibold font-body text-electric-violet flex items-center gap-0.5">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                        Verified
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold font-headline text-on-surface">
                    {f.rate > 0 ? `$${f.rate}/hr` : "Rate TBD"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTalent.length === 0 && (
          <div className="text-center py-16">
            <span
              className="material-symbols-outlined text-electric-violet mb-4"
              style={{ fontSize: "48px" }}
            >
              people_outline
            </span>
            <h2 className="text-2xl font-bold font-headline text-on-surface mb-2">
              No talent listed yet
            </h2>
            <p className="font-body text-on-surface-variant mb-6">
              Be the first to join as a freelancer.
            </p>
            <Link
              href="/freelancer/join"
              className="bg-electric-violet text-white font-semibold font-body px-7 py-3 rounded-full text-sm hover:scale-[1.02] transition-transform"
            >
              Join as a freelancer
            </Link>
          </div>
        )}
      </section>

      {/* Join CTA */}
      <section className="max-w-[1280px] mx-auto px-6 md:px-12 pb-16">
        <div className="bg-tech-blue-deep rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold font-headline text-white mb-1">
              Want to appear here?
            </h2>
            <p className="font-body text-on-primary-container text-sm">
              Join free. Get matched to real projects. Keep 92% of what you earn.
            </p>
          </div>
          <Link
            href="/freelancer/join"
            className="px-7 py-3 bg-electric-violet text-white rounded-full text-sm font-semibold font-body hover:scale-[1.02] transition-transform whitespace-nowrap"
          >
            Join as a freelancer
          </Link>
        </div>
      </section>
    </div>
  );
}
