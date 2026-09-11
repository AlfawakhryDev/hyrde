import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const rpc = vi.fn();
let dbConfigured = true;
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => (dbConfigured ? { rpc } : null) }));
vi.mock("@/lib/observe", () => ({ reportError: vi.fn() }));
import { reportError } from "@/lib/observe";
import { limitAi } from "./ratelimit";

const req = (ip: string) => new Request("http://test/api/x", { headers: { "x-forwarded-for": `${ip}, 10.0.0.1` } });
// supabase-js: rpc(...) returns a builder; .abortSignal(...) resolves to { data, error }.
const dbAnswers = (value: unknown) => rpc.mockReturnValue({ abortSignal: () => Promise.resolve(value) });
const dbThrows = () => rpc.mockReturnValue({ abortSignal: () => Promise.reject(new Error("timeout")) });

describe("limitAi", () => {
  beforeEach(() => { vi.clearAllMocks(); dbConfigured = true; });
  afterEach(() => { delete process.env.AI_ENABLED; });

  it("refuses everything when the kill switch is off", async () => {
    process.env.AI_ENABLED = "false";
    expect((await limitAi(req("1.1.1.1")))?.status).toBe(503);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("asks the shared counter, keyed by the caller's real IP", async () => {
    dbAnswers({ data: { allowed: true, reason: null, retry_after: 30 }, error: null });
    expect(await limitAi(req("1.2.3.4"))).toBeNull();
    expect(rpc).toHaveBeenCalledWith("rate_limit_ai", { p_ip: "1.2.3.4", p_per_ip: 30, p_global: 80 });
  });

  it("answers 429 with Retry-After when that IP is over its limit", async () => {
    dbAnswers({ data: { allowed: false, reason: "ip", retry_after: 12 }, error: null });
    const res = (await limitAi(req("2.2.2.2")))!;
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("12");
    expect((await res.json()).error).toMatch(/a bit fast/);
  });

  it("says the service is busy when everyone together is over the limit", async () => {
    dbAnswers({ data: { allowed: false, reason: "global", retry_after: 5 }, error: null });
    expect((await (await limitAi(req("3.3.3.3")))!.json()).error).toMatch(/busy/);
  });

  it("falls back to memory when the database fails, and reports it once a minute, not per request", async () => {
    dbThrows();
    expect(await limitAi(req("4.4.4.4"))).toBeNull();
    expect(await limitAi(req("4.4.4.4"))).toBeNull();
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(reportError).toHaveBeenCalledWith("ratelimit.db", expect.any(Error), { fallback: "memory" });
  });

  it("still limits with no database configured (local development, CI)", async () => {
    dbConfigured = false;
    for (let i = 0; i < 30; i++) expect(await limitAi(req("5.5.5.5"))).toBeNull();
    expect((await limitAi(req("5.5.5.5")))?.status).toBe(429);
    expect(await limitAi(req("6.6.6.6"))).toBeNull(); // someone else is unaffected
    expect(rpc).not.toHaveBeenCalled();
  });
});
