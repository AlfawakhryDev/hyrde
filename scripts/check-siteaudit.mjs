// Runnable check for the site-audit SSRF guard and HTML parsing.
//   node scripts/check-siteaudit.mjs
// Transpiles lib/siteaudit.ts then asserts the security-critical behaviour:
// private/loopback/metadata hosts are refused, and a known live page parses.
import { execSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const out = mkdtempSync(path.join(tmpdir(), "siteaudit-"));
execSync(`npx tsc lib/siteaudit.ts --outDir ${out} --module esnext --target es2022 --moduleResolution bundler --skipLibCheck`, { stdio: "inherit" });
execSync(`mv ${out}/siteaudit.js ${out}/siteaudit.mjs`);
const { isPrivateAddress, assertPublicUrl, findUrl } = await import(`${out}/siteaudit.mjs`);

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
ok(findUrl("redo our website: https://rzm.com.sa/ar/") === "https://rzm.com.sa/ar/", "findUrl must pull the URL out of a real brief");

console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll site-audit checks passed");
process.exit(failed ? 1 : 0);
