import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SKILLS } from "@/lib/data";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

const SKILL_LABELS = Object.values(SKILLS).map(s => s.label);

// PART 1 — Company-side AI scoping assistant.
// Turns a rough one-liner into a sharper brief and predicts budget + timeline.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req); if (blocked) return blocked;
  const { brief } = await req.json();
  if (!brief || brief.trim().length < 8) {
    return NextResponse.json({ error: "Add a sentence or two about the work first." }, { status: 400 });
  }

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: `You are Hyrde's AI scoping assistant. A company wrote a rough hiring brief. Sharpen it and predict budget + timeline so they get better matches.

ROUGH BRIEF: "${brief.trim()}"

Known skill labels you may reference: ${SKILL_LABELS.join(", ")}.

Return ONLY valid JSON — no markdown fences, no text outside JSON:
{
  "improvedBrief": "a clearer, more specific 2-4 sentence version of their brief that a freelancer could act on",
  "skills": ["the 1-3 most relevant skill labels from the list above"],
  "suggestedBudget": "a realistic range like \"$3k–$8k\" or \"$80–$120/hr\"",
  "suggestedTimeline": "a realistic estimate like \"4–6 weeks\"",
  "questions": ["1-2 short clarifying questions worth answering before posting"]
}`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({
      improvedBrief: parsed.improvedBrief ?? brief,
      skills: (parsed.skills ?? []).slice(0, 3),
      suggestedBudget: parsed.suggestedBudget ?? "unspecified",
      suggestedTimeline: parsed.suggestedTimeline ?? "flexible",
      questions: (parsed.questions ?? []).slice(0, 2),
      source: "ai",
    });
  } catch (err) {
    console.error("Scope API error:", err);
    // Heuristic fallback so the assistant always responds.
    const lower = brief.toLowerCase();
    const skills = SKILL_LABELS.filter(l => lower.includes(l.toLowerCase().split(" ")[0])).slice(0, 3);
    return NextResponse.json({
      improvedBrief:
        brief.trim() +
        (brief.trim().endsWith(".") ? "" : ".") +
        " Please include the key deliverables, the tech or tools involved, and your ideal start date.",
      skills,
      suggestedBudget: "unspecified",
      suggestedTimeline: "flexible",
      questions: ["What does success look like for this project?", "Do you have a hard deadline?"],
      source: "heuristic",
    });
  }
}
