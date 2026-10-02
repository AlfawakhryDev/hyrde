import { describe, it, expect } from "vitest";
import { tolerateForeignDomEdits } from "./dom-guard";

// A minimal DOM with the real DOM's rules: both methods throw NotFoundError when
// the node they're given is not a direct child.
class El {
  parentNode: El | null = null;
  childNodes: El[] = [];
  constructor(public name: string) {}
  removeChild<T extends El>(child: T): T {
    const i = this.childNodes.indexOf(child);
    if (i < 0) throw new Error("NotFoundError");
    this.childNodes.splice(i, 1);
    child.parentNode = null;
    return child;
  }
  insertBefore<T extends El>(node: T, ref: El | null): T {
    if (ref && ref.parentNode !== this) throw new Error("NotFoundError");
    node.parentNode?.removeChild(node);
    this.childNodes.splice(ref ? this.childNodes.indexOf(ref) : this.childNodes.length, 0, node);
    node.parentNode = this;
    return node;
  }
}
tolerateForeignDomEdits(El.prototype as unknown as Node);

const names = (el: El) => el.childNodes.map(c => c.name);
// What Google Translate does: the text node is replaced by <font> holding new text.
function translate(parent: El, text: El) {
  const font = new El("font");
  parent.insertBefore(font, text);
  parent.removeChild(text);
  font.insertBefore(new El("translated"), null);
  return font;
}

describe("tolerateForeignDomEdits", () => {
  it("leaves ordinary DOM operations exactly as they were", () => {
    const div = new El("div"), a = new El("a"), b = new El("b"), c = new El("c");
    div.insertBefore(a, null); div.insertBefore(b, null); div.insertBefore(c, b);
    expect(names(div)).toEqual(["a", "c", "b"]);
    div.removeChild(a);
    expect(names(div)).toEqual(["c", "b"]);
  });

  it("does not throw when React removes a text node the translator replaced", () => {
    const div = new El("div"), text = new El("text");
    div.insertBefore(text, null);
    translate(div, text);
    expect(() => div.removeChild(text)).not.toThrow();
    expect(names(div)).toEqual(["font"]);
  });

  it("removes a node the translator moved into a wrapper", () => {
    const div = new El("div"), font = new El("font"), text = new El("text");
    div.insertBefore(font, null); font.insertBefore(text, null);
    div.removeChild(text);
    expect(text.parentNode).toBeNull();
    expect(font.childNodes).toEqual([]);
  });

  it("inserts before the translator's wrapper when the reference node is inside it", () => {
    const div = new El("div"), font = new El("font"), text = new El("text"), fresh = new El("fresh");
    div.insertBefore(font, null); font.insertBefore(text, null);
    div.insertBefore(fresh, text);
    expect(names(div)).toEqual(["fresh", "font"]);
  });

  it("appends when the reference node is gone altogether", () => {
    const div = new El("div"), a = new El("a"), text = new El("text"), fresh = new El("fresh");
    div.insertBefore(a, null); div.insertBefore(text, null);
    translate(div, text);
    div.insertBefore(fresh, text);
    expect(names(div)).toEqual(["a", "font", "fresh"]);
  });

  it("installs once, however many times it is called", () => {
    const before = El.prototype.removeChild;
    tolerateForeignDomEdits(El.prototype as unknown as Node);
    expect(El.prototype.removeChild).toBe(before);
  });
});
