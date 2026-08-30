import { describe, expect, it } from "vitest";
import { isBusinessEmail } from "./email";

describe("isBusinessEmail()", () => {
  it("accepts a real company domain", () => {
    expect(isBusinessEmail("cto@acme-gmbh.de")).toBe(true);
    expect(isBusinessEmail("j.doe@scaleup.io")).toBe(true);
  });
  it("rejects free consumer providers (incl. German ones)", () => {
    for (const e of ["a@gmail.com", "a@web.de", "a@gmx.de", "a@t-online.de", "a@icloud.com", "a@outlook.com", "a@bluewin.ch"]) {
      expect(isBusinessEmail(e), e).toBe(false);
    }
  });
  it("is case-insensitive and trims", () => {
    expect(isBusinessEmail("  CTO@Gmail.com ")).toBe(false);
    expect(isBusinessEmail("  CTO@Acme.de ")).toBe(true);
  });
  it("rejects malformed input", () => {
    for (const e of ["", "notanemail", "a@b", "a@@b.de", "a b@x.de"]) {
      expect(isBusinessEmail(e), e).toBe(false);
    }
  });
});
