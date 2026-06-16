import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guardAi } from "@/lib/ratelimit";
import { MOCK_FREELANCERS, SKILLS } from "@/lib/data";
import { readStore, writeStore } from "@/lib/store";
import type { Job, AIMatch, RegisteredFreelancer } from "@/lib/types";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  const blocked = guardAi(req); if (blocked) return blocked;
  const { brief, budget } = await req.json();
  if (!brief) return NextResponse.json({ error: "Brief required" }, { status: 400 });

  // Combine mock + registered freelancers into one pool
  const registered = readStore<RegisteredFreelancer[]>("freelancers", []);

  const pool = [
    ...MOCK_FREELANCERS.map(f => ({
      id: f.id,
      name: f.name,
      skill: f.skill,
      skillLabel: SKILLS[f.skill]?.label ?? f.skill,
      rate: f.rate,
      bio: f.bio,
      location: f.location,
    })),
    ...registered.map(f => ({
      id: f.id,
      name: f.name,
      skill: f.skill,
      skillLabel: SKILLS[f.skill]?.label ?? f.skill,
      rate: parseInt(f.rate) || 50,
      bio: f.bio || "Experienced professional.",
      location: f.location,
    })),
  ];

  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are the AI matching engine for Hyrde, a freelance marketplace. Find the best-fit freelancers for this client brief.

CLIENT BRIEF: "${brief}"
CLIENT BUDGET: "${budget || "not specified"}"

FREELANCER POOL:
${JSON.stringify(pool, null, 2)}

Scoring criteria:
1. Skill relevance — does their skill directly match what the brief needs? (40%)
2. Bio relevance — does their experience fit this specific project? (35%)
3. Rate fit — is their rate reasonable for the stated budget? (15%)
4. Other signals — specialization, seniority, location (10%)

Return ONLY valid JSON — no markdown fences, no text outside JSON:
{
  "matches": [
    {
      "id": "freelancer_id",
      "score": 96,
      "rationale": "2-3 specific sentences explaining why they fit THIS brief — reference their actual skills and bio",
      "highlights": ["specific strength 1", "specific strength 2", "specific strength 3"]
    }
  ]
}

Return top 5 ordered by score descending. Return fewer if genuinely fewer are relevant.`,
        },
      ],
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    const matches: AIMatch[] = (
      parsed.matches as Array<{
        id: string;
        score: number;
        rationale: string;
        highlights: string[];
      }>
    )
      .map(m => {
        const fl = pool.find(f => f.id === m.id);
        if (!fl) return null;
        return {
          id: fl.id,
          name: fl.name,
          skill: fl.skill,
          rate: fl.rate,
          bio: fl.bio,
          location: fl.location,
          score: Math.min(100, Math.max(0, m.score)),
          rationale: m.rationale ?? "",
          highlights: m.highlights ?? [],
        } satisfies AIMatch;
      })
      .filter((x): x is AIMatch => x !== null)
      .slice(0, 5);

    // Save job to store
    const jobs = readStore<Job[]>("jobs", []);
    const jobId = `job_${Date.now()}`;
    jobs.unshift({
      id: jobId,
      brief,
      budget: budget || "unspecified",
      postedAt: new Date().toISOString(),
      status: "open",
      matchCount: matches.length,
    });
    writeStore("jobs", jobs.slice(0, 500));

    return NextResponse.json({ jobId, matches });
  } catch (err) {
    console.error("Match API error:", err);

    // Still save the job even when AI fails
    const jobs = readStore<Job[]>("jobs", []);
    const jobId = `job_${Date.now()}`;
    jobs.unshift({
      id: jobId,
      brief,
      budget: budget || "unspecified",
      postedAt: new Date().toISOString(),
      status: "open",
      matchCount: 5,
    });
    writeStore("jobs", jobs.slice(0, 500));

    const fallback = [...MOCK_FREELANCERS]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(f => ({
        ...f,
        rationale: "AI matching temporarily unavailable — showing top-rated freelancers by score.",
        highlights: [],
      }));
    return NextResponse.json({ jobId, matches: fallback });
  }
}
