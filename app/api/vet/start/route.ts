import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { nextQuestion } from "@/lib/interviewer";
import { VETTING_QUESTIONS, RETAKE_COOLDOWN_HOURS } from "@/lib/vetting";
import { CATEGORIES } from "@/lib/arena";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Start (or resume) a vetting interview ───────────────────────────────────
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in to get vetted." }, { status: 401 });

  const { category, mode } = await req.json();
  const interviewMode = mode === "video" ? "video" : "text";
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Pick a valid category." }, { status: 400 });
  }

  // Already passed this category → nothing to do.
  const { data: existing } = await supabase
    .from("vettings")
    .select("id, status, mode, transcript, created_at, completed_at")
    .eq("user_id", user.id)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.status === "passed") {
    return NextResponse.json({ error: "You're already vetted in this category." }, { status: 409 });
  }

  // Resume an in-progress interview ONLY if it's the same mode the user just
  // chose. A fresh mode choice (e.g. switching to video) always starts clean —
  // never silently resume a text interview as text, or vice versa.
  if (existing?.status === "in_progress") {
    const existingMode = (existing.mode ?? "text") as "text" | "video";
    if (existingMode === interviewMode) {
      const transcript = (existing.transcript ?? []) as { q: string; a?: string }[];
      const current = transcript[transcript.length - 1];
      if (current && current.a === undefined) {
        return NextResponse.json({
          vettingId: existing.id,
          question: current.q,
          index: transcript.length,
          total: VETTING_QUESTIONS,
          mode: existingMode,
          resumed: true,
        });
      }
    } else {
      // Different mode → abandon the old attempt so a new one can start.
      await supabase
        .from("vettings")
        .update({ status: "abandoned", completed_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
  }

  // Failed recently → cooldown so the interview can't be brute-forced.
  if (existing?.status === "failed" && existing.completed_at) {
    const hours = (Date.now() - new Date(existing.completed_at).getTime()) / 3.6e6;
    if (hours < RETAKE_COOLDOWN_HOURS) {
      return NextResponse.json(
        { error: `You can retake this interview in ${Math.ceil(RETAKE_COOLDOWN_HOURS - hours)}h. Use the feedback from last time to prepare.` },
        { status: 429 },
      );
    }
  }

  let q1: string;
  try {
    q1 = await nextQuestion(category, []);
  } catch (err) {
    console.error("vet/start question generation failed:", err);
    return NextResponse.json({ error: "The interviewer is busy — try again in a moment." }, { status: 500 });
  }

  const { data: created, error: insErr } = await supabase
    .from("vettings")
    .insert({
      user_id: user.id,
      category,
      status: "in_progress",
      mode: interviewMode,
      transcript: [{ q: q1, askedAt: new Date().toISOString() }],
    })
    .select("id")
    .single();

  if (insErr || !created) {
    console.error("vet/start insert failed:", insErr);
    return NextResponse.json({ error: "Could not start the interview." }, { status: 500 });
  }

  return NextResponse.json({
    vettingId: created.id,
    question: q1,
    index: 1,
    total: VETTING_QUESTIONS,
    mode: interviewMode,
  });
}
