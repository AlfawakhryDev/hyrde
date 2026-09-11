import { supabaseAdmin } from "@/lib/supabase/admin";
import { reportError } from "@/lib/observe";

// ─── Abuse protection for the paid AI endpoints ─────────────────────────────
// These routes call Anthropic, which costs money, and they are public. Three
// layers: kill switches, a per-IP limit, and a global limit.
//
// The counters live in Postgres (rate_limit_ai, migration 0044), so every
// server instance shares one count. They used to live in each instance's
// memory, where N instances meant N times the limit and a cold start reset
// it. Postgres is also the one store that stays put when hosting moves to AWS.
//
// If the database is slow, down or not configured (local development, CI),
// the in-memory limiter below takes over: weaker, but never none, and never
// an outage.
// ponytail: one database round trip per AI call. Move this to Redis
// (ElastiCache on AWS) behind this same function when AI traffic reaches
// hundreds of requests a minute.

type Hit = { count: number; resetAt: number };

// One project walkthrough legitimately spends five of these: site-audit,
// classify, questions, scope-project, suggest-specialists. At 8/min a single
// retry pushed a real client over the limit, and because /api/questions falls
// back silently on failure the only visible symptom was "the questions are
// still static". Budget for a few projects a minute, not one.
const PER_IP_LIMIT = Number(process.env.AI_RATE_LIMIT ?? 30);  // requests per minute
const PER_IP_WINDOW_MS = 60_000;
const GLOBAL_LIMIT = Number(process.env.AI_GLOBAL_LIMIT ?? 80); // requests per minute, all visitors

const MESSAGE = {
  ip: "You're going a bit fast. Please wait a moment and try again.",
  global: "Service is busy right now. Please try again in a minute.",
} as const;

// MANUAL SUSPEND: paid Anthropic endpoints are paused to control cost.
// Flip to true (and redeploy) to pause the live agent and AI features.
const AI_SUSPENDED = false;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function unavailable(msg: string): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });
}

function tooMany(retryAfter: number, msg: string): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}

// ── Fallback: per-instance memory ──────────────────────────────────────────
const ipHits = new Map<string, Hit>();
let globalHit: Hit = { count: 0, resetAt: Date.now() + 60_000 };

function limitInMemory(ip: string): Response | null {
  const now = Date.now();
  if (now > globalHit.resetAt) globalHit = { count: 0, resetAt: now + 60_000 };
  globalHit.count++;
  if (globalHit.count > GLOBAL_LIMIT) {
    return tooMany(Math.ceil((globalHit.resetAt - now) / 1000), MESSAGE.global);
  }
  const hit = ipHits.get(ip);
  if (!hit || now > hit.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + PER_IP_WINDOW_MS });
  } else if (++hit.count > PER_IP_LIMIT) {
    return tooMany(Math.ceil((hit.resetAt - now) / 1000), MESSAGE.ip);
  }
  if (ipHits.size > 5000) {
    for (const [k, v] of ipHits) if (now > v.resetAt) ipHits.delete(k);
  }
  return null;
}

// A failing limiter is reported once a minute per instance, not once per
// request: with the database down, every AI call would otherwise page someone.
let lastReport = 0;

type Verdict = { allowed: boolean; reason: "ip" | "global" | null; retry_after: number };

/**
 * Call at the top of any AI route handler:
 *   const blocked = await limitAi(req); if (blocked) return blocked;
 * Returns the Response to send when the request is rejected, otherwise null.
 *
 * Renamed from the synchronous guardAi on purpose: a call site that forgot to
 * await would hold a Promise, which is always truthy, and block every request.
 * With a new name, a missed call site is a compile error instead.
 */
export async function limitAi(req: Request): Promise<Response | null> {
  if (AI_SUSPENDED) return unavailable("The live agent is paused right now while we tune things. Check back soon.");
  if (process.env.AI_ENABLED === "false") return unavailable("AI features are temporarily unavailable. Please try again later.");

  const ip = clientIp(req);
  const db = supabaseAdmin();
  if (db) {
    try {
      const { data, error } = await db
        .rpc("rate_limit_ai", { p_ip: ip, p_per_ip: PER_IP_LIMIT, p_global: GLOBAL_LIMIT })
        .abortSignal(AbortSignal.timeout(1500));
      if (!error && data) {
        const v = data as Verdict;
        return v.allowed ? null : tooMany(v.retry_after, MESSAGE[v.reason ?? "ip"]);
      }
      throw error ?? new Error("rate_limit_ai returned no data");
    } catch (err) {
      if (Date.now() - lastReport > 60_000) {
        lastReport = Date.now();
        reportError("ratelimit.db", err, { fallback: "memory" });
      }
    }
  }
  return limitInMemory(ip);
}
