// ── Surviving browser page translation ─────────────────────────────────────
// Chrome, the Google app and Safari translate a page by swapping its text nodes
// for <font> elements that React knows nothing about. The next time React
// removes a text node, or inserts next to one, the node is no longer where it
// left it: the DOM throws NotFoundError and the whole page falls over to the
// error screen. On the homepage the animated demos trigger it within seconds of
// translating, with no click at all. See facebook/react#11538.
//
// Both methods keep their normal behaviour and only change in that one case,
// where they used to throw:
//   removeChild   a node that has been moved is removed from wherever it now
//                 is; a node already detached is left alone.
//   insertBefore  a reference node wrapped by the translator is replaced by its
//                 wrapper, so the new node still lands in the right place.
const GUARDED = Symbol.for("hyrde.domGuard");

type Guardable = Node & { [GUARDED]?: true };

export function tolerateForeignDomEdits(proto: Guardable = Node.prototype): void {
  if (proto[GUARDED]) return;
  proto[GUARDED] = true;

  const removeChild = proto.removeChild;
  proto.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode === this) return removeChild.call(this, child) as T;
    child.parentNode?.removeChild(child);
    return child;
  };

  const insertBefore = proto.insertBefore;
  proto.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    let anchor = ref;
    while (anchor && anchor.parentNode !== this) anchor = anchor.parentNode;
    return insertBefore.call(this, node, anchor) as T;
  };
}
