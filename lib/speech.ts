// ── Interviewer text-to-speech ────────────────────────────────────────────────
// Makes the AI interviewer actually SPEAK its questions. Two tiers, transparent
// to the caller:
//   1. High quality — POST /api/vet/speak returns neural audio (ElevenLabs /
//      OpenAI) when a TTS key is configured server-side. Streamed and played.
//   2. Fallback — the browser's SpeechSynthesis with the best local voice, so
//      voice interviews work with zero config and zero cost.
// speak() resolves when the utterance finishes, so the UI can auto-listen next.

let currentAudio: HTMLAudioElement | null = null;
let serverTtsAvailable: boolean | null = null; // cache the 204 (not configured) result

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Browser voices load asynchronously — resolve once they're populated.
function getVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    const handler = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Safety: some browsers never fire the event.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 800);
  });
}

// Pick the most natural available English voice.
const VOICE_PREFERENCE = [
  "Samantha", "Ava", "Aria", "Jenny", "Serena", "Google US English",
  "Microsoft Aria Online", "Microsoft Jenny Online", "Natural", "Neural",
];
async function pickVoice(): Promise<SpeechSynthesisVoice | null> {
  const voices = await getVoices();
  const en = voices.filter(v => v.lang?.toLowerCase().startsWith("en"));
  for (const pref of VOICE_PREFERENCE) {
    const match = en.find(v => v.name.includes(pref));
    if (match) return match;
  }
  return en.find(v => v.lang.toLowerCase() === "en-us") ?? en[0] ?? voices[0] ?? null;
}

async function speakBrowser(text: string): Promise<void> {
  if (!ttsSupported()) return;
  const voice = await pickVoice();
  return new Promise<void>(resolve => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 0.98;
      u.pitch = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

async function speakServer(text: string): Promise<boolean> {
  if (serverTtsAvailable === false) return false;
  try {
    const res = await fetch("/api/vet/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.status === 204 || !res.ok) {
      serverTtsAvailable = false; // not configured — stop trying
      return false;
    }
    serverTtsAvailable = true;
    const buf = await res.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: res.headers.get("content-type") || "audio/mpeg" }));
    await new Promise<void>((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    });
    URL.revokeObjectURL(url);
    currentAudio = null;
    return true;
  } catch {
    return false;
  }
}

// Speak `text`. Resolves when finished. Tries neural server voice first, then
// the browser voice.
export async function speak(text: string): Promise<void> {
  const clean = text.trim();
  if (!clean) return;
  const played = await speakServer(clean);
  if (!played) await speakBrowser(clean);
}

export function cancelSpeech(): void {
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  if (currentAudio) {
    try { currentAudio.pause(); } catch { /* ignore */ }
    currentAudio = null;
  }
}
