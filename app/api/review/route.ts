import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── AI deliverable review ────────────────────────────────────────────────────
// The judgment call clients dread: "is this actually done, and done well?"
// An impartial AI pass compares the deliverable against the brief before the
// client approves — the marketplace-dispute problem, solved before it starts.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to request a review." }, { status: 401 });
  }

  const { taskId } = await req.json();
  if (!taskId) return NextResponse.json({ error: "taskId is required." }, { status: 400 });

  const { data: task, error: fetchErr } = await supabase
    .from("tasks")
    .select("id, title, brief, poster_id, deliverable_text, ai_review, status")
    .eq("id", taskId)
    .single();

  if (fetchErr || !task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  if (task.poster_id !== user.id) {
    return NextResponse.json({ error: "Only the poster can request a review." }, { status: 403 });
  }
  if (!task.deliverable_text) {
    return NextResponse.json({ error: "Nothing delivered yet." }, { status: 409 });
  }
  if (task.ai_review) {
    return NextResponse.json({ ok: true, review: JSON.parse(task.ai_review) });
  }

  const prompt = `You are the impartial quality reviewer on Hyrde, a freelance marketplace. A client posted a task, a freelancer delivered work, and the client is deciding whether to approve. Give a fair, specific assessment. You are not on either side.

ORIGINAL TASK:
Title: ${task.title}
Brief: """${String(task.brief).slice(0, 2000)}"""

FREELANCER'S DELIVERABLE:
"""${String(task.deliverable_text).slice(0, 5000)}"""


Assess honestly:
- Does the deliverable address what the brief asked for?
- Is it complete, or are pieces missing/hand-waved?
- Quality signals: specificity, usability as-is, evidence of real work vs filler.

Return ONLY valid JSON:
{
  "verdict": "approve" | "approve_with_notes" | "request_changes",
  "score": <integer 0-100, how well the deliverable fulfils the brief>,
  "summary": "<2-3 sentence plain-language assessment for the client>",
  "strengths": ["<1-3 short bullets>"],
  "gaps": ["<0-3 short bullets — missing or weak pieces. Empty array if none.>"]
}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const review = {
      verdict: ["approve", "approve_with_notes", "request_changes"].includes(parsed.verdict)
        ? parsed.verdict
        : "approve_with_notes",
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      summary: String(parsed.summary ?? "").slice(0, 600),
      strengths: (parsed.strengths ?? []).slice(0, 3).map(String),
      gaps: (parsed.gaps ?? []).slice(0, 3).map(String),
      reviewedAt: new Date().toISOString(),
    };

    const { error: upErr } = await supabase
      .from("tasks")
      .update({ ai_review: JSON.stringify(review) })
      .eq("id", task.id);
    if (upErr) console.error("ai_review persist failed:", upErr);

    return NextResponse.json({ ok: true, review });
  } catch (err) {
    console.error("Review error:", err);
    return NextResponse.json({ error: "Review failed — try again." }, { status: 500 });
  }
}
