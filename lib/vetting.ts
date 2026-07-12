// ─── AI skill vetting — domain types + shared config ─────────────────────────

export const VETTING_QUESTIONS = 4;
export const PASS_THRESHOLD = 60;
export const RETAKE_COOLDOWN_HOURS = 24;

export interface TranscriptTurn {
  q: string;
  a?: string;
  askedAt: string;
}

export interface VettingAssessment {
  score: number;                // 0–100
  band: "Vetted" | "Strong" | "Exceptional" | null;
  summary: string;              // grader's written assessment
  verifiedSkills: string[];
  strengths: string[];
  growthAreas: string[];
}

export interface Vetting {
  id: string;
  user_id: string;
  category: string;
  status: "in_progress" | "passed" | "failed" | "abandoned";
  mode: "text" | "video";
  score: number | null;
  band: string | null;
  transcript: TranscriptTurn[];
  assessment: VettingAssessment | null;
  created_at: string;
  completed_at: string | null;
}

export function bandFor(score: number): "Vetted" | "Strong" | "Exceptional" | null {
  if (score >= 88) return "Exceptional";
  if (score >= 75) return "Strong";
  if (score >= PASS_THRESHOLD) return "Vetted";
  return null;
}

export const BAND_STYLES: Record<string, string> = {
  Vetted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Strong: "bg-electric-violet/10 text-electric-violet border-electric-violet/30",
  Exceptional: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
};
