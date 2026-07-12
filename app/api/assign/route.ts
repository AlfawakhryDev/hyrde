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
  // "Other"/uncategorized tasks accept any passed vetting.
  const base = supabase.from("vettings").select("user_id, category, score, band").eq("status", "passed");
  const { data: passes } = task.category && task.category !== "Other"
    ? await base.eq("category", task.category)
    : await base;

  const byUser = new Map<string, { score: number; band: string; category: string }>();
  for (const v of passes ?? []) {
    const prev = byUser.get(v.user_id);
    if (!prev || v.score > prev.score) byUser.set(v.user_id, { score: v.score, band: v.band, category: v.category });
  }
  byUser.delete(user.id); // can't match a client to their own task

  if (byUser.size === 0) {
    return NextResponse.json({ matched: false, reason: "no_candidates" });
  }

  const { data: profs } = await supabase
    .from("profiles")
    .select("id, display_name, bio")
    .in("id", [...byUser.keys()]);

  const candidates = (profs ?? [])
    .map(p => ({ id: p.id, name: p.display_name || "Freelancer", bio: p.bio || "", ...byUser.get(p.id)! }))
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
    const prompt = `You are the matching engine on Hyrde, a freelance marketplace. Assign this task to the single best-fit freelancer from the vetted candidates below. Every candidate already passed a graded skill interview in the right category, so weigh their vetting score, band, and how their background fits this specific brief.

TASK
Title: ${task.title}
Category: ${task.category ?? "General"}
Brief: """${String(task.brief).slice(0, 1500)}"""

CANDIDATES (JSON)
${JSON.stringify(candidates.map(c => ({ id: c.id, name: c.name, vettingScore: c.score, band: c.band, bio: c.bio.slice(0, 300) })))}

Return ONLY valid JSON:
{"chosenId": "<id of the best candidate>", "confidence": <integer 0-100>, "reason": "<one sentence to the client on why this freelancer is the right match>"}`;

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
