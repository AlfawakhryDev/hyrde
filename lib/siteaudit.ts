// ─── On-the-fly site audit ──────────────────────────────────────────
// When a client pastes a URL ("redo our website: https://rzm.com.sa/ar/"),
// we fetch the page server-side and pull out the facts that actually change
// the milestone plan: what it's built on, what language/direction it's in,
// how big it is, and which obvious gaps exist. The scoping model gets these
// as hard facts instead of guessing from one sentence.
//
// SECURITY: the URL comes from a user, so this is an SSRF surface. Every
// fetch goes through assertPublicUrl(), which rejects non-http(s) schemes and
// any host resolving to a private/loopback/link-local address (including the
// cloud metadata endpoint). Redirects are followed manually so each hop is
// re-checked; a redirect to 169.254.169.254 would otherwise walk right past
// a check done only on the original URL.
import { lookup } from "node:dns/promises";
import net from "node:net";

export interface SiteContext {
  url: string;              // final URL after redirects
  requestedUrl: string;
  ok: boolean;
  status: number;
  title: string;
  description: string;
  lang: string;
  dir: string;              // "rtl" | "ltr" | ""
  platform: string;         // "WordPress 7.1", "Shopify", ...
  theme: string;
  headings: string[];
  languages: string[];      // hreflang codes found
  internalLinks: number;    // rough size signal
  images: number;
  bytes: number;
  findings: string[];       // plain-language gaps worth a milestone
}

const MAX_BYTES = 1_500_000;
const TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;

/** True for loopback/private/link-local/CGNAT ranges we must never fetch. */
export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;   // link-local + cloud metadata
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }
  if (net.isIPv6(ip)) {
    const s = ip.toLowerCase();
    if (s === "::1" || s === "::") return true;
    if (s.startsWith("fe80") || s.startsWith("fc") || s.startsWith("fd")) return true;
    // IPv4-mapped (::ffff:10.0.0.1) — unwrap and re-check.
    const m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (m) return isPrivateAddress(m[1]);
    return false;
  }
  return true; // unparseable: refuse
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http and https URLs can be read.");
  }
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (/^(localhost|.*\.local|.*\.internal)$/i.test(host)) {
    throw new Error("That host isn't reachable from here.");
  }
  // Resolve and check every address the host maps to.
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new Error("We couldn't resolve that domain.");
  }
  if (!addrs.length || addrs.some(a => isPrivateAddress(a.address))) {
    throw new Error("That host isn't reachable from here.");
  }
  return u;
}

/** Fetch following redirects manually, re-validating each hop. */
async function safeFetch(start: string): Promise<{ res: Response; finalUrl: string }> {
  let current = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const u = await assertPublicUrl(current);
    const res = await fetch(u.toString(), {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        // Identify ourselves honestly; some sites block unknown agents.
        "User-Agent": "Mozilla/5.0 (compatible; HyrdeBot/1.0; +https://hyrde.net)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { res, finalUrl: u.toString() };
      current = new URL(loc, u).toString();
      continue;
    }
    return { res, finalUrl: u.toString() };
  }
  throw new Error("That URL redirected too many times.");
}

const strip = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const attr = (html: string, re: RegExp) => (html.match(re)?.[1] ?? "").trim();

