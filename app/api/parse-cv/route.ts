import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ALL_SKILL_SLUGS } from "@/lib/data";
import { guardAi } from "@/lib/ratelimit";

const anthropic = new Anthropic();

export const dynamic = "force-dynamic";

const SYSTEM = `You are a CV/resume parser. Extract structured profile data and return ONLY valid JSON — no markdown fences, no commentary.

Available skill slugs (choose the closest match):
${ALL_SKILL_SLUGS.join(", ")}

Return exactly this JSON shape:
{
  "name": "full name",
  "email": "email or empty string",
  "location": "city, country or remote — empty if not found",
  "skill": "slug from the list above or a short skill title if no slug matches",
  "rate": "suggested hourly USD rate as a number string e.g. '85'",
  "bio": "2-3 sentence professional summary written in first person",
  "portfolio": "URL if found, else empty string",
  "highlights": ["top achievement 1", "top achievement 2", "top achievement 3"],
  "yearsExperience": 5
}`;

function heuristicParse(filename: string): Record<string, unknown> {
  return {
    name: filename.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    email: "", location: "", skill: "", rate: "75",
    bio: "Experienced professional. Please review and update this summary.",
    portfolio: "", highlights: [], yearsExperience: 0, source: "heuristic",
  };
}

export async function POST(req: NextRequest) {
  const blocked = guardAi(req); if (blocked) return blocked;
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });

    const bytes = await file.arrayBuffer();
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userContent: any;

    if (isPdf) {
      const base64 = Buffer.from(bytes).toString("base64");
      userContent = [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } },
        { type: "text", text: "Extract the structured profile from this CV/resume." },
      ];
    } else {
      const text = new TextDecoder("utf-8").decode(bytes);
      userContent = `CV content:\n\n${text.slice(0, 7000)}\n\nExtract the structured profile from this resume.`;
    }

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 900,
      system: SYSTEM,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: [{ role: "user", content: userContent }] as any,
    });

    const raw = (msg.content[0] as { type: string; text: string }).text.trim();
    const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(jsonStr);

    return NextResponse.json({ ...parsed, source: "ai" });
  } catch (err) {
    console.error("CV parse error:", err);
    const file = (await req.formData().catch(() => new FormData())).get("file") as File | null;
    return NextResponse.json({ ...(file ? heuristicParse(file.name) : heuristicParse("resume")), source: "heuristic" }, { status: 200 });
  }
}
