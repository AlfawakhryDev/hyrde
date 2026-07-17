import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { guardAi } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Interviewer voice (neural TTS) ─────────────────────────────────────────────
// Turns an interviewer question into speech. High-quality neural voice when a
// provider key is set (ElevenLabs preferred, then OpenAI); otherwise returns
// 204 so the client falls back to the browser's built-in voice. Never stores
// audio — it's synthesized per request and streamed straight back.
export async function POST(req: NextRequest) {
  const blocked = guardAi(req);
  if (blocked) return blocked;

  // Auth-gated: only someone in an interview should hit this.
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { text } = await req.json();
  const clean = String(text ?? "").trim().slice(0, 700);
  if (!clean) return NextResponse.json({ error: "text is required." }, { status: 400 });

  const eleven = process.env.ELEVENLABS_API_KEY;
  const openai = process.env.OPENAI_API_KEY;

  try {
    if (eleven) {
      // Rachel — a warm, natural default voice; override with ELEVENLABS_VOICE_ID.
      const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "xi-api-key": eleven,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: clean,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.15 },
        }),
      });
      if (!r.ok) throw new Error(`elevenlabs ${r.status}`);
      return new NextResponse(r.body, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
      });
    }

    if (openai) {
      const r = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${openai}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: process.env.OPENAI_TTS_VOICE || "alloy",
          input: clean,
          instructions: "Warm, professional technical interviewer. Natural, unhurried, curious.",
        }),
      });
      if (!r.ok) throw new Error(`openai ${r.status}`);
      return new NextResponse(r.body, {
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
      });
    }
  } catch (err) {
    console.error("TTS provider failed, client will use browser voice:", err);
  }

  // No provider configured (or it failed) → tell the client to use browser TTS.
  return new NextResponse(null, { status: 204 });
}
