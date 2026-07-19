import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/arena";
import { RETAKE_COOLDOWN_HOURS } from "@/lib/vetting";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Start a LIVE voice interview ───────────────────────────────────────────────
// Mints a signed WebSocket URL for the ElevenLabs Conversational-AI agent and
// opens a vetting row. The API key never leaves the server; the browser only
// gets the short-lived signed URL. 501 if the agent isn't configured yet.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in to get vetted." }, { status: 401 });

  const { category } = await req.json();
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Pick a valid category." }, { status: 400 });
  }

  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  if (!key || !agentId) {
    return NextResponse.json({ error: "Live interview isn't configured yet." }, { status: 501 });
  }

  // Already passed / on cooldown — same guards as the turn-based interview.
  const { data: existing } = await supabase
    .from("vettings")
    .select("id, status, completed_at")
    .eq("user_id", user.id)
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.status === "passed") {
    return NextResponse.json({ error: "You're already vetted in this category." }, { status: 409 });
  }
  if (existing?.status === "failed" && existing.completed_at) {
    const hrs = (Date.now() - new Date(existing.completed_at).getTime()) / 3.6e6;
    if (hrs < RETAKE_COOLDOWN_HOURS) {
      return NextResponse.json({ error: `You can retake in ${Math.ceil(RETAKE_COOLDOWN_HOURS - hrs)}h.` }, { status: 429 });
    }
  }

  // Signed URL (short-lived) for a private agent conversation.
  let signedUrl: string;
  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { "xi-api-key": key } },
    );
    if (!r.ok) throw new Error(`get-signed-url ${r.status} ${await r.text().catch(() => "")}`);
    const j = await r.json();
    signedUrl = j.signed_url;
    if (!signedUrl) throw new Error("no signed_url in response");
  } catch (err) {
    console.error("ElevenLabs signed-url failed:", err);
    return NextResponse.json({ error: "Couldn't start the live interview — try again." }, { status: 502 });
  }

  const { data: created, error: insErr } = await supabase
    .from("vettings")
    .insert({ user_id: user.id, category, status: "in_progress", mode: "video", transcript: [] })
    .select("id")
    .single();
  if (insErr || !created) {
    console.error("vet/live-session insert failed:", insErr);
    return NextResponse.json({ error: "Could not start the interview." }, { status: 500 });
  }

  return NextResponse.json({ signedUrl, vettingId: created.id, category });
}
