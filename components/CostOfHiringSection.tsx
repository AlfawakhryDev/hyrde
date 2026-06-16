import { COST_OF_HIRING } from "@/content/marketing";
import StatCounter from "@/components/StatCounter";

interface Props {
  /** Tighten vertical padding when embedded inside another page. */
  compact?: boolean;
  className?: string;
}

/**
 * PART 3 — "Hiring is broken — here's what it costs".
 * Reusable animated stats section. Reads every figure + source from
 * content/marketing.ts. Drop it on the landing page, /about, and /enterprise.
 */
export default function CostOfHiringSection({ compact = false, className = "" }: Props) {
  const { eyebrow, heading, subheading, groups, contrast } = COST_OF_HIRING;

  return (
    <section className={`${compact ? "py-16" : "py-24"} px-6 md:px-12 bg-surface-gray ${className}`}>
      <div className="max-w-[1280px] mx-auto">
        {/* Heading */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
            {eyebrow}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep mt-3 mb-4 leading-tight">
            {heading}
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed">{subheading}</p>
        </div>

        {/* Groups */}
        <div className="space-y-12">
          {groups.map(group => (
            <div key={group.id}>
              {/* Theme header */}
              <div className="flex items-center gap-3 mb-5">
                <span className="w-9 h-9 rounded-lg bg-electric-violet/10 flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-electric-violet"
                    style={{ fontSize: "20px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {group.icon}
                  </span>
                </span>
                <div>
                  <h3 className="text-lg font-bold font-headline text-tech-blue-deep leading-tight">
                    {group.theme}
                  </h3>
                  <p className="text-xs font-body text-on-surface-variant">{group.blurb}</p>
                </div>
              </div>

              {/* Stat cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {group.stats.map(stat => (
                  <div
                    key={stat.id}
                    className="bg-white rounded-xl border border-border-crisp p-5 flex flex-col hover:border-electric-violet/30 transition-colors"
                  >
                    <StatCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      display={stat.display}
                      comma={stat.comma}
                      className="text-3xl md:text-4xl font-bold font-headline text-tech-blue-deep tracking-tight"
                    />
                    <p className="text-sm font-semibold font-body text-on-surface mt-2 leading-snug">
                      {stat.label}
                    </p>
                    {stat.detail && (
                      <p className="text-xs font-body text-on-surface-variant mt-1.5 leading-relaxed flex-1">
                        {stat.detail}
                      </p>
                    )}
                    <p className="text-[10px] font-body text-on-surface-variant/70 mt-3 pt-2 border-t border-border-crisp uppercase tracking-wide">
                      Source: {stat.source}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Hyrde contrast counter */}
        <div className="mt-14 rounded-2xl ai-match-gradient p-8 md:p-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-7">
              <h3 className="text-2xl md:text-3xl font-bold font-headline text-white leading-tight">
                {contrast.heading}
              </h3>
              <p className="font-body text-ai-glow text-sm mt-1">{contrast.blurb}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {contrast.stats.map(stat => (
                <div key={stat.id}>
                  <StatCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    display={stat.display}
                    comma={stat.comma}
                    className="text-4xl md:text-5xl font-bold font-headline text-white tracking-tight"
                  />
                  <p className="text-xs font-body text-white/70 mt-2 leading-relaxed">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
