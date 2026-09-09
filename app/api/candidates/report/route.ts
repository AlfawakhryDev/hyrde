import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ── The candidate report ─────────────────────────────────────────────
// The interview already writes an assessment per attempt, but it is addressed
// TO the candidate ("your SQL answer held up") and it only ever sees one
// attempt. This reads the whole person: every attempt including the failed
// ones, the CV, the profile, and what they have actually delivered.
//
// The distinction worth paying for is claimed vs verified. A CV asserts; an
// interview tests. Anything the CV claims that no interview touched is listed
// separately and never counted as evidence.
//
// Admin only, twice over: this route checks, and candidate_dossier() re-checks
// in the database. Neither is trusted alone.

const MODEL = "claude-sonnet-5";

const SYSTEM = `You write hiring reports on freelance candidates for a marketplace that stakes its reputation on every match.

You will be given a dossier: the person's profile, every vetting interview they have attempted (passed AND failed, with full transcripts and the grader's assessment), their uploaded CV if any, and their actual delivery record on the platform.

Rules that matter more than fluency:
- Distinguish VERIFIED from CLAIMED. Verified means an interview tested it and the transcript shows it. Claimed means the CV or profile asserts it and nothing tested it. Never promote a claim to verified.
- Failed attempts are evidence, not noise. Say what the failure showed.
- An empty delivery record means unproven on this platform. Say so plainly rather than implying experience.
- Quote the transcript when it supports a judgement. Specific beats general.
- If the dossier is thin, say the report is thin. Do not pad.
- No demographic inference. Judge the work, never the person's background, name, or country.

Return ONLY valid JSON, no markdown fences:
{
  "headline": "one sentence a busy operator can act on",
  "recommendation": "strong_yes" | "yes" | "borderline" | "no" | "insufficient_evidence",
  "confidence": "high" | "medium" | "low",
  "confidenceWhy": "what would raise it",
  "verifiedSkills": [{ "skill": "...", "evidence": "what in the transcript showed it" }],
  "claimedNotVerified": ["skills the CV asserts that no interview tested"],
  "deliveryRecord": "plain summary of what they have actually shipped here",
  "strengths": ["..."],
  "risks": ["concrete concerns, each tied to something in the dossier"],
  "bestFitFor": ["kinds of work to send them"],
  "notFitFor": ["kinds of work to keep them away from"],
  "suggestedRateUsd": { "low": 0, "high": 0, "basis": "why" },
  "nextStep": "the single most useful thing to do about this candidate now"
}`;

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const userId = String(body?.userId ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(userId)) {
    return NextResponse.json({ error: "A candidate id is required." }, { status: 400 });
  }

  const { data: dossier, error: dErr } = await supabase.rpc("candidate_dossier", { p_user: userId });
  if (dErr || !dossier) {
    return NextResponse.json({ error: dErr?.message ?? "No such candidate." }, { status: 404 });
  }

  const d = dossier as Record<string, unknown>;
  const vettings = Array.isArray(d.vettings) ? d.vettings : [];
  // Nothing to report on is a real answer, not an error, and it costs no tokens.
  if (!vettings.length && !d.cv) {
    return NextResponse.json({
      error: "Nothing to report on yet: no interview attempts and no CV.",
    }, { status: 422 });
  }

  let report: unknown;
  try {
    const anthropic = new Anthropic();
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{
        role: "user",
        content: `Dossier:\n${JSON.stringify(dossier, null, 1).slice(0, 120_000)}`,
      }],
    });
    const text = res.content.filter(c => c.type === "text").map(c => c.text).join("");
    // The model is told not to fence, but a stray fence must not lose the run.
    report = JSON.parse(text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim());
  } catch (err) {
    console.error("Candidate report generation failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "The report could not be generated." },
      { status: 502 },
    );
  }

  const sources = {
    vettingAttempts: vettings.length,
    hasCv: !!d.cv,
    delivery: d.delivery ?? null,
  };

  const { error: wErr } = await supabase.from("candidate_reports").upsert({
    user_id: userId,
    report,
    model: MODEL,
    sources,
    generated_at: new Date().toISOString(),
    generated_by: user.id,
  });
  if (wErr) console.error("Could not store candidate report:", wErr.message);

  return NextResponse.json({ report, sources, model: MODEL, stored: !wErr });
}
