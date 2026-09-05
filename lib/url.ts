// ── Finding the site inside a sentence ───────────────────────────────
// "redo my website: rzm.com.sa" has to work exactly as well as pasting a full
// https:// URL, because that is how people actually write.
//
// This lives in its own module with NO node imports so the browser and the
// server can share it. They previously had separate rules — the composer
// gated on /https?:\/\// and refused to call the audit for a bare domain,
// while the server could parse one — so a bare host silently skipped the site
// read. One source of truth is the fix.

/** Last labels we treat as a real TLD in a bare (scheme-less) host.
 *  A bare domain is otherwise indistinguishable from a sentence like
 *  "finished.Also" or a filename, so we require a plausible ending.
 *  Anything with an explicit scheme bypasses this entirely. */
const TLDS = new Set([
  // generic
  "com","net","org","io","ai","co","dev","app","xyz","info","biz","me","tv","cc",
  "online","site","store","tech","agency","studio","design","digital","cloud","page","link",
  // gulf + arab world (our market)
  "sa","ae","qa","kw","bh","om","eg","jo","lb","ma","tn","dz","iq","ps","sd","ly","ye",
  // europe
  "de","uk","fr","es","it","nl","se","no","dk","fi","pl","pt","gr","cz","ro","hu","ch","at","be","ie","ua","ru","tr","is",
  // americas + apac + africa
  "us","ca","mx","br","ar","cl","co.uk","au","nz","jp","kr","cn","hk","tw","sg","my","id","th","vn","ph","in","pk","bd","za","ng","ke","gh",
]);

/** File extensions that look like a bare host but are not one ("Node.js"). */
const NOT_A_TLD = new Set([
  "js","jsx","ts","tsx","json","md","html","htm","php","css","scss","sass","png","jpg","jpeg",
  "gif","svg","webp","pdf","zip","csv","txt","xml","yml","yaml","sh","py","rb","go","rs","java",
  "env","lock","toml","ini","sql","log","map","min",
]);

const trailing = (s: string) => s.replace(/[.,;:!?)\]]+$/, "");

/**
 * Pull the first site out of free text. Returns an absolute https URL, or null.
 * Accepts "https://rzm.com.sa/ar/", "rzm.com.sa", "www.rzm.com.sa/ar" and
 * "hyrde.net" alike.
 */
export function findUrl(text: string): string | null {
  // An explicit scheme is unambiguous and always wins.
  const explicit = text.match(/\bhttps?:\/\/[^\s<>"')\]]+/i);
  if (explicit) return trailing(explicit[0]);

  // Otherwise look for host(.host)+ with a believable TLD, plus optional path.
  const re = /\b((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,24})((?:\/[^\s<>"')\]]*)?)/gi;
  for (const m of text.matchAll(re)) {
    const host = m[1].toLowerCase();
    const tld = host.slice(host.lastIndexOf(".") + 1);
    if (NOT_A_TLD.has(tld)) continue;   // "Node.js", "index.php"
    if (!TLDS.has(tld)) continue;       // "finished.Also"
    return `https://${trailing(m[1] + (m[2] ?? ""))}`;
  }
  return null;
}

/** Does this text contain a site worth reading? Used by the composer to decide
 *  whether to run the audit, so it MUST agree with findUrl. */
export function hasUrl(text: string): boolean {
  return findUrl(text) !== null;
}
