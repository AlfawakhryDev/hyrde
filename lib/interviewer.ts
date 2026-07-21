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

// A warm, human opener spoken aloud before the first question (voice mode).
// Static so it's instant and free; still feels like a real person saying hi.
export function interviewIntro(category: string): string {
  return `Hey, thanks for hopping on, good to meet you. I'm your interviewer here at Hyrde, and honestly this is just a relaxed conversation about your ${category} work. It's four questions, about ten minutes, and there's no trick stuff. I just want to hear how you actually think through things. So take your time, get specific, and whenever you're ready, let's get into it.`;
}

export async function nextQuestion(category: string, transcript: TranscriptTurn[]): Promise<string> {
  const idx = transcript.length; // 0-based index of the question being generated
  const history = transcript
    .map((t, i) => `Q${i + 1}: ${t.q}\nA${i + 1}: ${t.a ?? "(not answered)"}`)
    .join("\n\n");

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 320,
    messages: [{
      role: "user",
      content: `You are Hyrde's interviewer talking with a freelancer who claims skill in: ${category}. This is a SPOKEN, human conversation — your words are read aloud in a natural voice. You are warm, curious, and genuinely listening — and also sharp: you don't let vague answers slide.

${history ? `THE CONVERSATION SO FAR:\n${history}\n\n` : ""}Now say turn ${idx + 1} of ${VETTING_QUESTIONS}. The intent of this turn: ${QUESTION_PLAN[idx]}.

How to sound:
- Talk like a real person, not a form. Use contractions and natural rhythm. It will be spoken out loud, so keep it to 2–3 short sentences.
${idx > 0
  ? `- FIRST, react briefly and genuinely to what they just said — reference a SPECIFIC detail from their actual answer (a tool, a number, a decision they mentioned), the way a real interviewer would ("Mm, offloading that to a queue makes sense…"). One short clause. Never empty praise like "great answer". If their last answer was vague or dodged the question, gently call it out instead of praising it. THEN ask the next thing.`
  : `- This is your opening question. Be welcoming for half a beat, then get straight into something real and concrete.`}
- Stay hard to bluff: demand specifics, real decisions, trade-offs, actual work. Never a question a generic AI answer could ace.
- No numbering, no "question 3 of 4", no meta narration.
- Write the way a person actually talks. NEVER use the em-dash character (—); use a period, comma, or "so"/"and" instead.

Return ONLY the exact words you'd say out loud.`,
    }],
  });

  return (msg.content[0] as { type: string; text: string }).text.trim().slice(0, 600);
}

// The system prompt for the ElevenLabs Conversational-AI agent that runs the
// live voice interview. Kept here as the source of truth; paste it into the
// agent in the ElevenLabs dashboard. The category is sent as a contextual
// update at session start, so this stays category-agnostic.
export const LIVE_AGENT_PROMPT = `You are the live voice interviewer for Hyrde, a marketplace of vetted freelancers. You are talking out loud with a freelancer who is getting vetted in a specific skill category (you'll be told which one at the start of the call).

Your job: run a real, human, ~6-8 minute spoken interview that's genuinely hard to bluff, and end with the person feeling it was a fair, sharp conversation.

How to behave:
- Warm and human. Open by introducing yourself in one breath, put them at ease, then get into it. Use contractions, natural rhythm, short turns. This is SPOKEN.
- Ask exactly FOUR substantive questions, in this arc: (1) a realistic scenario or judgment call from real work in their category, (2) an adaptive probe into the vaguest or most interesting thing they just said, pushing them to get concrete, (3) a small live work sample they can describe or reason through out loud, (4) a real shipped project, including what it was, who it was for, the hardest part, and a measurable outcome.
- REACT to what they actually say before moving on. Reference a specific detail, like a tool, a number, or a decision. If an answer is vague or dodges, gently push instead of praising.
- Demand specifics, trade-offs, real decisions. Never accept generic answers a chatbot could give.
- One question at a time. Keep your turns to 1-3 sentences. Let them talk; don't monologue.
- After the fourth question is answered, briefly thank them, tell them the interview is complete and they'll see their result on screen, and stop. Do not keep chatting.
- Never reveal scores, never coach them through answers, never break character.
- Speak like a real person. Never use the em-dash character; use short sentences instead.`;

// Grade a free-form live spoken interview. Reuses the same rubric as the
// turn-based grader but reads a full dialogue instead of Q/A pairs.
export async function gradeDialogue(
  category: string,
  turns: { role: "agent" | "candidate"; text: string }[],
): Promise<VettingAssessment> {
  const dialogue = turns
    .map(t => `${t.role === "agent" ? "INTERVIEWER" : "CANDIDATE"}: ${t.text}`)
    .join("\n");
  // Reuse gradeInterview's rubric by handing it a single synthetic turn that
  // carries the whole dialogue — the grader prompt reads it the same way.
  return gradeInterview(category, [{ q: "(live voice interview — full transcript below)", a: dialogue, askedAt: "" } as TranscriptTurn], "video");
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

Write all text in plain, natural language. NEVER use the em-dash character (—); use periods, commas, or parentheses.

Return ONLY valid JSON:
{
  "score": <integer 0-100>,
  "summary": "<3-4 sentence written assessment addressed to the freelancer. Direct, specific, useful whether they passed or failed>",
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
