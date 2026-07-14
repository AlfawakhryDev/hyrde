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

  // Candidate pool: freelancers who passed vetting in this exact category.
  // "Other"/uncategorized tasks accept any passed vetting. We now also pull the
  // full `assessment` (verifiedSkills + written summary the grader produced) —
  // this is the signal that lets the matcher weigh demonstrated-skill fit to the
  // specific brief, not just a raw score. (Matching v1.5 — see the Matching &
  // Vetting v2 Linear project; the weighted/embeddings engine is HYR-24.)
  type Assessment = { verifiedSkills?: string[]; summary?: string };
  const base = supabase.from("vettings").select("user_id, category, score, band, assessment").eq("status", "passed");
  const { data: passes } = task.category && task.category !== "Other"
    ? await base.eq("category", task.category)
    : await base;

  const byUser = new Map<string, { score: number; band: string; category: string; assessment: Assessment | null }>();
  for (const v of passes ?? []) {
    const prev = byUser.get(v.user_id);
    // Keep the best-scoring vetting per user, and carry its assessment with it.
    if (!prev || v.score > prev.score) {
      byUser.set(v.user_id, { score: v.score, band: v.band, category: v.category, assessment: (v.assessment as Assessment | null) ?? null });
    }
  }
  byUser.delete(user.id); // can't match a client to their own task

  if (byUser.size === 0) {
    return NextResponse.json({ matched: false, reason: "no_candidates" });
  }

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, display_name, bio, headline, country")
    .in("id", [...byUser.keys()]);

  const candidates = (profs ?? [])
    .map(p => {
      const v = byUser.get(p.id)!;
      return {
        id: p.id,
        name: p.display_name || "Freelancer",
        bio: p.bio || "",
        headline: p.headline || "",
        country: p.country || "",
        score: v.score,
        band: v.band,
        category: v.category,
        verifiedSkills: v.assessment?.verifiedSkills ?? [],
        summary: v.assessment?.summary ?? "",
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

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
{"chosenId": "<id of the best-fit candidate>", "confidence": <integer 0-100, your confidence THIS candidate is right for THIS brief>, "reason": "<one specific sentence to the client: why this freelancer fits their brief — reference the actual skill/experience match, not just 'top rated'>"}`;

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
