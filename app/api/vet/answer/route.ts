import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { nextQuestion, gradeInterview } from "@/lib/interviewer";
import { VETTING_QUESTIONS, PASS_THRESHOLD, type TranscriptTurn } from "@/lib/vetting";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── Submit an answer; get the next question or the final verdict ────────────
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { vettingId, answer } = await req.json();
  const text = String(answer ?? "").trim();
  if (!vettingId) return NextResponse.json({ error: "vettingId is required." }, { status: 400 });
  if (text.length < 25) {
    return NextResponse.json({ error: "Give a real answer — a couple of sentences minimum. Specifics beat polish." }, { status: 400 });
  }

  const { data: vetting, error: fetchErr } = await supabase
    .from("vettings")
    .select("id, user_id, category, status, mode")
    .eq("id", vettingId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !vetting) return NextResponse.json({ error: "Interview not found." }, { status: 404 });
  if (vetting.status !== "in_progress") {
    return NextResponse.json({ error: "This interview is already finished." }, { status: 409 });
  }

  // transcript is no longer world-readable; owner reads their own via RPC.
  const { data: transcriptData } = await supabase.rpc("get_vetting_transcript", { p_id: vettingId });
  const transcript = (transcriptData ?? []) as TranscriptTurn[];
  const current = transcript[transcript.length - 1];
  if (!current || current.a !== undefined) {
    return NextResponse.json({ error: "No open question to answer." }, { status: 409 });
  }

  current.a = text.slice(0, 4000);

  // ── More questions to go ────────────────────────────────────────────────
  if (transcript.length < VETTING_QUESTIONS) {
    let q: string;
    try {
      q = await nextQuestion(vetting.category, transcript);
    } catch (err) {
      console.error("vet/answer question generation failed:", err);
      return NextResponse.json({ error: "The interviewer hiccuped — resubmit your answer." }, { status: 500 });
    }
    transcript.push({ q, askedAt: new Date().toISOString() });

    const { error: upErr } = await supabase
      .from("vettings")
      .update({ transcript })
      .eq("id", vetting.id);
    if (upErr) return NextResponse.json({ error: "Could not save your answer." }, { status: 500 });

    return NextResponse.json({
      question: q,
      index: transcript.length,
      total: VETTING_QUESTIONS,
    });
  }

  // ── Final answer → grade the whole interview ────────────────────────────
  let assessment;
  try {
    assessment = await gradeInterview(vetting.category, transcript, (vetting.mode as "text" | "video") ?? "text");
  } catch (err) {
    console.error("vet/answer grading failed:", err);
    return NextResponse.json({ error: "Grading hiccuped — resubmit your answer." }, { status: 500 });
  }

  const passed = assessment.score >= PASS_THRESHOLD;
  const { error: finErr } = await supabase
    .from("vettings")
    .update({
      transcript,
      status: passed ? "passed" : "failed",
      score: assessment.score,
      band: assessment.band,
      assessment,
      completed_at: new Date().toISOString(),
    })
    .eq("id", vetting.id);
  if (finErr) return NextResponse.json({ error: "Could not save the result." }, { status: 500 });

  return NextResponse.json({ done: true, passed, assessment });
}
