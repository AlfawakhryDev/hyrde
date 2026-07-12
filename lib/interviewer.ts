import Anthropic from "@anthropic-ai/sdk";
import { VETTING_QUESTIONS, PASS_THRESHOLD, bandFor, type TranscriptTurn, type VettingAssessment } from "@/lib/vetting";

const anthropic = new Anthropic();

// Question arc: scenario judgment → adaptive probe → live work sample → war story.
const QUESTION_PLAN = [
  "a realistic scenario/judgment question specific to the category — a situation with a trade-off where the answer reveals whether they've actually done this work",
  "an adaptive follow-up that digs into their previous answer — probe the weakest or vaguest part of what they said; make them get concrete",
  "a micro work-sample: ask them to produce a small piece of REAL work right here in the chat (e.g. actual copy, actual code sketch, an actual layout/approach spec). Small enough for 5 minutes, real enough that quality is visible",
  "a specifics-demanding experience question: a real project they shipped in this category — what, for whom, hardest part, measurable outcome. Signal: verifiable specifics",
];

export async function nextQuestion(category: string, transcript: TranscriptTurn[]): Promise<string> {
  const idx = transcript.length; // 0-based index of the question being generated
  const history = transcript
    .map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a ?? "(not answered)"}`)
    .join("\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `You are the vetting interviewer on Hyrde, a freelance marketplace. You interview freelancers claiming skill in: ${category}. Your questions must be answerable in text in 2–8 sentences, but hard to bluff. Never ask questions a generic LLM answer could ace — demand specifics, decisions, trade-offs, and real work.

${history ? `INTERVIEW SO FAR:\n${history}\n\n` : ""}Generate question ${idx + 1} of ${VETTING_QUESTIONS}: ${QUESTION_PLAN[idx]}.

Rules:
- One question only. No preamble, no "great answer!", no numbering.
- Plain, direct, professional. Max 3 sentences.
- Category-specific — never generic "tell me about yourself".

Return ONLY the question text.`,
    }],
  });

  return (msg.content[0] as { type: string; text: string }).text.trim().slice(0, 600);
}

export async function gradeInterview(category: string, transcript: TranscriptTurn[], mode: "text" | "video" = "text"): Promise<VettingAssessment> {
  const history = transcript
    .map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a ?? "(no answer)"}`)
    .join("\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are the vetting grader on Hyrde, a freelance marketplace. Grade this ${category} skill interview strictly but fairly. Clients rely on this to trust the "pre-vetted" label, so a pass must MEAN something.

${mode === "video" ? "This was a VIDEO interview — answers below are live speech-to-text transcripts of spoken responses. Expect disfluencies, filler words, and transcription artifacts; grade the substance of what was said, never the polish of the text. Spoken answers with real specifics should score as well as written ones." : ""}
TRANSCRIPT:
${history}

Scoring rubric (0–100):
- Specificity & evidence (0–30): real names, numbers, tools, decisions. Vague = low.
- Correctness & judgment (0–30): would an experienced ${category} practitioner nod along?
- Work sample quality (0–25): grade the actual work they produced in the interview.
- Depth under probing (0–15): did the follow-up reveal substance or hand-waving?

Hard rules:
- Answers that read like generic AI/template text (confident, polished, zero lived detail) cap the total at 45. Look for: no concrete nouns, no trade-offs, suspiciously even tone across all answers.
- Skipped or one-line answers to the work sample cap the total at 50.
- ${PASS_THRESHOLD}+ passes. 75+ is Strong. 88+ is Exceptional — reserve it for answers that would impress a senior practitioner.

Return ONLY valid JSON:
{
  "score": <integer 0-100>,
  "summary": "<3-4 sentence written assessment addressed to the freelancer — direct, specific, useful whether they passed or failed>",
  "verifiedSkills": ["<2-4 concrete skills the answers actually demonstrated>"],
  "strengths": ["<1-3 short bullets>"],
  "growthAreas": ["<1-3 short bullets>"]
}`,
    }],
  });

  const raw = (msg.content[0] as { type: string; text: string }).text.trim();
  const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());
  const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));

  return {
    score,
    band: bandFor(score),
    summary: String(parsed.summary ?? "").slice(0, 800),
    verifiedSkills: (parsed.verifiedSkills ?? []).slice(0, 4).map(String),
    strengths: (parsed.strengths ?? []).slice(0, 3).map(String),
    growthAreas: (parsed.growthAreas ?? []).slice(0, 3).map(String),
  };
}
