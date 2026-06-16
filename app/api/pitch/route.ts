import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { guardAi } from "@/lib/ratelimit";

const anthropic = new Anthropic();

function buildTemplatePitch({
  name,
  skill,
  bio,
  brief,
}: {
  name: string;
  skill: string;
  bio: string;
  brief: string;
}): string {
  const role = skill || "freelancer";
  const bioSnippet = bio ? bio.split(".")[0] : `an experienced ${role}`;
  // Pull a keyword from the brief for a "I noticed you need..." opener
  const briefWords = brief.toLowerCase().split(/\s+/);
  const projectKeywords = ["redesign", "build", "develop", "create", "migrate", "integrate", "optimize", "launch", "scale", "fix"];
  const foundKw = projectKeywords.find(kw => briefWords.includes(kw));
  const opener = foundKw
    ? `I noticed you're looking to ${foundKw} — that's exactly the kind of work I do well.`
    : `Your project brief caught my attention straight away — it's a strong fit for my background.`;

  return `${opener}

I'm ${name}, ${bioSnippet}. I've handled projects very similar to what you've described — the specifics in your brief line up closely with work I've shipped before.

Here's how I'd approach this: I'd start with a quick discovery call to align on scope and success criteria, then move into execution with regular check-ins so there are no surprises. I keep communication tight and deliver on time.

My rate is competitive for the value delivered, and I'm available to start quickly. Happy to jump on a 20-minute call this week to see if we're a good fit — no pressure either way.`;
}

export async function POST(req: NextRequest) {
  const blocked = guardAi(req); if (blocked) return blocked;
  const { brief, name, skill, bio } = await req.json();

  if (!brief || !name) {
    return new Response("Missing required fields", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = anthropic.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: `You are writing a freelance proposal on behalf of ${name}.

FREELANCER PROFILE:
- Name: ${name}
- Role/Skill: ${skill || "Freelancer"}
- Bio: ${bio || "Experienced professional"}

CLIENT JOB BRIEF:
"${brief}"

Write a winning proposal FROM ${name}'s perspective (first person "I").

Rules:
- 120–160 words max
- Open with a hook that shows you read the brief — reference something specific
- Explain concretely how your background fits this project
- Be confident, direct, and human — no corporate fluff
- End with a clear call-to-action (e.g. "Happy to jump on a call this week")
- Do NOT use: "I am writing to apply", "I believe I am the perfect", "I am passionate about", "unique opportunity"
- Sound like a real person, not a template

Write only the proposal text — no intro, no "here is your proposal":`,
            },
          ],
        });

        for await (const event of anthropicStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("Pitch API error:", err);
        // Graceful fallback — generate a template proposal from inputs so the feature always works
        const fallback = buildTemplatePitch({ name, skill, bio, brief });
        // Stream it word-by-word for a natural feel
        const words = fallback.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise(r => setTimeout(r, 18));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
