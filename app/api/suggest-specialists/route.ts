import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── Who should get on a call ─────────────────────────────────────────────────
// Ends the scoping flow: given the milestone plan, surface the vetted
// specialists actually able to do THIS work, so the client can book a call.
//
// HARD RULE: never pad. If nobody vetted is a genuine fit we return an empty
// list and say so. Showing a React developer to someone who needs an Arabic
// WordPress rebuild is worse than showing nobody — that is the exact failure a
// real client (Naila) reported, and it is why the /hire fallbacks were removed
// and why /api/assign now has a relevance floor.
const MIN_FIT = 55;

type Candidate = {
  id: string; name: string; bio: string; headline: string; country: string;
  score: number; band: string; category: string; verifiedSkills: string[]; summary: string;
};

export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const projectTitle = String(body?.projectTitle ?? "").slice(0, 200);
  const milestones = (Array.isArray(body?.milestones) ? body.milestones : [])
    .slice(0, 6)
    .map((m: Record<string, unknown>) => ({
      title: String(m?.title ?? "").slice(0, 120),
      brief: String(m?.brief ?? "").slice(0, 600),
      category: String(m?.category ?? "").slice(0, 40),
    }))
    .filter((m: { title: string }) => m.title);
  const siteSummary = String(body?.siteSummary ?? "").slice(0, 800);

  if (!milestones.length) {
    return NextResponse.json({ error: "No milestones to match against." }, { status: 400 });
  }

  // Pool: every passed vetting, read through the admin-safe view of profiles.
  // We deliberately pull across categories and let the model judge fit, rather
  // than pre-filtering on a category string the scoper may have guessed wrong.
  const { data: pool, error: poolErr } = await supabase.rpc("get_suggestion_pool");
  if (poolErr) {
    return NextResponse.json({ error: "Could not load specialists." }, { status: 500 });
  }
  const candidates = ((pool ?? []) as Candidate[]).slice(0, 40);
  if (!candidates.length) {
    return NextResponse.json({ suggestions: [], reason: "no_vetted_specialists" });
  }

  const prompt = `You are staffing a real client project on Hyrde. Below is the milestone plan and the full roster of interview-vetted specialists. Pick the ones who genuinely fit THIS project and should join a scoping call.

Judge fit on demonstrated ability: their verifiedSkills and what their interview actually showed. A specialist whose proven work matches the project's real technology, language and domain is a fit. Someone merely competent in an unrelated area is NOT a fit.

CRITICAL: it is correct and expected to return fewer people than asked, or an empty list. Never include someone just to fill slots. If nobody proven fits, return an empty array. A wrong suggestion costs the client trust; an honest empty answer does not.

PROJECT: ${projectTitle}
${siteSummary ? `\nWHAT WE READ FROM THEIR LIVE SITE:\n${siteSummary}\n` : ""}
MILESTONES:
${milestones.map((m: { title: string; brief: string; category: string }, i: number) => `${i + 1}. [${m.category}] ${m.title} — ${m.brief}`).join("\n")}

VETTED SPECIALISTS (JSON):
${JSON.stringify(candidates.map(c => ({
  id: c.id, name: c.name, vettingScore: c.score, band: c.band, vettedCategory: c.category,
  verifiedSkills: c.verifiedSkills, interviewSummary: c.summary.slice(0, 400),
  headline: c.headline.slice(0, 120),
})))}

Return ONLY valid JSON:
{"suggestions":[{"id":"<candidate id>","fit":<integer 0-100 how well their PROVEN skills fit this project>,"milestone":"<title of the milestone they'd own>","reason":"<one plain sentence naming the specific proven skill that fits. No em-dash character.>"}]}
Order by fit, best first. Only include candidates with fit >= ${MIN_FIT}.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const byId = new Map(candidates.map(c => [c.id, c]));
    const suggestions = (Array.isArray(parsed.suggestions) ? parsed.suggestions : [])
      .map((s: Record<string, unknown>) => {
        const c = byId.get(String(s.id));
        const fit = Math.max(0, Math.min(100, Math.round(Number(s.fit) || 0)));
        if (!c || fit < MIN_FIT) return null;   // the floor is enforced here, not just in the prompt
        return {
          id: c.id, name: c.name, band: c.band, score: c.score,
          headline: c.headline, country: c.country,
          verifiedSkills: c.verifiedSkills.slice(0, 4),
          fit,
          milestone: String(s.milestone ?? "").slice(0, 120),
          reason: String(s.reason ?? "").slice(0, 300),
        };
      })
      .filter(Boolean)
      // One card per person. The model legitimately nominates the same
      // specialist for several milestones (a WordPress dev fits both discovery
      // and the build); showing them twice reads like a bug to the client.
      .reduce((acc: NonNullable<ReturnType<typeof Object>>[], s: Record<string, unknown> | null) => {
        if (!s) return acc;
        const seen = acc.find((a: Record<string, unknown>) => a.id === s.id);
        if (!seen) { acc.push(s); return acc; }
        if ((s.fit as number) > (seen.fit as number)) Object.assign(seen, s);
        return acc;
      }, [])
      .slice(0, 4);

    return NextResponse.json({
      suggestions,
      reason: suggestions.length ? "ok" : "no_relevant_specialist",
    });
  } catch (err) {
    console.error("suggest-specialists failed:", err);
    // Fail honest: no suggestions rather than an arbitrary list.
    return NextResponse.json({ suggestions: [], reason: "no_relevant_specialist" });
  }
}
