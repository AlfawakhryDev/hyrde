/**
 * File-based JSON store — works in Next.js API routes and server components.
 *
 * On Vercel the deployment filesystem is READ-ONLY (writes throw EROFS) and the
 * only writable location is /tmp, which is also ephemeral (not shared across
 * instances and wiped on cold starts). So:
 *   - reads prefer a runtime copy, then fall back to the bundled seed data
 *   - writes go to the writable dir and are BEST-EFFORT — they never throw, so a
 *     read-only FS can't crash a request.
 *
 * Durable data (e.g. inbound client leads) is mirrored to an external sink
 * (Google Sheets) elsewhere. For full persistence of all entities, swap this for
 * a real DB (e.g. Supabase / Vercel KV).
 */
import fs from "fs";
import path from "path";

// Bundled, read-only seed data shipped with the deployment.
const SEED_DIR = path.join(process.cwd(), "data");

// Writable location: /tmp on Vercel/serverless, the project data dir in local dev.
const WRITABLE_DIR = process.env.VERCEL ? path.join("/tmp", "hyrde-data") : SEED_DIR;

function ensureWritableDir(): boolean {
  try {
    if (!fs.existsSync(WRITABLE_DIR)) fs.mkdirSync(WRITABLE_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export function readStore<T>(name: string, fallback: T): T {
  // Prefer a runtime-written copy, then the bundled seed, then the fallback.
  for (const dir of [WRITABLE_DIR, SEED_DIR]) {
    const file = path.join(dir, `${name}.json`);
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
      }
    } catch {
      // Corrupt/unreadable — try the next source.
    }
  }
  return fallback;
}

export function writeStore<T>(name: string, data: T): boolean {
  // Best-effort: returns true if persisted, false if the FS rejected the write.
  // Never throws, so a read-only filesystem can't break the request.
  if (!ensureWritableDir()) return false;
  const file = path.join(WRITABLE_DIR, `${name}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.warn(`writeStore("${name}") skipped — filesystem not writable:`, (err as Error).message);
    return false;
  }
}
