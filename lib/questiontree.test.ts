import { describe, it, expect } from "vitest";
import {
  selectNextQuestion, scopeConfidence, shouldStop, deriveRiskFlags, treeFor, versionFor,
  DONT_KNOW, MIN_QUESTIONS, QUESTION_BUDGET, type Question,
} from "./questiontree";

const q = (key: string, variance_weight: number, gatedBy?: Question["gatedBy"]): Question => ({
  key, text: key, type: "single_select",
  options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }],
  variance_weight, affects_milestones: [], gatedBy,
  unknown_risk: { description: `${key} unknown`, cost_impact_multiplier: [1, 1.5] },
});

// a, b, d are base questions (total weight 1.0); c only unlocks when a = "yes".
const TREE = [q("a", 0.6), q("b", 0.3), q("c", 0.9, { key: "a", equals: "yes" }), q("d", 0.1)];
const ALL_BASE = { a: "yes", b: "no", d: "no" };

describe("selectNextQuestion", () => {
  it("asks whatever resolves the most cost variance first", () => {
    expect(selectNextQuestion(TREE, {})?.key).toBe("a");
  });
  it("unlocks a gated follow-up only on the gating answer", () => {
    expect(selectNextQuestion(TREE, { a: "yes" })?.key).toBe("c");
    expect(selectNextQuestion(TREE, { a: "no" })?.key).toBe("b");
  });
  it("supports oneOf gating", () => {
    const tree = [q("a", 0.2), q("x", 0.9, { key: "a", oneOf: ["yes", "maybe"] })];
    expect(selectNextQuestion(tree, { a: "yes" })?.key).toBe("x");
    expect(selectNextQuestion(tree, { a: "no" })).toBeNull();
  });
  it("returns null when the tree is exhausted", () => {
    expect(selectNextQuestion(TREE, { ...ALL_BASE, c: "yes" })).toBeNull();
  });
});

describe("scopeConfidence", () => {
  it("is the fraction of base variance resolved", () => {
    expect(scopeConfidence(TREE, {})).toBe(0);
    expect(scopeConfidence(TREE, { a: "yes" })).toBeCloseTo(0.6);
  });
  it("does not count 'I don't know' as resolved", () => {
    expect(scopeConfidence(TREE, { a: DONT_KNOW })).toBe(0);
  });
  it("never exceeds 1 when gated questions are answered too", () => {
    expect(scopeConfidence(TREE, { ...ALL_BASE, c: "yes" })).toBe(1);
  });
});

describe("shouldStop", () => {
  it("never stops before the minimum while questions remain, however confident", () => {
    expect(shouldStop(TREE, ALL_BASE, MIN_QUESTIONS - 1)).toBe(false);
  });
  it("stops at the confidence target once the minimum is met", () => {
    expect(shouldStop(TREE, ALL_BASE, MIN_QUESTIONS)).toBe(true);
  });
  it("stops at the question budget regardless of confidence", () => {
    expect(shouldStop(TREE, {}, QUESTION_BUDGET)).toBe(true);
  });
  it("keeps going when confidence is low", () => {
    expect(shouldStop(TREE, { b: "no" }, MIN_QUESTIONS + 1)).toBe(false);
  });
  it("stops when there is nothing left to ask, even early", () => {
    expect(shouldStop(TREE, { ...ALL_BASE, c: "yes" }, 1)).toBe(true);
  });
});

describe("deriveRiskFlags", () => {
  it("flags an explicit 'I don't know' at the higher likelihood", () => {
    const flags = deriveRiskFlags(TREE, { a: DONT_KNOW }, new Set(["a"]));
    expect(flags).toEqual([
      { source_question_key: "a", description: "a unknown", likelihood: 0.55, cost_impact_multiplier: [1, 1.5] },
    ]);
  });
  it("flags a high-variance base question the budget never reached", () => {
    const flags = deriveRiskFlags(TREE, {}, new Set());
    expect(flags.map(f => [f.source_question_key, f.likelihood])).toEqual([["a", 0.4]]);
  });
  it("flags nothing that was actually answered", () => {
    expect(deriveRiskFlags(TREE, { a: "yes" }, new Set(["a"]))).toEqual([]);
  });
});

// The trees are hand-authored data. These catch authoring mistakes that would
// otherwise surface as a client stuck on a question that can never unlock.
describe.each([["shopify"], ["generic"]])("the real %s tree", (kind) => {
  const tree = treeFor(kind === "shopify" ? "shopify" : null);

  it("has unique keys", () => {
    expect(new Set(tree.map(t => t.key)).size).toBe(tree.length);
  });
  it("keeps every variance weight within 0..1", () => {
    for (const t of tree) expect(t.variance_weight, t.key).toBeGreaterThanOrEqual(0);
    for (const t of tree) expect(t.variance_weight, t.key).toBeLessThanOrEqual(1);
  });
  it("gates only on questions that exist", () => {
    const keys = new Set(tree.map(t => t.key));
    for (const t of tree) if (t.gatedBy) expect(keys.has(t.gatedBy.key), `${t.key} → ${t.gatedBy.key}`).toBe(true);
  });
  it("gives every question options and an ordered cost band", () => {
    for (const t of tree) {
      expect(t.options.length, t.key).toBeGreaterThan(0);
      const [lo, hi] = t.unknown_risk.cost_impact_multiplier;
      expect(lo, t.key).toBeLessThanOrEqual(hi);
    }
  });
});

describe("versionFor", () => {
  it("attributes each quote to the tree that produced it", () => {
    expect(versionFor("shopify")).toBe("shopify-v2");
    expect(versionFor("web_app_mvp")).toBe("generic-v2");
  });
});
