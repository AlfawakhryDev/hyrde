import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";
import { classifyArchetype } from "@/lib/instrumentation";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

const anthropic = new Anthropic();

// ── Call A: archetype classifier (spec 2.5) ─────────────────────────────────
// Classifies a raw outcome request into a project archetype so the right
// interrogation question tree can load. Strict JSON out, no prose. If the model
// is unsure (confidence < 0.7) it returns 1-2 disambiguation questions the UI
// shows before interrogating. Deterministic keyword classification is the
// fallback so this never blocks project creation.
const ARCHETYPES = [
  { slug: "shopify_replatform", desc: "Migrating/replatforming an existing Shopify store, or moving to Shopify from another platform" },
  { slug: "shopify_theme_custom", desc: "Custom Shopify theme build or storefront redesign on Shopify" },
  { slug: "shopify", desc: "Any other Shopify store work" },
  { slug: "web_app_mvp", desc: "Web app, SaaS, dashboard, internal tool, or MVP build" },
  { slug: "marketing_site", desc: "Marketing website, landing pages, or company site" },
  { slug: "brand_identity", desc: "Brand identity, logo, or design system work" },
  { slug: "content_production", desc: "Content, copywriting, blog, or editorial production" },
  { slug: "other", desc: "Anything that does not fit the above" },
];

export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { outcome } = await req.json().catch(() => ({}));
  const rough = String(outcome ?? "").trim();
  if (rough.length < 10) {
    return NextResponse.json({ error: "Describe the outcome first." }, { status: 400 });
  }

  const fallbackSlug = classifyArchetype(rough);

  // Demand signal: store what the client is trying to post BEFORE we run the AI,
  // so it's captured even if they see the plan and churn without completing.
  // Never block classification on this.
  try {
    await supabase.from("task_requests").insert({
      user_id: user.id,
      raw_text: rough,
      kind: "outcome",
      archetype: fallbackSlug,
    });
  } catch { /* capture is best-effort */ }

  const prompt = `You classify a client's project request into ONE archetype so the right scoping questions load. Return STRICT JSON only, no prose, no markdown fences.

ARCHETYPES:
${ARCHETYPES.map(a => `- ${a.slug}: ${a.desc}`).join("\n")}

CLIENT REQUEST:
"""
${rough.slice(0, 1500)}
"""

Rules:
- Pick the single best archetype_slug from the list above.
- confidence is your certainty from 0 to 1.
- If confidence is below 0.7, include 1 to 2 short disambiguation questions (plain text, each a single sentence) that would resolve which archetype this is. Otherwise return an empty array.
- Never use the em-dash character.

Return ONLY:
{"archetype_slug":"<slug>","confidence":<0..1>,"disambiguation_questions":["..."]}`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const parsed = JSON.parse(raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim());

    const valid = new Set(ARCHETYPES.map(a => a.slug));
    const slug = valid.has(String(parsed.archetype_slug)) ? String(parsed.archetype_slug) : fallbackSlug;
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
    const disambiguation = (Array.isArray(parsed.disambiguation_questions) ? parsed.disambiguation_questions : [])
      .slice(0, 2).map((q: unknown) => String(q).slice(0, 200)).filter(Boolean);

    return NextResponse.json({ archetype_slug: slug, confidence, disambiguation_questions: disambiguation });
  } catch {
    // Never block creation on a classifier hiccup: fall back to keyword slug.
    return NextResponse.json({ archetype_slug: fallbackSlug, confidence: 0.5, disambiguation_questions: [] });
  }
}
