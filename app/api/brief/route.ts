import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── AI brief improver ────────────────────────────────────────────────────────
// Clients write vague briefs; vague briefs get vague work. Turn a rough
// description into a structured, agent-ready brief before posting.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to use the brief assistant." }, { status: 401 });
  }

  const { rough } = await req.json();
  if (!rough || String(rough).trim().length < 10) {
    return NextResponse.json({ error: "Write a sentence or two first — then I can shape it." }, { status: 400 });
  }

  const prompt = `You are the intake assistant on Hyrde, an AI-native freelance marketplace. A client typed a rough description of work they need. Rewrite it into a crisp, structured brief that (a) an AI agent can attempt immediately and (b) a human freelancer can scope without a single follow-up question.

CLIENT'S ROUGH DESCRIPTION:
"""
${String(rough).trim().slice(0, 2000)}
"""

Rules:
- Keep the client's intent and any constraints they mentioned. Do not invent hard requirements they didn't imply.
- The brief should state: goal, deliverable(s), audience/context, and any constraints. 3-6 sentences, plain language, no headings.
- Title: max 9 words, specific, no clickbait.
- category: exactly one of Development, Design, Copywriting, Marketing, Data, Technical writing, Other.
- budgetUsd: a fair mid-market one-off price for this scope (integer USD). If scope is genuinely unknowable, estimate the smallest sensible version.

Return ONLY valid JSON:
{"title": "...", "brief": "...", "category": "...", "budgetUsd": <integer>, "note": "<one short sentence to the client about what you clarified or assumed>"}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const CATS = ["Development", "Design", "Copywriting", "Marketing", "Data", "Technical writing", "Other"];
    return NextResponse.json({
      title: String(parsed.title ?? "").slice(0, 90),
      brief: String(parsed.brief ?? "").slice(0, 2000),
      category: CATS.includes(parsed.category) ? parsed.category : "Other",
      budgetUsd: Math.max(0, Math.min(50000, Math.round(Number(parsed.budgetUsd) || 0))),
      note: String(parsed.note ?? "").slice(0, 200),
    });
  } catch (err) {
    console.error("Brief assistant error:", err);
    return NextResponse.json({ error: "The assistant hiccuped — try again." }, { status: 500 });
  }
}
