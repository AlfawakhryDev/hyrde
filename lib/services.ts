// ───────────────────────────────────────────────────────────────────────────
//  lib/services.ts
//  STUB SERVICE LAYER. Clearly-named functions that return realistic mock data
//  so the whole UI is demoable today. Each function marks the exact spot where
//  a real AI model / backend plugs in. Pure & isomorphic (no React, no fetch) —
//  safe to import from API routes and Server Components alike.
//
//  Live integration points:
//    • evaluateSkillSample()  → POST /api/assess  (real Claude, falls back here)
//    • generateShortlist()    → POST /api/match   (real Claude, falls back here)
// ───────────────────────────────────────────────────────────────────────────

import { SKILLS, CITIES, MOCK_FREELANCERS } from "@/lib/data";
import { SKILL_ASSESSMENT } from "@/content/marketing";
import type {
  SkillAssessmentResult,
  ReputationResult,
  TrialTask,
  TalentLevel,
  AIMatch,
} from "@/lib/types";

// ─── Deterministic seed helper (so mock data is stable per id, not random) ───
function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
function within(seed: number, min: number, max: number): number {
  return min + (seed % (max - min + 1));
}

// ═════════════════════════════════════════════════════════════════════════════
//  RATE FLOORS — minimum fair rate per skill + region.
//  Floor = half of the local market rate, never below a global $/hr minimum.
// ═════════════════════════════════════════════════════════════════════════════
const GLOBAL_MIN_HOURLY = 15;

export function getRateFloor(skillSlug: string, citySlug = "remote"): number {
  const skill = SKILLS[skillSlug];
  const city = CITIES[citySlug] ?? CITIES["remote"];
  if (!skill) return GLOBAL_MIN_HOURLY;
  const market = skill.avgRate * city.multiplier;
  return Math.max(GLOBAL_MIN_HOURLY, Math.round(market * 0.5));
}

/** Is a proposed rate below the protected floor for this skill/region? */
export function isBelowFloor(rate: number, skillSlug: string, citySlug = "remote"): boolean {
  return rate < getRateFloor(skillSlug, citySlug);
}

// ═════════════════════════════════════════════════════════════════════════════
//  SKILL ASSESSMENT — score band lookup + deterministic local evaluator.
//  evaluateSkillSample() is the heuristic fallback the /api/assess route uses
//  when the live model is unavailable. Never pass/fail: a low score still admits.
// ═════════════════════════════════════════════════════════════════════════════
export function scoreBand(score: number): { label: string; blurb: string } {
  const band = SKILL_ASSESSMENT.bands.find(b => score >= b.min) ?? SKILL_ASSESSMENT.bands.at(-1)!;
  return { label: band.label, blurb: band.blurb };
}

export function levelForScore(score: number): TalentLevel {
  if (score >= 90) return "senior";
  if (score >= 75) return "mid";
  if (score >= 60) return "junior";
  return "starter";
}

/**
 * evaluateSkillSample — STUB / fallback evaluator.
 * Returns a realistic, deterministic verified profile from the work sample.
 * The real signal comes from POST /api/assess (Claude); this keeps the UI fully
 * demoable offline and shows exactly what the model is expected to return.
 */
