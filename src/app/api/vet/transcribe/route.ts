import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { limitAi } from "@/lib/platform/ratelimit";
import { transcribeAnswer } from "@/lib/vetting/asr";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Vercel rejects a request body over 4.5 MB. The client sends an audio-only
// track (~50 KB a minute), so this cap is generous for a spoken answer.
const MAX_BYTES = 4 * 1024 * 1024;

// ── Transcribe one spoken answer ───────────────────────────────────────────
// Answers "" rather than an error when no provider is configured or the
// provider is down: the interview then falls back to the browser's transcript
// instead of stopping.
export async function POST(req: NextRequest) {
  const blocked = await limitAi(req);
  if (blocked) return blocked;

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "The recording is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That recording is too long." }, { status: 413 });
  if (!file.type.startsWith("audio/")) return NextResponse.json({ error: "Audio only." }, { status: 415 });

  const raw = form?.get("locale");
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const result = await transcribeAnswer(file, locale);
  return NextResponse.json({ text: result?.text ?? "", provider: result?.provider ?? null });
}
