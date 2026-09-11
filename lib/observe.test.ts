import { describe, it, expect, vi, afterEach } from "vitest";

vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));
import * as Sentry from "@sentry/nextjs";
import { reportError, logError } from "./observe";

const capture = () => vi.spyOn(console, "error").mockImplementation(() => {});
const lastLine = (spy: ReturnType<typeof capture>) => JSON.parse(String(spy.mock.calls.at(-1)?.[0]));

describe("reportError", () => {
  afterEach(() => vi.clearAllMocks());

  it("writes one JSON line that a log search can filter on", () => {
    const spy = capture();
    reportError("classify.capture", new Error("boom"), { user: "u1" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = lastLine(spy);
    expect(line).toMatchObject({ level: "error", where: "classify.capture", message: "boom", user: "u1" });
    expect(line.stack).toContain("boom");
  });

  it("sends the failure to Sentry, tagged with where it happened", () => {
    capture();
    const err = new Error("boom");
    reportError("brief.capture", err, { user: "u1" });
    expect(Sentry.captureException).toHaveBeenCalledWith(err, { tags: { where: "brief.capture" }, extra: { user: "u1" } });
  });

  it("wraps Supabase errors, which are plain objects, so Sentry can group them", () => {
    const spy = capture();
    reportError("x", { message: "permission denied for table leads", code: "42501" });
    expect(lastLine(spy)).toMatchObject({ message: "permission denied for table leads", code: "42501" });
    const [sent, ctx] = vi.mocked(Sentry.captureException).mock.calls[0];
    expect(sent).toBeInstanceOf(Error);
    expect((sent as Error).message).toBe("x: permission denied for table leads");
    expect(ctx).toMatchObject({ tags: { where: "x", code: "42501" } });
  });

  it("never throws, whatever it is handed, even if Sentry does", () => {
    capture();
    vi.mocked(Sentry.captureException).mockImplementationOnce(() => { throw new Error("sentry down"); });
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    for (const v of [undefined, null, "a string", 42, circular]) {
      expect(() => reportError("x", v)).not.toThrow();
    }
  });
});

describe("logError", () => {
  afterEach(() => vi.clearAllMocks());

  it("logs without sending to Sentry (used where Sentry already has the error)", () => {
    const spy = capture();
    logError("request", new Error("boom"));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