export function evaluateSkillSample(input: {
  skill: string;
  sample: string;
}): SkillAssessmentResult {
  const { skill, sample } = input;
  const skillData = SKILLS[skill];
  const category = skillData?.category ?? "Engineering";
  const text = (sample ?? "").trim();

  // Heuristic signal: length + structure + concrete vocabulary → a plausible score.
  const words = text.split(/\s+/).filter(Boolean).length;
  const lengthSignal = Math.min(1, words / 140);                 // rewards substance
  const structureSignal = /[.!?].*[.!?]/.test(text) ? 1 : 0.6;   // multiple sentences
  const specificSignal = /\b(because|trade-?off|measure|root cause|step|first|test|why|approach)\b/i.test(text) ? 1 : 0.7;
  const seed = seedFrom(text || skill);
  const jitter = within(seed, -4, 5);

  const raw = 58 + lengthSignal * 26 + (structureSignal - 0.6) * 18 + (specificSignal - 0.7) * 22 + jitter;
  const score = Math.max(42, Math.min(98, Math.round(raw)));
  const band = scoreBand(score);

  const verifiedSkills = verifiedSkillsFor(category, skill);

  return {
    score,
    band: band.label,
    bandBlurb: band.blurb,
    level: levelForScore(score),
    summary:
      score >= 75
        ? `Clear, well-reasoned ${skillData?.label ?? "work"} sample with concrete decisions and trade-offs.`
        : score >= 60
        ? `Solid ${skillData?.label ?? "work"} sample showing real ability with room to deepen the reasoning.`
        : `A genuine attempt that gets you matched to right-sized work while you build your track record.`,
    verifiedSkills,
    strengths:
      score >= 75
        ? ["Structured problem-solving", "Explains the 'why', not just the 'what'", "Practical, ship-ready judgment"]
        : ["Hands-on instinct", "Willingness to reason out loud"],
    growthAreas:
      score >= 75
        ? ["Quantify impact where you can"]
        : ["Add more concrete steps and trade-offs", "Tie decisions to a measurable outcome"],
    source: "heuristic",
  };
}

function verifiedSkillsFor(category: string, skill: string): string[] {
  const byCategory: Record<string, string[]> = {
    Engineering: ["Problem decomposition", "Debugging", "Code reasoning", "Trade-off analysis"],
    Data:        ["Data integrity", "Pipeline design", "Root-cause analysis", "Monitoring"],
    Design:      ["UX judgment", "Prioritization", "Hypothesis-driven design", "Communication"],
    Writing:     ["Positioning", "Clarity", "Audience awareness", "Editing"],
    Marketing:   ["Channel strategy", "Prioritization", "Metric-driven thinking", "Budgeting"],
    Creative:    ["Concepting", "Narrative", "Visual reasoning", "Craft"],
  };
  const base = byCategory[category] ?? byCategory.Engineering;
  const label = SKILLS[skill]?.label;
  return label ? [label, ...base].slice(0, 4) : base.slice(0, 4);
}

// ═════════════════════════════════════════════════════════════════════════════
//  LIVING REPUTATION — derive a recency-weighted composite from delivery signals.
//  computeReputation() works on real signals; mockReputation() fabricates a
//  stable, plausible record per freelancer id for the demo.
// ═════════════════════════════════════════════════════════════════════════════
export function computeReputation(signals: {
  onTimeRate: number;     // 0–100
  repeatHireRate: number; // 0–100
  responseHours: number;  // lower is better
  recentScore: number;    // 0–100, last 90 days
  completed: number;
}): ReputationResult {
  const responseScore = Math.max(0, 100 - signals.responseHours * 8); // 0h→100, ~12h→0
  // Recent feedback weighted most (40%) so reputation reflects who you are now.
  const overall = Math.round(
    signals.recentScore * 0.4 +
      signals.onTimeRate * 0.25 +
      signals.repeatHireRate * 0.2 +
      responseScore * 0.15,
  );
  return {
    overall: Math.max(0, Math.min(100, overall)),
    onTimeRate: signals.onTimeRate,
    repeatHireRate: signals.repeatHireRate,
    responseHours: signals.responseHours,
    recentScore: signals.recentScore,
    completed: signals.completed,
  };
}

