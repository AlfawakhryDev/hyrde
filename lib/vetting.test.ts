import { describe, it, expect } from "vitest";
import { bandFor, PASS_THRESHOLD } from "./vetting";

// The "vetted" label is what clients rely on. Pin its boundaries.
describe("bandFor", () => {
  it.each([
    [0, null], [PASS_THRESHOLD - 1, null],
    [PASS_THRESHOLD, "Vetted"], [74, "Vetted"],
    [75, "Strong"], [87, "Strong"],
    [88, "Exceptional"], [100, "Exceptional"],
  ])("score %i → %s", (score, band) => {
    expect(bandFor(score)).toBe(band);
  });
});
