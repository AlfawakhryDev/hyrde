// Runnable check for the site-audit SSRF guard and HTML parsing.
//   node scripts/check-siteaudit.mjs
// Transpiles lib/siteaudit.ts then asserts the security-critical behaviour:
// private/loopback/metadata hosts are refused, and a known live page parses.
import { execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const out = mkdtempSync(path.join(tmpdir(), "siteaudit-"));
execSync(`npx tsc lib/url.ts lib/siteaudit.ts --outDir ${out} --module esnext --target es2022 --moduleResolution bundler --skipLibCheck`, { stdio: "inherit" });
execSync(`mv ${out}/siteaudit.js ${out}/siteaudit.mjs && mv ${out}/url.js ${out}/url.mjs`);
execSync(`sed -i '' 's|from "./url"|from "./url.mjs"|' ${out}/siteaudit.mjs`);
const { isPrivateAddress, assertPublicUrl } = await import(`${out}/siteaudit.mjs`);
const { findUrl, hasUrl } = await import(`${out}/url.mjs`);

let failed = 0;
const ok = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); failed++; } };

for (const ip of ["127.0.0.1", "10.0.0.5", "172.16.3.9", "192.168.1.1", "169.254.169.254", "::1", "::ffff:10.0.0.1", "100.64.0.1"]) {
  ok(isPrivateAddress(ip), `${ip} must be treated as private`);
}
for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700::1111"]) {
  ok(!isPrivateAddress(ip), `${ip} must be treated as public`);
}
for (const bad of ["http://localhost/x", "https://127.0.0.1/", "file:///etc/passwd", "ftp://a.com", "http://169.254.169.254/latest/meta-data/"]) {
  let blocked = false;
  try { await assertPublicUrl(bad); } catch { blocked = true; }
  ok(blocked, `${bad} must be refused`);
}
// URL detection. A bare domain has to work as well as a pasted https URL:
// people write "redo my website: rzm.com.sa", and the composer used to skip
// the site read entirely for anything without a scheme.
const finds = [
  ["redo our website: https://rzm.com.sa/ar/", "https://rzm.com.sa/ar/"],
  ["redo my website: rzm.com.sa",              "https://rzm.com.sa"],
  ["redo my website: rzm.com.sa/ar",           "https://rzm.com.sa/ar"],
  ["can you rebuild hyrde.net please",         "https://hyrde.net"],
  ["our site is www.example.com",              "https://www.example.com"],
  ["redesign example.com.",                    "https://example.com"],
  ["shop at mystore.co.uk",                    "https://mystore.co.uk"],
];
for (const [text, expected] of finds) {
  ok(findUrl(text) === expected, `findUrl(${JSON.stringify(text)}) should be ${expected}, got ${findUrl(text)}`);
}
// And it must not invent one out of ordinary prose or filenames.
for (const text of [
  "I need an MVP for a habit tracker",
  "we use Node.js and index.php",
  "finished the brief.Also we need copy",
  "bump to v1.2.3 please",
  "e.g. a landing page",
]) {
  ok(findUrl(text) === null, `findUrl(${JSON.stringify(text)}) should find nothing, got ${findUrl(text)}`);
}
// The composer's gate and the server's parser must never disagree — that
// drift is exactly what broke bare domains.
for (const text of ["redo my website: rzm.com.sa", "hyrde.net", "an MVP", "Node.js work"]) {
  ok(hasUrl(text) === (findUrl(text) !== null), `hasUrl disagrees with findUrl on ${JSON.stringify(text)}`);
}

console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll site-audit checks passed");
process.exit(failed ? 1 : 0);
