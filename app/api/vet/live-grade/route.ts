import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { gradeDialogue } from "@/lib/interviewer";
import { PASS_THRESHOLD } from "@/lib/vetting";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Grade a completed live voice interview ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { vettingId, turns } = await req.json();
  if (!vettingId || !Array.isArray(turns)) {
    return NextResponse.json({ error: "vettingId and turns are required." }, { status: 400 });
  }

  const { data: vetting } = await supabase
    .from("vettings")
    .select("id, user_id, category, status")
    .eq("id", vettingId)
    .eq("user_id", user.id)
    .single();
  if (!vetting) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  if (vetting.status !== "in_progress") {
    return NextResponse.json({ error: "This interview is already graded." }, { status: 409 });
  }

  // Sanitize + require a real conversation before grading.
  const clean = (turns as { role: string; text: string }[])
    .filter(t => (t?.role === "agent" || t?.role === "candidate") && typeof t?.text === "string")
    .map(t => ({ role: t.role as "agent" | "candidate", text: t.text.slice(0, 4000) }))
    .slice(0, 200);
  const candidateWords = clean.filter(t => t.role === "candidate").join(" ").length;
  if (candidateWords < 80) {
    // Too little was said to grade fairly — abandon, no cooldown penalty.
    await supabase.from("vettings")
      .update({ status: "abandoned", completed_at: new Date().toISOString(), transcript: clean })
      .eq("id", vettingId);
    return NextResponse.json({ error: "The interview ended too early to grade. You can start again." }, { status: 422 });
  }

  let assessment;
  try {
    assessment = await gradeDialogue(vetting.category, clean);
  } catch (err) {
    console.error("live grade failed:", err);
    return NextResponse.json({ error: "Grading hiccup — your interview was saved; try grading again." }, { status: 500 });
  }

  const passed = assessment.score >= PASS_THRESHOLD;
  await supabase.from("vettings").update({
    status: passed ? "passed" : "failed",
    score: assessment.score,
    band: assessment.band,
    assessment,
    transcript: clean,
    completed_at: new Date().toISOString(),
  }).eq("id", vettingId);

  return NextResponse.json({ done: true, passed, assessment });
}
