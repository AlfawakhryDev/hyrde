import { describe, it, expect, vi, afterEach } from "vitest";
import { reportError } from "./observe";

const capture = () => vi.spyOn(console, "error").mockImplementation(() => {});
const lastLine = (spy: ReturnType<typeof capture>) => JSON.parse(String(spy.mock.calls.at(-1)?.[0]));

describe("reportError", () => {
  afterEach(() => vi.restoreAllMocks());

  it("writes one JSON line that a log search can filter on", () => {
    const spy = capture();
    reportError("classify.capture", new Error("boom"), { user: "u1" });
    expect(spy).toHaveBeenCalledTimes(1);
    const line = lastLine(spy);
    expect(line).toMatchObject({ level: "error", where: "classify.capture", message: "boom", user: "u1" });
    expect(line.stack).toContain("boom");
  });

  it("understands Supabase errors, which are plain objects, not Errors", () => {
    const spy = capture();
    reportError("x", { message: "permission denied for table leads", code: "42501" });
    expect(lastLine(spy)).toMatchObject({ message: "permission denied for table leads", code: "42501" });
  });

  it("never throws, whatever it is handed", () => {
    capture();
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    for (const v of [undefined, null, "a string", 42, circular]) {
      expect(() => reportError("x", v)).not.toThrow();
    }
  });
});
