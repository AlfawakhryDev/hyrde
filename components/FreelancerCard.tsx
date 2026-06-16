import { SKILLS, CITIES } from "@/lib/data";
import { mockReputation } from "@/lib/services";

interface Props {
  freelancer: {
    id: string; name: string; skill: string; rate: number;
    score: number; bio: string; location: string;
  };
  highlight?: boolean;
}

const scoreColor = (s: number) =>
  s >= 90
    ? "text-electric-violet bg-electric-violet/10"
    : s >= 80
    ? "text-tech-blue-muted bg-primary-fixed/30"
    : "text-on-surface-variant bg-surface-container-high";

export default function FreelancerCard({ freelancer, highlight }: Props) {
  const skillData = SKILLS[freelancer.skill];
  const cityData  = CITIES[freelancer.location];
  const initials  = freelancer.name.split(" ").map(n => n[0]).join("");
  const rep       = mockReputation(freelancer.id, freelancer.score);

  return (
    <div className={`rounded-xl p-5 border bg-white transition-all ${
      highlight
        ? "border-l-4 border-l-electric-violet border-border-crisp shadow-sm"
        : "border-border-crisp hover:border-electric-violet/40"
    }`}>
      {highlight && (
        <div className="mb-3">
          <span className="text-xs font-semibold font-body bg-electric-violet/10 text-electric-violet px-3 py-1 rounded-full">
            Top match
          </span>
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full ai-match-gradient flex items-center justify-center font-bold font-headline text-white text-sm">
            {initials}
          </div>
          <div>
            <p className="font-semibold font-body text-tech-blue-deep text-sm">{freelancer.name}</p>
            <p className="text-xs text-on-surface-variant font-body">{skillData?.label}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold font-body px-2.5 py-1 rounded-full ${scoreColor(freelancer.score)}`}>
          {freelancer.score}%
        </span>
      </div>

      <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-3">{freelancer.bio}</p>

      {/* Living reputation — objective, recency-weighted delivery signals */}
      <div className="flex items-center gap-3 mb-3 text-[11px] font-body text-on-surface-variant">
        <span className="flex items-center gap-1" title="On-time delivery">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>task_alt</span>
          {rep.onTimeRate}% on-time
        </span>
        <span className="flex items-center gap-1" title="Repeat-hire rate">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>repeat</span>
          {rep.repeatHireRate}% repeat
        </span>
        <span className="flex items-center gap-1" title="Avg response time">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
          ~{rep.responseHours}h reply
        </span>
      </div>

      {/* Match strength bar */}
      <div className="mb-3">
        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full ai-match-gradient rounded-full transition-all"
            style={{ width: `${freelancer.score}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border-crisp">
        <span className="flex items-center gap-1 text-xs font-body text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>location_on</span>
          {cityData?.label ?? freelancer.location}
        </span>
        <span className="text-sm font-bold font-headline text-tech-blue-deep">${freelancer.rate}/hr</span>
      </div>
    </div>
  );
}