/** Stable mock reputation for a freelancer id — for cards/profiles in the demo. */
export function mockReputation(id: string, baseScore = 88): ReputationResult {
  const s = seedFrom(id);
  return computeReputation({
    onTimeRate: within(s, 88, 100),
    repeatHireRate: within(s >> 2, 35, 80),
    responseHours: within(s >> 4, 1, 5),
    recentScore: Math.min(100, baseScore + within(s >> 6, -3, 8)),
    completed: within(s >> 8, 6, 60),
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  AI-AS-AGENT — evidence-backed intro the freelancer's agent writes for them.
//  generateIntro() is the template fallback; /api/pitch streams the live version.
// ═════════════════════════════════════════════════════════════════════════════
export function generateIntro(input: {
  name: string;
  skill: string;
  bio: string;
  brief: string;
}): string {
  const skillLabel = SKILLS[input.skill]?.label ?? input.skill;
  const firstName = input.name.split(" ")[0] || input.name;
  return [
    `Hi — I'm ${firstName}, a ${skillLabel}. Your brief lines up closely with what I do.`,
    input.bio ? `Relevant background: ${input.bio}` : "",
    `I can scope this quickly and start with a small, clearly-defined milestone so you can judge fit before committing. Happy to share work samples that map directly to what you need.`,
  ]
    .filter(Boolean)
    .join(" ");
}

// ═════════════════════════════════════════════════════════════════════════════
//  BLIND-FIRST SHORTLIST — generateShortlist() ranks the pool and anonymizes
//  identity (name/photo/country) so skill leads. /api/match returns the live,
//  Claude-scored version; this deterministic ranker is the offline fallback.
// ═════════════════════════════════════════════════════════════════════════════
export function blindLabel(index: number): string {
  return `Candidate ${String.fromCharCode(65 + index)}`; // A, B, C…
}

export function generateShortlist(input: {
  brief: string;
  pool?: Array<{ id: string; name: string; skill: string; rate: number; bio: string; location: string; score?: number }>;
  limit?: number;
}): AIMatch[] {
  const pool = input.pool ?? MOCK_FREELANCERS.map(f => ({ ...f }));
  const brief = input.brief.toLowerCase();
  const limit = input.limit ?? 5;

  return pool
    .map(f => {
      const label = (SKILLS[f.skill]?.label ?? f.skill).toLowerCase();
      // crude keyword overlap as a stand-in for real semantic matching
      const skillHit = brief.includes(label) || label.split(" ").some(w => w.length > 3 && brief.includes(w)) ? 35 : 0;
      const bioHit = f.bio
        .toLowerCase()
        .split(/[\s,.]+/)
        .filter(w => w.length > 4 && brief.includes(w)).length * 4;
      const base = f.score ?? 80;
      const score = Math.min(100, Math.round(base * 0.6 + skillHit + Math.min(20, bioHit)));
      return {
        id: f.id,
        name: f.name,
        skill: f.skill,
        rate: f.rate,
        bio: f.bio,
        location: f.location,
        score,
        rationale: `Matched on ${SKILLS[f.skill]?.label ?? f.skill} with relevant experience for this brief.`,
        highlights: [SKILLS[f.skill]?.label ?? f.skill, `$${f.rate}/hr`].filter(Boolean) as string[],
      } satisfies AIMatch;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ═════════════════════════════════════════════════════════════════════════════
//  RISING-TALENT POOL — small, real, paid trial tasks for new/leveling talent.
//  risingTalentTasks() returns mock open auditions for a given skill.
// ═════════════════════════════════════════════════════════════════════════════
export function risingTalentTasks(skillSlug?: string): TrialTask[] {
  const all: TrialTask[] = [
    { id: "t1", title: "Fix a flaky checkout form", skill: "react-developer", estimateHours: 3, payUsd: 180, blurb: "Validate + fix focus loss on a multi-step form." },
    { id: "t2", title: "Build a single ETL connector", skill: "python-developer", estimateHours: 4, payUsd: 240, blurb: "Pull a public API into a clean daily CSV." },
    { id: "t3", title: "Redesign one onboarding screen", skill: "ux-designer", estimateHours: 3, payUsd: 210, blurb: "Cut drop-off on step two — Figma deliverable." },
    { id: "t4", title: "Write 3 landing-page variants", skill: "copywriter", estimateHours: 2, payUsd: 140, blurb: "Hero + subhead A/B/C for a B2B SaaS." },
    { id: "t5", title: "Audit a Shopify theme's speed", skill: "shopify-developer", estimateHours: 3, payUsd: 190, blurb: "Find the top 3 LCP regressions and fix one." },
    { id: "t6", title: "30-day growth plan draft", skill: "growth-marketer", estimateHours: 3, payUsd: 200, blurb: "One channel, one metric, one experiment plan." },
  ];
  if (!skillSlug) return all;
  const exact = all.filter(t => t.skill === skillSlug);
  return exact.length ? exact : all.slice(0, 3);
}
