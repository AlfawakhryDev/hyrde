import { reportError } from "@/lib/platform/observe";
import type { Locale } from "@/lib/i18n";

// ── Server-side transcription of a recorded interview answer ────────────────
// The browser's own recogniser only hears the language Chrome hands it, and it
// is useless for dialectal Arabic. The audio is transcribed here instead, and
// this text is what the grader sees.
//
// Providers, in order:
//   ASR_URL             any OpenAI-compatible /v1/audio/transcriptions endpoint.
//                       A self-hosted Audar-ASR on vLLM speaks exactly this, so
//                       switching to it is a URL, not a rewrite.
//   ELEVENLABS_API_KEY  ElevenLabs Scribe. No new vendor; the key already exists.
//
// Returns null when nothing is configured or the call fails, and never throws:
// the caller falls back to whatever the browser heard. A transcription outage
// must never end someone's interview.

export type Transcript = { text: string; provider: string };

const TIMEOUT_MS = 25_000;

export async function transcribeAnswer(file: File, locale: Locale): Promise<Transcript | null> {
  const url = process.env.ASR_URL;
  if (url) return call("asr-url", () => openAiCompatible(url, file, locale));
  if (process.env.ELEVENLABS_API_KEY) return call("elevenlabs", () => elevenLabs(file, locale));
  return null;
}

async function call(provider: string, run: () => Promise<string>): Promise<Transcript | null> {
  try {
    const text = (await run()).trim();
    return text ? { text, provider } : null;
  } catch (err) {
    reportError("asr", err, { provider });
    return null;
  }
}

async function openAiCompatible(url: string, file: File, locale: Locale): Promise<string> {
  const form = new FormData();
  form.set("file", file);
  form.set("model", process.env.ASR_MODEL || "audar-asr-v1-turbo");
  form.set("language", locale);
  form.set("temperature", "0");
  const key = process.env.ASR_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: key ? { Authorization: `Bearer ${key}` } : undefined,
    body: form,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`asr ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return String(data?.text ?? "");
}

async function elevenLabs(file: File, locale: Locale): Promise<string> {
  const model = process.env.ELEVENLABS_STT_MODEL || "scribe_v2";
  const res = await scribe(file, locale, model);
  // Which Scribe models an account may call varies. Rather than leave every
  // Arabic candidate stuck because of a model name, fall back to the older one.
  if (res.status >= 400 && res.status < 500 && model !== "scribe_v1") {
    const retry = await scribe(file, locale, "scribe_v1");
    if (retry.ok) return String((await retry.json())?.text ?? "");
  }
  if (!res.ok) throw new Error(`elevenlabs ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return String(data?.text ?? "");
}

function scribe(file: File, locale: Locale, model: string): Promise<Response> {
  const form = new FormData();
  form.set("file", file);
  form.set("model_id", model);
  form.set("language_code", locale);
  return fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY as string },
    body: form,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
