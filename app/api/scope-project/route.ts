import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";
import { CATEGORIES } from "@/lib/arena";
import { MILESTONE_TYPES } from "@/lib/instrumentation";
import { priceMilestone, CATEGORY_RATE_USD } from "@/lib/pricing";
import type { SiteContext } from "@/lib/siteaudit";
import { contextToFacts } from "@/lib/siteaudit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── Outcome-style intake ──────────────────────────────────────────────────────
// A client describes an outcome ("I need an MVP") rather than a single task.
// This decomposes it into an ordered milestone plan — each milestone still
// runs through the normal single-freelancer AI-match engine (/api/assign),
// matched sequentially as prior milestones are approved. This does NOT
// assemble multi-person teams or manage execution; it structures a bigger
// ask into a sequence of ordinary, individually-matched tasks.
//
// Distinct from the legacy /api/scope (used by the /agent marketing demo,
// different response shape) — do not merge the two.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to scope a project." }, { status: 401 });
  }

  const body = await req.json();
  const rough = String(body?.outcome ?? "").trim();
  if (rough.length < 10) {
    return NextResponse.json({ error: "Describe the outcome in a sentence or two first." }, { status: 400 });
  }
  // Optional interrogation context: facts we resolved and unknowns we flagged.
  // When present, the decomposition is calibrated by real answers instead of
  // guessed from the outcome sentence alone.
  const facts: string[] = (Array.isArray(body?.facts) ? body.facts : []).slice(0, 20).map((f: unknown) => String(f).slice(0, 300));
  const risks: string[] = (Array.isArray(body?.risks) ? body.risks : []).slice(0, 12).map((r: unknown) => String(r).slice(0, 300));

  // When the brief contained a URL, /api/site-audit already read the live site.
  // Those observations are evidence, not guesses, so they carry more weight
  // than anything inferred from the sentence — the plan must fit THIS site.
  const site: SiteContext | null = body?.siteContext ?? null;
  const siteBlock = site
    ? `\n\nWHAT WE READ FROM THE CLIENT'S ACTUAL SITE (fetched live just now, treat as ground truth):\n${contextToFacts(site).map(f => `- ${f}`).join("\n")}\n\nGround every milestone in these observations. Name the real platform, language and constraints in the briefs. Do not propose work that contradicts them, and do not invent pages or features you did not see.`
    : "";

  const contextBlock = facts.length
    ? `\n\nWHAT WE LEARNED IN SCOPING (use these as hard constraints, they are confirmed by the client):\n${facts.map(f => `- ${f}`).join("\n")}${risks.length ? `\n\nOPEN UNKNOWNS (the client did not know; account for them with a milestone or a wider brief where relevant, do not ignore them):\n${risks.map(r => `- ${r}`).join("\n")}` : ""}`
    : "";

  const prompt = `You are the project-scoping assistant on Hyrde, an AI-matched freelance marketplace. A client described an OUTCOME they want (not a single task). Break it into an ordered sequence of milestones. Each milestone is matched to ONE vetted freelancer at a time — later milestones are matched only once earlier ones are approved, so order them so each milestone can start once the prior one's deliverable exists.

CLIENT'S OUTCOME:
"""
${rough.slice(0, 2000)}
"""${siteBlock}${contextBlock}

How this client works (assume it unless the brief says otherwise):
- They are hands-off. They post the outcome, approve deliverables, and get updates. They do NOT want to manage a freelancer, sit in working sessions, or answer a stream of questions. Hyrde runs the freelancer; the client only makes decisions.
- So every milestone must end in ONE thing the client can look at and approve or reject in a couple of minutes. If approving a milestone would require a meeting, the milestone is wrong: split it or move the ambiguity into milestone 1.
- Milestone 1 is the smallest piece of real work that puts something in front of the client fast, ideally within a week. It exists so they see progress and can course-correct early, not as a test or a trial. Size the later milestones normally.
- Anything you would normally solve with "we'll ask the client" must instead become an explicit assumption written into the brief, so work never blocks on a reply.

Rules:
- 2 to 5 milestones. If this is really a single piece of work, return exactly 1 milestone (the client will be told to use the regular single-task flow instead).
- Each milestone must be independently completable by one freelancer and produce a concrete deliverable.
- Each milestone: a short title (max 9 words), a 2-4 sentence brief written as if to the freelancer who'll do it (include what the prior milestone handed off, and any assumption we are making on the client's behalf), a category, and suggested days-from-project-start it should be due by (integer, increasing).
- Do NOT price anything. Estimate EFFORT instead and we compute the fee: "effortHours" is how many focused hours one competent specialist needs for this milestone (integer), and "seniority" is the level the work genuinely calls for, exactly one of junior, mid, senior. Reserve senior for work where a mistake is expensive or the judgment is the deliverable; routine production work is mid; mechanical work is junior.
- Be honest about hours. A one-page audit is not 40 hours. A full multi-page site build is not 15. Think about what a competent freelancer would actually bill.
- Each milestone also needs "approval": one plain sentence naming the single artifact the client reviews to approve it, written to the client. For example "You get a one page audit and pick re-theme or rebuild." Keep it concrete and reviewable without a meeting.
- category must be exactly one of: ${CATEGORIES.join(", ")}.
- milestoneType classifies the KIND of work for cost tracking. It must be exactly one of: ${MILESTONE_TYPES.join(", ")}. Pick the single closest one to each milestone's actual work.
- projectTitle: max 8 words, describes the whole outcome. Write it entirely in ONE script: if the client's site or brand name is in Arabic, either transliterate it to Latin letters or write the whole title in Arabic. Never mix Arabic and Latin characters inside a single word.

Write all titles and descriptions in plain language. Never use the em-dash character (—).

Return ONLY valid JSON:
{"projectTitle": "...", "milestones": [{"title": "...", "brief": "...", "approval": "...", "category": "...", "milestoneType": "...", "effortHours": <integer>, "seniority": "junior|mid|senior", "dueInDays": <integer>}], "note": "<one short sentence to the client about how you split this>"}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1400,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const cats = new Set<string>(CATEGORIES);
    const types = new Set<string>(MILESTONE_TYPES);
    const milestones = (Array.isArray(parsed.milestones) ? parsed.milestones : [])
      .slice(0, 5)
      .map((m: Record<string, unknown>) => ({
        title: String(m.title ?? "").slice(0, 90),
        brief: String(m.brief ?? "").slice(0, 2000),
        // What the client looks at to approve. Surfaced in the composer and
        // folded into the freelancer's brief as the acceptance criterion.
        approval: String(m.approval ?? "").slice(0, 300),
        category: cats.has(String(m.category)) ? String(m.category) : "Other",
        // LLM-classified controlled milestone type (Call C). Empty when the model
        // returns an off-vocabulary value; create-project keyword-maps the fallback.
        milestoneType: types.has(String(m.milestoneType)) ? String(m.milestoneType) : "",
        dueInDays: Math.max(1, Math.min(365, Math.round(Number(m.dueInDays) || 7))),
        // Money is computed, never taken from the model. See lib/pricing.ts.
        ...(() => {
          const category = cats.has(String(m.category)) ? String(m.category) : "Other";
          const p = priceMilestone(category, Number(m.effortHours) || 0, String(m.seniority ?? "mid"));
          return {
            budgetUsd: p.midUsd,
            budgetLowUsd: p.lowUsd,
            budgetHighUsd: p.highUsd,
            effortHours: p.hours,
            seniority: p.seniority,
            rateUsd: p.rateUsd,
            priceBasis: p.basis,
          };
        })(),
      }))
      .filter((m: { title: string; brief: string }) => m.title && m.brief);

    if (milestones.length === 0) {
      return NextResponse.json({ error: "Couldn't scope that — try describing the outcome with a bit more detail." }, { status: 422 });
    }

    return NextResponse.json({
      projectTitle: String(parsed.projectTitle ?? "").slice(0, 90) || milestones[0].title,
      milestones,
      note: String(parsed.note ?? "").slice(0, 300),
    });
  } catch (err) {
    console.error("Scope-project assistant error:", err);
    return NextResponse.json({ error: "The assistant hiccuped — try again." }, { status: 500 });
  }
}
