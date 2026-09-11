// Kept out of lib/interviewer.ts on purpose: that module constructs the
// Anthropic SDK at import, and LiveInterview is a client component. Importing
// it from the browser dragged node:fs into the bundle and broke the build.

// ── Steering the live agent at call time ─────────────────────────────
// The ElevenLabs agent's base prompt lives in their dashboard, not this repo,
// so it cannot be redeployed. A contextual update sent on connect does the
// same job without anyone touching the dashboard, and it already carries the
// category — the language rides along the same way.
export function liveContextUpdate(category: string, locale = "en", cvNote?: string | null): string {
  const base = `This candidate is being vetted for the "${category}" category. Tailor every question specifically to ${category}.${cvNote ? `\n\n${cvNote}\n\n` : ""}`;
  if (locale === "ar") {
    return `${base} CRITICAL: conduct this entire interview in spoken Arabic, the way an experienced Gulf professional talks. Keep technical terms in English where practitioners really use them (API, React, SEO, engagement, brand voice). Do not translate tool or product names. Never switch to English sentences, even if the candidate uses an English word. Judge the substance of what they say, never their fluency. Begin the interview now, in Arabic.`;
  }
  if (locale === "de") {
    return `${base} CRITICAL: conduct this entire interview in spoken German, using "du". Keep technical terms in English where German practitioners really use them. Judge the substance, never the fluency. Begin the interview now, in German.`;
  }
  return `${base} Begin the interview now.`;
}