export function extractContext(html: string, finalUrl: string, requestedUrl: string, status: number, bytes: number): SiteContext {
  const htmlTag = html.match(/<html[^>]*>/i)?.[0] ?? "";
  const lang = attr(htmlTag, /lang=["']([^"']+)["']/i);
  const dir  = attr(htmlTag, /dir=["']([^"']+)["']/i);
  const title = strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").slice(0, 200);
  const description = attr(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i).slice(0, 300);

  // Platform / CMS fingerprints. A page can declare several <meta generator>
  // tags and themes often list themselves FIRST (rzm.com.sa emits "Mharty
  // 7.0.0" before "WordPress 7.1"), so pick the generator that names a real
  // CMS rather than whichever came first — the CMS is the fact that decides
  // how a rebuild is actually done.
  const generators = [...html.matchAll(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']*)["']/gi)]
    .map(m => m[1].trim()).filter(Boolean);
  const CMS = /(wordpress|shopify|wix|squarespace|drupal|joomla|webflow|ghost|hubspot|magento|prestashop|typo3)/i;
  let platform = generators.find(g => CMS.test(g)) ?? "";
  if (!platform) {
    if (/wp-content|wp-includes/i.test(html)) platform = "WordPress";
    else if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) platform = "Shopify";
    else if (/static\.parastorage\.com|wix\.com/i.test(html)) platform = "Wix";
    else if (/squarespace/i.test(html)) platform = "Squarespace";
    else if (/_next\/static/i.test(html)) platform = "Next.js";
    else if (/webflow/i.test(html)) platform = "Webflow";
    else platform = generators[0] ?? "";
  }
  // Any non-CMS generators are usually the theme/builder — worth surfacing.
  const builder = generators.find(g => g !== platform && !CMS.test(g)) ?? "";
  // WordPress theme name, when present in asset paths.
  const theme = attr(html, /wp-content\/themes\/([A-Za-z0-9_-]+)/i);

  const headings = [...html.matchAll(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi)]
    .map(m => strip(m[1])).filter(Boolean).slice(0, 12);

  const languages = [...new Set(
    [...html.matchAll(/hreflang=["']([^"']+)["']/gi)].map(m => m[1].toLowerCase()),
  )].slice(0, 12);

  let host = "";
  try { host = new URL(finalUrl).hostname; } catch { /* ignore */ }
  const internalLinks = new Set(
    [...html.matchAll(/href=["']([^"'#?]+)/gi)]
      .map(m => m[1])
      .filter(h => h.startsWith("/") || (host && h.includes(host)))
      .map(h => h.replace(/\/$/, "")),
  ).size;
  const images = [...html.matchAll(/<img\b/gi)].length;

  // Gaps that legitimately deserve a milestone or a line in the brief.
  const findings: string[] = [];
  if (!description) findings.push("No meta description on the page, so search and social previews are unset.");
  if (/wordpress/i.test(platform) && (theme || builder)) findings.push(`Built on WordPress with the "${builder || theme}" theme, so a rebuild means either re-theming or migrating off it.`);
  if (dir.toLowerCase() === "rtl" || /^ar/i.test(lang)) findings.push("The site is right-to-left Arabic, so layout, typography and any new components have to be RTL-correct.");
  if (languages.length > 1) findings.push(`Multiple language versions are declared (${languages.join(", ")}), so the rebuild has to preserve every locale.`);
  if (internalLinks > 60) findings.push(`Roughly ${internalLinks} internal links, so this is a multi-page site rather than a single landing page.`);
  if (bytes > 400_000) findings.push(`The homepage HTML alone is about ${Math.round(bytes / 1024)} KB, which points at a page-weight and performance problem.`);

  return {
    url: finalUrl, requestedUrl, ok: status >= 200 && status < 400, status,
    title, description, lang, dir, platform, theme, headings, languages,
    internalLinks, images, bytes, findings,
  };
}

/** Extract the first http(s) URL in a free-text brief. */
export function findUrl(text: string): string | null {
  const m = text.match(/\bhttps?:\/\/[^\s<>"')]+/i);
  if (m) return m[0].replace(/[.,;:]+$/, "");
  // Also catch a bare domain like "rzm.com.sa/ar" typed without a scheme.
  const bare = text.match(/\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+){1,3}\.[a-z]{2,}(?:\/[^\s<>"')]*)?/i);
  return bare ? `https://${bare[0].replace(/[.,;:]+$/, "")}` : null;
}

export async function auditSite(rawUrl: string): Promise<SiteContext> {
  const { res, finalUrl } = await safeFetch(rawUrl);
  const reader = res.body?.getReader();
  let received = 0;
  const chunks: Uint8Array[] = [];
  if (reader) {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.length;
      chunks.push(value);
      if (received > MAX_BYTES) { await reader.cancel(); break; }
    }
  }
  const html = new TextDecoder("utf-8").decode(
    chunks.length === 1 ? chunks[0] : Buffer.concat(chunks.map(c => Buffer.from(c))),
  );
  return extractContext(html, finalUrl, rawUrl, res.status, received);
}

/** Compact facts for the scoping prompt. */
export function contextToFacts(c: SiteContext): string[] {
  const f: string[] = [`The site to work on is ${c.url}${c.title ? ` ("${c.title}")` : ""}.`];
  if (c.platform) f.push(`It is built on ${c.platform}${c.theme ? ` using the "${c.theme}" theme` : ""}.`);
  if (c.lang || c.dir) f.push(`Its markup declares lang="${c.lang || "unset"}"${c.dir ? ` and dir="${c.dir}"` : ""}.`);
  if (c.internalLinks) f.push(`It exposes roughly ${c.internalLinks} distinct internal links.`);
  if (c.headings.length) f.push(`Visible headings include: ${c.headings.slice(0, 6).join(" | ")}.`);
  return [...f, ...c.findings];
}
