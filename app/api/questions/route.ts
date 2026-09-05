import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";
import { normalizeGenerated, treeFor, EXPERTISE_KEY } from "@/lib/questiontree";
import type { SiteContext } from "@/lib/siteaudit";
import { contextToFacts } from "@/lib/siteaudit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const anthropic = new Anthropic();

// ── Qualifying questions, generated for this project ─────────────────
// The static trees asked every WordPress client the same things, so a
// bilingual investment site and a one-page brochure got identical questions
// and neither felt understood. These are written for the brief in front of us
// and for what we actually read off the client's live site.
//
// Two hard constraints, both about not wasting the client's goodwill:
//   - Ask only what changes the plan or the price. A question whose answer we
//     would not act on is a question that costs trust for nothing.
//   - Match the audience. A hands-off client is never asked about stacks or
//     integrations; those decisions get made for them and written down as
//     assumptions instead (see /api/scope-project).
//
// Falls back to the static tree on any failure: an interrogation that cannot
// start is worse than a generic one.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const outcome = String(body?.outcome ?? "").trim().slice(0, 2000);
  const archetype = String(body?.archetype ?? "other").slice(0, 60);
  const expertise = String(body?.expertise ?? "some");
  const site: SiteContext | null = body?.siteContext ?? null;
  // Arabic clients get Arabic questions, not translated chrome around English.
  const locale = String(body?.locale ?? "en");

  const fallback = () =>
    NextResponse.json({
      questions: treeFor(archetype).filter(q => q.key !== EXPERTISE_KEY),
      source: "static",
    });

  if (outcome.length < 10) return fallback();

  const audience =
    expertise === "hands_off"
      ? `This client has told us they do NOT want to deal with the technical side. Never ask about platforms, stacks, frameworks, integrations, hosting or migrations. Ask about their business, their audience, what visitors should be able to do, what already exists, who signs things off, and what "done" looks like to them. Every option must be readable by someone who has never built a website.`
      : expertise === "hands_on"
        ? `This client is technical and wants the detail. Implementation questions are welcome: platform constraints, integrations, data migration, existing code and technical debt.`
        : `This client knows the basics. Plain language, but a light technical question is acceptable where it genuinely changes the plan.`;

  const siteBlock = site
    ? `\n\nWHAT WE ALREADY READ FROM THEIR LIVE SITE (do NOT ask anything answered here):\n${contextToFacts(site).map(f => `- ${f}`).join("\n")}`
    : "";

  const prompt = `You are scoping a project on Hyrde. Write the qualifying questions to ask THIS client before we price and plan their work.

THEIR REQUEST:
"""
${outcome}
"""${siteBlock}

WHO YOU ARE ASKING:
${audience}

Rules:
- Up to 8 questions, and fewer is better. Ask 4 if 4 will do. Never pad to reach 8.
- Keep every question SHORT. One sentence, under 90 characters where you can. The help line is optional and one short sentence at most.
- Ask ONLY what would change the milestones or the price. If you would not act differently on the answer, do not ask it.
- Never ask something the site read above already tells you. Ask what it cannot: intent, ownership, constraints, appetite.
- Every question is answered by TAPPING an option, never by typing. Give 3 to 5 concrete, mutually distinct options that a real person would recognise as their situation. No "Other".
- Option labels are buttons: keep each under about 55 characters. Put nuance in the help line, not the label.
- Options must be specific to this project. "Yes / No / Maybe" is a wasted question.
- variance_weight (0.1-0.85) is how much of the cost uncertainty this resolves. Weight the one that most moves the estimate highest.
- unknown_risk describes what goes wrong if they answer "I'm not sure", with a cost multiplier band.
- Never use the em-dash character.

${locale === "ar" ? "LANGUAGE: write every question, help line and option label in Arabic, including an \"لست متأكداً\" option on every question. The client reads Arabic, so do not write English and expect it to be translated later.\n\n" : ""}Return ONLY valid JSON:
{"questions":[{"key":"short_snake_case","text":"...","help":"one short clarifying line, optional","type":"single_select|multi_select","options":[{"value":"snake_case","label":"..."}],"variance_weight":0.6,"affects_milestones":["design"],"unknown_risk":{"description":"...","cost_impact_multiplier":[1.0,1.5]}}]}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      // 1600 truncated mid-JSON for technical projects, which silently fell
      // back to the static tree. Questions are the whole feature; give them room.
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());
    const questions = normalizeGenerated(parsed.questions, locale);
    if (questions.length < 2) return fallback();
    return NextResponse.json({ questions, source: "generated" });
  } catch (err) {
    console.error("Question generation failed, using the static tree:", err);
    return fallback();
  }
}
