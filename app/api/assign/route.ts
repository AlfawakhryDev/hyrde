import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── AI matching ──────────────────────────────────────────────────────────────
// The core of the product: a client posts a task, and the AI assigns the best
// interview-vetted freelancer in that category — no bidding, no browsing, no
// claiming. Freelancers don't interfere; work comes to the right person.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { taskId } = await req.json();
  if (!taskId) return NextResponse.json({ error: "taskId is required." }, { status: 400 });

  const { data: task } = await supabase
    .from("tasks")
    .select("id, title, brief, category, poster_id, claimed_by_user_id")
    .eq("id", taskId)
    .single();

  if (!task) return NextResponse.json({ error: "Task not found." }, { status: 404 });
  if (task.poster_id !== user.id) {
    return NextResponse.json({ error: "Only the poster can match this task." }, { status: 403 });
  }
  if (task.claimed_by_user_id) {
    return NextResponse.json({ error: "This task is already matched." }, { status: 409 });
  }

  // Candidate pool comes from get_match_pool(): a SECURITY DEFINER RPC that
  // returns passed vettings + their assessments (verifiedSkills + grader
  // summary) ONLY to the poster of THIS unmatched task, already scoped to the
  // task's category, best-vetting-per-user, poster excluded. This keeps the
  // matcher's demonstrated-skill signal (Matching v1.5) while stopping the
  // vetting assessment/transcript from being bulk-harvestable via a raw select.
  type Candidate = {
    id: string; name: string; bio: string; headline: string; country: string;
    score: number; band: string; category: string; verifiedSkills: string[]; summary: string;
  };
  const { data: poolData, error: poolErr } = await supabase.rpc("get_match_pool", { p_task_id: task.id });
  if (poolErr) {
    return NextResponse.json({ error: "Could not build the candidate pool." }, { status: 500 });
  }
  const candidates = ((poolData ?? []) as Candidate[]).slice(0, 20);

  if (candidates.length === 0) {
    return NextResponse.json({ matched: false, reason: "no_candidates" });
  }

  // Default to the top-scoring vetted candidate; let the AI refine the pick.
  let chosen = candidates[0];
  let confidence = candidates[0].score;
  let reason = `Top-scoring vetted ${task.category ?? ""} specialist (${candidates[0].band} · ${candidates[0].score}).`.trim();

  try {
    const prompt = `You are the matching engine on Hyrde, a freelance marketplace. Pick the SINGLE best-fit freelancer for this specific task from the vetted candidates below. Every candidate already passed a graded skill interview, so they all clear the bar — your job is fit to THIS brief, not who's generically "best".

Weigh, in this order:
1. Demonstrated-skill fit — do the candidate's verifiedSkills and what their interview actually showed (their summary) match what THIS brief needs? This matters most. A candidate whose proven skills squarely fit the brief beats a higher raw score whose skills are adjacent. Judge on substance, not keyword overlap.
2. Vetting score & band — baseline competence (higher is better, but it's a tie-breaker within similar fit, not the primary axis).
3. Relevant background from their headline/bio.

Do NOT just pick the highest vettingScore. If the top-scorer's demonstrated skills don't fit the brief and a slightly-lower-scorer's do, pick the better fit and say why.

TASK
Title: ${task.title}
Category: ${task.category ?? "General"}
Brief: """${String(task.brief).slice(0, 1500)}"""

CANDIDATES (JSON)
${JSON.stringify(candidates.map(c => ({
  id: c.id,
  name: c.name,
  vettingScore: c.score,
  band: c.band,
  vettedCategory: c.category,
  verifiedSkills: c.verifiedSkills,
  interviewSummary: c.summary.slice(0, 500),
  headline: c.headline.slice(0, 120),
  bio: c.bio.slice(0, 300),
})))}

Return ONLY valid JSON:
{"chosenId": "<id of the best-fit candidate>", "confidence": <integer 0-100, your confidence THIS candidate is right for THIS brief>, "reason": "<one specific, plain sentence to the client on why this freelancer fits their brief. Reference the actual skill or experience match, not just 'top rated'. Never use the em-dash character.>"}`;

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());
    const picked = candidates.find(c => c.id === parsed.chosenId);
    if (picked) {
      chosen = picked;
      confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || picked.score));
      if (parsed.reason) reason = String(parsed.reason).slice(0, 300);
    }
  } catch (err) {
    console.error("Match AI failed, using top-scorer:", err);
  }

  // Assign atomically so two concurrent matches can't double-book.
  const { data: assigned, error: upErr } = await supabase
    .from("tasks")
    .update({
      claimed_by_user_id: chosen.id,
      claimed_at: new Date().toISOString(),
      matched_at: new Date().toISOString(),
      match_reason: reason,
      match_score: confidence,
      status: "mounted",
    })
    .eq("id", task.id)
    .is("claimed_by_user_id", null)
    .select("id");

  if (upErr || !assigned?.length) {
    return NextResponse.json({ matched: false, reason: "assign_failed" });
  }

  return NextResponse.json({
    matched: true,
    freelancer: { id: chosen.id, name: chosen.name, band: chosen.band, score: chosen.score },
    confidence,
    reason,
  });
}
