export interface Job {
  id: string;
  brief: string;
  budget: string;
  postedAt: string;
  status: "open" | "closed";
  matchCount: number;
}

export interface AIMatch {
  id: string;
  name: string;
  skill: string;      // slug e.g. "react-developer"
  rate: number;
  score: number;
  bio: string;
  location: string;   // city slug or free text
  rationale: string;
  highlights: string[];
}

export interface RegisteredFreelancer {
  id: string;
  name: string;
  email: string;
  location: string;
  skill: string;      // slug
  rate: string;
  bio: string;
  portfolio: string;
  joinedAt: string;
  assessment?: SkillAssessmentResult;   // PART 1 — verified skill profile
}

// ─── PART 1 — AI Skill Assessment ("prove it, don't claim it") ───────────────
export type TalentLevel = "senior" | "mid" | "junior" | "starter";

export interface SkillAssessmentResult {
  score: number;            // 0–100 verified skill score
  band: string;             // "Exceptional" | "Strong" | "Promising" | "Rising"
  bandBlurb: string;        // human-readable explanation of the band
  level: TalentLevel;       // used by the matching engine to level work
  summary: string;          // 1–2 sentence AI read of the work sample
  verifiedSkills: string[]; // concrete skills the sample demonstrated
  strengths: string[];      // what stood out
  growthAreas: string[];    // where to grow (never disqualifying)
  source: "ai" | "heuristic"; // whether a real model or the local fallback scored it
}

// ─── PART 1 — Living reputation (recency-weighted delivery signals) ──────────
export interface ReputationResult {
  overall: number;          // 0–100 composite
  onTimeRate: number;       // 0–100
  repeatHireRate: number;   // 0–100
  responseHours: number;    // avg hours to first response
  recentScore: number;      // 0–100, last-90-day feedback weighted most
  completed: number;        // jobs delivered
}

// ─── PART 1 — Rising-talent / audition pool (small real paid trial tasks) ────
export interface TrialTask {
  id: string;
  title: string;
  skill: string;            // slug
  estimateHours: number;
  payUsd: number;
  blurb: string;
}

export interface ParsedCV {
  name: string;
  email: string;
  location: string;
  skill: string;
  rate: string;
  bio: string;
  portfolio: string;
  highlights: string[];
  yearsExperience: number;
  source: "ai" | "heuristic";
}

export interface Booking {
  id: string;
  slotLabel: string;
  slotIso: string;
  name: string;
  email: string;
  topic: string;
  createdAt: string;
}
