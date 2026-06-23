import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

const anthropic = new Anthropic();

// ── Hyrde Arena — the live agent ────────────────────────────────────────────
// A client describes a real task. A real Claude agent attempts as much as it
// can RIGHT NOW, then self-assesses and hands off the judgment work to humans
// who can "mount" the task. The agent is the floor; the human is the ceiling.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const { task, context } = await req.json();
  if (!task || String(task).trim().length < 10) {
    return NextResponse.json(
      { error: "Describe the task in a sentence or two so the agent has something to work with." },
      { status: 400 },
    );
  }

  const prompt = `You are the Hyrde Arena Agent — an autonomous AI worker on a freelance marketplace where AI agents and human freelancers fuse to finish real work. A client just dropped a task into the Arena. Your job: ATTEMPT the task for real, right now, as far as your capabilities allow — then honestly hand off the parts that need a human's judgment, taste, access, or accountability.

CLIENT TASK:
"""
${String(task).trim().slice(0, 4000)}
"""
${context ? `\nADDITIONAL CONTEXT / FILES (text):\n"""\n${String(context).trim().slice(0, 6000)}\n"""\n` : ""}

Do the work. If it's copy, write the copy. If it's code, write the code. If it's a plan, strategy, outline, analysis, or research, produce it concretely. Don't describe what you would do — actually do it in the "deliverable" field. Be genuinely useful.

Then judge honestly where a human freelancer must "mount" to take it the rest of the way (e.g. final taste/brand calls, real-world access, accounts you can't touch, on-brand polish, legal/financial accountability, things needing the client's private data, or anything you cannot verify).

Return ONLY valid JSON — no markdown fences, no text outside the JSON object:
{
  "completion": <integer 0-100, honest % of the whole task you actually completed>,
  "summary": "<one punchy sentence: what you delivered>",
  "deliverable": "<the ACTUAL work product, as markdown. Real content the client can use immediately. This is the main payload — make it substantial and concrete.>",
  "delivered": ["<3-5 short bullets of concrete things you finished>"],
  "mountPoints": [
    {
      "role": "<the human specialist needed, e.g. 'Senior Brand Designer'>",
      "task": "<the specific thing the human picks up>",
      "why": "<why a human, not the agent, must do this>",
      "handoff": "<your direct handoff brief TO that human: what's done, what's left, key context, gotchas. 2-4 sentences, written agent-to-human.>",
      "xp": <integer 50-500, bigger for harder/judgment-heavy work>,
      "bounty": "<indicative pay like '$80–$150' — realistic for the scope>"
    }
  ],
  "agentLine": "<a short, confident in-character line from you, e.g. 'I took it to 70%. The taste call is yours.'>"
}

Include 1-3 mountPoints. If the task is genuinely fully completable by you, still include at least one mountPoint for human review/QA. Keep deliverable focused and real.`;

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2400,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    const completion = Math.max(0, Math.min(100, Number(parsed.completion) || 0));
    const mountPoints = (parsed.mountPoints ?? []).slice(0, 3).map((m: Record<string, unknown>) => ({
      role: String(m.role ?? "Human specialist"),
      task: String(m.task ?? "Take this the rest of the way"),
      why: String(m.why ?? "Needs human judgment."),
      handoff: String(m.handoff ?? "Picking up where the agent left off."),
      xp: Math.max(50, Math.min(500, Number(m.xp) || 120)),
      bounty: String(m.bounty ?? "$80–$150"),
    }));

    return NextResponse.json({
      completion,
      summary: String(parsed.summary ?? "The agent took a first pass at your task."),
      deliverable: String(parsed.deliverable ?? ""),
      delivered: (parsed.delivered ?? []).slice(0, 6).map(String),
      mountPoints: mountPoints.length ? mountPoints : [
        { role: "Human reviewer", task: "Review and approve the agent's output", why: "A human should sign off before this ships.", handoff: "Draft is ready — review for accuracy and fit, then ship.", xp: 80, bounty: "$40–$80" },
      ],
      agentLine: String(parsed.agentLine ?? `I took it to ${completion}%. A human takes it home.`),
      source: "ai",
    });
  } catch (err) {
    console.error("Arena API error:", err);
    return NextResponse.json({
      completion: 35,
      summary: "The agent scoped your task and flagged it for a human teammate.",
      deliverable:
        "### First pass\n\nThe agent parsed your request and broke it into actionable steps, but needs a human to mount in and execute the specialist work below.\n\n- Clarified the core goal\n- Identified the skills required\n- Outlined the path to done",
      delivered: ["Parsed the task", "Identified required skills", "Outlined next steps"],
      mountPoints: [
        { role: "Generalist freelancer", task: "Execute the task end-to-end", why: "The live agent is busy — a human can run with this now.", handoff: "Task is scoped and ready to start. Jump in.", xp: 150, bounty: "$80–$200" },
      ],
      agentLine: "Heavy load right now — a human can mount this one.",
      source: "fallback",
    });
  }
}
