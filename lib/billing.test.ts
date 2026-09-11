import { describe, it, expect } from "vitest";
import { activeSub, pendingSub, parseTaskLimitError, newReference, type Subscription } from "./billing";

const sub = (over: Partial<Subscription>): Subscription => ({
  id: "s", user_id: "u", tier: "pro", status: "active", reference: "HYR-SUB-AAAAAA",
  amount_cents: 2000, method: "airtm", starts_at: null, expires_at: null,
  created_at: "2026-01-01T00:00:00Z", ...over,
});
const future = new Date(Date.now() + 86_400_000).toISOString();
const past = new Date(Date.now() - 86_400_000).toISOString();

describe("activeSub", () => {
  it("returns an active subscription that has not expired", () => {
    const s = sub({ expires_at: future });
    expect(activeSub([s])).toBe(s);
  });
  it("ignores an expired, undated or pending one", () => {
    expect(activeSub([sub({ expires_at: past })])).toBeNull();
    expect(activeSub([sub({ expires_at: null })])).toBeNull();
    expect(activeSub([sub({ status: "pending_payment", expires_at: future })])).toBeNull();
  });
});

describe("pendingSub", () => {
  it("finds the subscription awaiting payment", () => {
    const p = sub({ status: "pending_payment" });
    expect(pendingSub([sub({}), p])).toBe(p);
    expect(pendingSub([sub({})])).toBeNull();
  });
});

describe("parseTaskLimitError", () => {
  it("reads the tier and limit the database trigger raises", () => {
    expect(parseTaskLimitError('new row violates check: TASK_LIMIT|free|3')).toEqual({ tier: "free", limit: 3 });
    expect(parseTaskLimitError("TASK_LIMIT|pro|50")).toEqual({ tier: "pro", limit: 50 });
  });
  it("returns null for any other error", () => {
    expect(parseTaskLimitError("duplicate key value violates unique constraint")).toBeNull();
  });
});

describe("newReference", () => {
  it("is a payment reference with no characters people misread (I, L, O, 0, 1)", () => {
    for (let i = 0; i < 200; i++) {
      expect(newReference()).toMatch(/^HYR-SUB-[ABCDEFGHJKMNPQRSTUVWXYZ2-9]{6}$/);
    }
  });
});
