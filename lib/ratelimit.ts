// ─── Lightweight abuse protection for the paid AI endpoints ─────────────────
// These routes call the Anthropic API (which costs money) and are public, so we
// guard them with: (1) an optional kill switch, (2) a per-IP sliding window,
// and (3) a global per-minute circuit breaker.
//
// NOTE: state is in-memory, so on Vercel it is PER serverless instance and
// resets on cold starts — this deters casual abuse but is not a hard guarantee.
// For strong limits, back this with Vercel KV / Upstash Redis later.

type Hit = { count: number; resetAt: number };

const PER_IP_LIMIT = Number(process.env.AI_RATE_LIMIT ?? 8);   // requests
const PER_IP_WINDOW_MS = 60_000;                               // per minute
const GLOBAL_LIMIT = Number(process.env.AI_GLOBAL_LIMIT ?? 80); // requests / min across this instance

const ipHits = new Map<string, Hit>();
let globalHit: Hit = { count: 0, resetAt: Date.now() + 60_000 };

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function tooMany(retryAfter: number, msg: string): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}

/**
 * Call at the top of any AI route handler:
 *   const blocked = guardAi(req); if (blocked) return blocked;
 * Returns a Response to send back when the request should be rejected, else null.
 */
export function guardAi(req: Request): Response | null {
  // (1) Kill switch — set AI_ENABLED=false on the deployment to disable instantly.
  if (process.env.AI_ENABLED === "false") {
    return new Response(
      JSON.stringify({ error: "AI features are temporarily unavailable. Please try again later." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

  const now = Date.now();

  // (2) Global circuit breaker (protects the bill from a traffic spike).
  if (now > globalHit.resetAt) globalHit = { count: 0, resetAt: now + 60_000 };
  globalHit.count++;
  if (globalHit.count > GLOBAL_LIMIT) {
    return tooMany(Math.ceil((globalHit.resetAt - now) / 1000), "Service is busy right now. Please try again in a minute.");
  }

  // (3) Per-IP sliding window.
  const ip = clientIp(req);
  const hit = ipHits.get(ip);
  if (!hit || now > hit.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + PER_IP_WINDOW_MS });
  } else {
    hit.count++;
    if (hit.count > PER_IP_LIMIT) {
      return tooMany(Math.ceil((hit.resetAt - now) / 1000), "You're going a bit fast. Please wait a moment and try again.");
    }
  }

  // Opportunistic cleanup so the map can't grow unbounded.
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) if (now > v.resetAt) ipHits.delete(k);
  }

  return null;
}
