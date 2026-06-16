import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SKILLS } from "@/lib/data";
import { SKILL_ASSESSMENT } from "@/content/marketing";
import { evaluateSkillSample, scoreBand, levelForScore } from "@/lib/services";
import type { SkillAssessmentResult, TalentLevel } from "@/lib/types";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

// PART 1 — "Prove it, don't claim it".
// Scores a short, domain-specific work sample into a verified skill profile.
// NEVER a pass/fail gate: a low score still admits and matches to right-level work.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req); if (blocked) return blocked;
  const { skill, sample } = await req.json();

  if (!sample || typeof sample !== "string" || sample.trim().length < 40) {
    return NextResponse.json(
      { error: "Please write a bit more so we can evaluate your work." },
      { status: 400 },
    );
  }

  const skillData = SKILLS[skill];
  const category = skillData?.category ?? "Engineering";
  const challenge =
    SKILL_ASSESSMENT.challenges[category] ?? SKILL_ASSESSMENT.challenges.Engineering;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 900,
      messages: [
        {
          role: "user",
          content: `You are the AI skill assessor for Hyrde, a freelance platform whose motto is "prove it, don't claim it." You read a short work sample and produce a fair, verified skill profile. This is NOT pass/fail — even a low score admits the person; it just levels the work they're matched to. Be encouraging but honest.

SKILL: ${skillData?.label ?? skill} (${category})
CHALLENGE GIVEN: "${challenge.prompt}"

CANDIDATE'S WORK SAMPLE:
"""${sample.trim().slice(0, 4000)}"""

Score the sample 0–100 on demonstrated skill, reasoning quality, and practical judgment. Reward clear thinking and concrete decisions over length or jargon.

Return ONLY valid JSON — no markdown fences, no text outside JSON:
{
  "score": 0-100,
  "summary": "1-2 sentence read of the work — specific, encouraging, honest",
  "verifiedSkills": ["concrete skill the sample actually demonstrated", "..."],
  "strengths": ["what stood out", "..."],
  "growthAreas": ["where to grow next — never disqualifying", "..."]
}`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr) as {
      score: number;
      summary: string;
      verifiedSkills: string[];
      strengths: string[];
      growthAreas: string[];
    };

    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    const band = scoreBand(score);
    const level: TalentLevel = levelForScore(score);

    const result: SkillAssessmentResult = {
      score,
      band: band.label,
      bandBlurb: band.blurb,
      level,
      summary: parsed.summary ?? "",
      verifiedSkills: (parsed.verifiedSkills ?? []).slice(0, 5),
      strengths: (parsed.strengths ?? []).slice(0, 4),
      growthAreas: (parsed.growthAreas ?? []).slice(0, 3),
      source: "ai",
    };

    return NextResponse.json({ assessment: result });
  } catch (err) {
    console.error("Assess API error:", err);
    // Graceful fallback — deterministic local evaluator keeps the flow demoable.
    const assessment = evaluateSkillSample({ skill, sample });
    return NextResponse.json({ assessment });
  }
}
