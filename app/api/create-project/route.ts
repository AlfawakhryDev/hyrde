import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/arena";
import { classifyArchetype, mapMilestoneType, estimateBand } from "@/lib/instrumentation";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Commit an outcome project + freeze its instrumentation ──────────────────
// Replaces the browser-side project/task inserts that ProjectComposer used to
// do. Running this server-side is what makes the estimate an immutable author-
// of-record artifact rather than something the client typed: for every project
// it writes, in one shot, a frozen scope_document + per-milestone immutable
// milestone_estimates alongside the executable `tasks`, plus an events trail.
//
// Estimates here are cold-start heuristic bands (basis='heuristic', n=0). They
// are honestly labelled and replaced from the data side later, never edited.
// Matching stays where it was: this returns firstTaskId and the client calls
// /api/assign, preserving the existing UX.
type MilestoneInput = {
  title: string;
  brief: string;
  category: string;
  budgetUsd: number;
  dueInDays: number;
};

export async function POST(req: NextRequest) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Log in to create a project." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const projectTitle = String(body?.projectTitle ?? "").slice(0, 90).trim();
  const outcome = String(body?.outcome ?? "").trim();
  const cats = new Set<string>(CATEGORIES);
  const milestones: MilestoneInput[] = (Array.isArray(body?.milestones) ? body.milestones : [])
    .slice(0, 5)
    .map((m: Record<string, unknown>): MilestoneInput => ({
      title: String(m.title ?? "").slice(0, 90),
      brief: String(m.brief ?? "").slice(0, 2000),
      category: cats.has(String(m.category)) ? String(m.category) : "Other",
      budgetUsd: Math.max(0, Math.min(50000, Math.round(Number(m.budgetUsd) || 0))),
      dueInDays: Math.max(1, Math.min(365, Math.round(Number(m.dueInDays) || 7))),
    }))
    .filter((m: MilestoneInput) => m.title && m.brief);

  if (outcome.length < 10) {
    return NextResponse.json({ error: "Describe the outcome first." }, { status: 400 });
  }
  if (milestones.length === 0) {
    return NextResponse.json({ error: "Add at least one milestone." }, { status: 400 });
  }

  // Resolve archetype (cheap keyword classification; LLM classifier lands later).
  const archetypeSlug = classifyArchetype(outcome);
  const { data: arch } = await supabase
    .from("project_archetypes").select("id").eq("slug", archetypeSlug).maybeSingle();

  // 1. Project (raw_request is the verbatim, immutable original ask).
  const { data: project, error: projErr } = await supabase
    .from("projects")
    .insert({
      poster_id: user.id,
      title: projectTitle || milestones[0].title,
      outcome_brief: outcome,
      raw_request: outcome,
      archetype_id: arch?.id ?? null,
      status: "scoped",
      milestone_total: milestones.length,
    })
    .select("id")
    .single();
  if (projErr || !project) {
    return NextResponse.json({ error: projErr?.message ?? "Could not create the project." }, { status: 500 });
  }
  const projectId: string = project.id;

  // From here, any failure rolls back by deleting the project (cascades to every
  // child table, so no orphaned scope survives a partial create).
  const rollback = async (): Promise<void> => { await supabase.from("projects").delete().eq("id", projectId); };

  // 2. Frozen scope document v1 with summed cold-start bands.
  const bands = milestones.map(m => estimateBand(m.budgetUsd, m.dueInDays));
  const totalLow = bands.reduce((s, b) => s + b.cost_low, 0);
  const totalHigh = bands.reduce((s, b) => s + b.cost_high, 0);
  const { data: scope, error: scopeErr } = await supabase
    .from("scope_documents")
    .insert({
      project_id: projectId,
      version: 1,
      confidence: 0.25,
      total_estimate_low: totalLow,
      total_estimate_high: totalHigh,
      currency: "USD",
      frozen: true,
    })
    .select("id")
    .single();
  if (scopeErr || !scope) {
    await rollback();
    return NextResponse.json({ error: scopeErr?.message ?? "Could not freeze the scope." }, { status: 500 });
  }
  const scopeId: string = scope.id;

  const events: { project_id: string; event_type: string; payload: Record<string, unknown>; actor: string }[] = [
    { project_id: projectId, event_type: "project_created", payload: { archetype: archetypeSlug, milestone_count: milestones.length }, actor: "client" },
    { project_id: projectId, event_type: "scope_frozen", payload: { scope_document_id: scopeId, version: 1, total_low: totalLow, total_high: totalHigh, confidence: 0.25 }, actor: "system" },
  ];

  // 3. Per milestone: structural row -> immutable estimate -> executable task.
  const start = Date.now();
  let firstTaskId: string | null = null;
  let created = 0;

  for (let i = 0; i < milestones.length; i++) {
    const m = milestones[i];
    const band = bands[i];
    const mapped = mapMilestoneType(m.title, m.brief, m.category);

    const { data: milestone, error: mErr } = await supabase
      .from("milestones")
      .insert({ scope_document_id: scopeId, sequence: i, milestone_type: mapped.type, title: m.title, description: m.brief })
      .select("id")
      .single();
    if (mErr || !milestone) {
      await rollback();
      return NextResponse.json({ error: mErr?.message ?? "Could not write milestone." }, { status: 500 });
    }

    const { error: estErr } = await supabase.from("milestone_estimates").insert({
      milestone_id: milestone.id,
      cost_low: band.cost_low, cost_high: band.cost_high,
      duration_days_low: band.duration_days_low, duration_days_high: band.duration_days_high,
      confidence: band.confidence, basis: band.basis, prior_sample_size: band.prior_sample_size,
    });
    if (estErr) {
      await rollback();
      return NextResponse.json({ error: estErr.message }, { status: 500 });
    }

    const { data: task, error: taskErr } = await supabase
      .from("tasks")
      .insert({
        title: m.title,
        brief: m.brief,
        category: m.category,
        origin: "human",
        status: "open",
        poster_id: user.id,
        amount_cents: Math.round(m.budgetUsd * 100),
        deadline: new Date(start + m.dueInDays * 864e5).toISOString(),
        project_id: projectId,
        milestone_index: i,
        milestone_total: milestones.length,
        milestone_id: milestone.id,
      })
      .select("id")
      .single();
    if (taskErr || !task) {
      // Monthly task-limit trigger raises "TASK_LIMIT|tier|limit". Surface it as
      // a quota error and roll the whole project back so nothing partial persists.
      await rollback();
      const msg = taskErr?.message ?? "";
      if (msg.startsWith("TASK_LIMIT")) {
        const [, tier, limit] = msg.split("|");
        return NextResponse.json(
          { error: `Your ${tier ?? "current"} plan allows ${limit ?? "a limited number of"} posts this month. Upgrade to create this project.`, code: "TASK_LIMIT" },
          { status: 402 },
        );
      }
      return NextResponse.json({ error: msg || "Could not create milestone task." }, { status: 500 });
    }

    if (i === 0) firstTaskId = task.id;
    created++;
    events.push({
      project_id: projectId,
      event_type: "milestone_estimated",
      payload: {
        milestone_id: milestone.id, task_id: task.id, sequence: i,
        milestone_type: mapped.type, type_matched: mapped.matched, raw_label: mapped.rawLabel,
        cost_low: band.cost_low, cost_high: band.cost_high, basis: band.basis,
      },
      actor: "system",
    });
  }

  // 4. Append the events trail (best-effort; never fails the create).
  await supabase.from("events").insert(events);

  return NextResponse.json({
    projectId,
    scopeDocumentId: scopeId,
    createdCount: created,
    milestoneTotal: milestones.length,
    firstTaskId,
    estimateBand: { low: totalLow, high: totalHigh, confidence: 0.25, basis: "heuristic" },
  });
}
