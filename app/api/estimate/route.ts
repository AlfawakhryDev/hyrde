import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── Free public project cost estimator ──────────────────────────────────────
// No login. A visitor describes what they want to build and gets a realistic
// milestone breakdown with cost ranges. This is a top-of-funnel SEO/lead magnet
// (the "free tool" growth lever), rate-limited by guardAi. It does NOT create a
// project or touch the instrumentation dataset; it just returns an estimate and
// nudges signup.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const { description } = await req.json().catch(() => ({}));
  const brief = String(description ?? "").trim();
  if (brief.length < 8) {
    return NextResponse.json({ error: "Describe what you want to build in a sentence." }, { status: 400 });
  }

  const prompt = `You are a senior freelance project estimator. A prospective client described something they want built. Give a realistic, honest cost and milestone estimate at mid-market freelance rates (a good independent specialist, not an agency and not the cheapest bidder).

WHAT THEY WANT:
"""
${brief.slice(0, 1500)}
"""

Rules:
- Break it into 2 to 5 concrete milestones, each independently deliverable.
- Each milestone: a short title (max 8 words), one plain sentence of what it covers, and a low and high USD cost (integers, low < high, a genuine range not a fake-precise number).
- Give an overall timeline in weeks (low and high).
- confidence: "low", "medium", or "high" based on how much the description pins down.
- assumptions: 1 to 3 short things you had to assume (these are what would move the price).
- Be honest about range. Vague briefs get wider ranges. Never lowball to look attractive.
- Write plainly. Never use the em-dash character.

Return ONLY valid JSON:
{
  "projectType": "<3-6 word label for what this is>",
  "milestones": [{"title": "...", "detail": "...", "low": <int>, "high": <int>}],
  "totalLow": <int>, "totalHigh": <int>,
  "weeksLow": <int>, "weeksHigh": <int>,
  "confidence": "low|medium|high",
  "assumptions": ["..."]
}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1100,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const p = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const milestones = (Array.isArray(p.milestones) ? p.milestones : []).slice(0, 5).map((m: Record<string, unknown>) => ({
      title: String(m.title ?? "").slice(0, 80),
      detail: String(m.detail ?? "").slice(0, 240),
      low: Math.max(0, Math.round(Number(m.low) || 0)),
      high: Math.max(0, Math.round(Number(m.high) || 0)),
    })).filter((m: { title: string }) => m.title);

    if (milestones.length === 0) {
      return NextResponse.json({ error: "Could not estimate that. Try adding a bit more detail." }, { status: 422 });
    }

    const sumLow = milestones.reduce((s: number, m: { low: number }) => s + m.low, 0);
    const sumHigh = milestones.reduce((s: number, m: { high: number }) => s + m.high, 0);

    return NextResponse.json({
      projectType: String(p.projectType ?? "Custom project").slice(0, 80),
      milestones,
      totalLow: Math.max(0, Math.round(Number(p.totalLow) || sumLow)),
      totalHigh: Math.max(0, Math.round(Number(p.totalHigh) || sumHigh)),
      weeksLow: Math.max(1, Math.round(Number(p.weeksLow) || 1)),
      weeksHigh: Math.max(1, Math.round(Number(p.weeksHigh) || 2)),
      confidence: ["low", "medium", "high"].includes(String(p.confidence)) ? String(p.confidence) : "medium",
      assumptions: (Array.isArray(p.assumptions) ? p.assumptions : []).slice(0, 3).map((a: unknown) => String(a).slice(0, 160)),
    });
  } catch {
    return NextResponse.json({ error: "The estimator is busy. Try again in a moment." }, { status: 500 });
  }
}
