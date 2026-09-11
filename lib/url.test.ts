import { describe, it, expect } from "vitest";
import { findUrl, hasUrl } from "./url";

// "redo my website: rzm.com.sa" has to work as well as a full https:// URL,
// because that is how people actually write.
describe("findUrl", () => {
  it.each([
    ["redo my website: rzm.com.sa", "https://rzm.com.sa"],
    ["see https://rzm.com.sa/ar/.", "https://rzm.com.sa/ar/"],
    ["www.rzm.com.sa/ar is ours", "https://www.rzm.com.sa/ar"],
    ["hyrde.net", "https://hyrde.net"],
  ])("finds the site in %j", (text, url) => {
    expect(findUrl(text)).toBe(url);
  });

  it.each([
    ["I use Node.js every day"],
    ["open index.php first"],
    ["I finished.Also I started"],
    ["no link here at all"],
  ])("does not invent a site from %j", (text) => {
    expect(findUrl(text)).toBeNull();
  });
});

describe("hasUrl", () => {
  it("agrees with findUrl, because the composer gates the site audit on it", () => {
    for (const text of ["rzm.com.sa", "Node.js", "https://x.io", "plain words"]) {
      expect(hasUrl(text)).toBe(findUrl(text) !== null);
    }
  });
});
