import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";

// ─── Daily search-engine bump (IndexNow) ────────────────────────────
// Invoked by the Vercel cron in vercel.json, and callable manually after a
// content deploy with `?scope=all`.
//
// IndexNow is the Bing/Yandex/Seznam/Naver push protocol — one POST tells all
// of them a URL changed. **Google does NOT support IndexNow**, and it retired
// its sitemap ping endpoint in 2023, so there is deliberately no "ping Google"
// here: for Google the levers are the sitemap's lastmod (see app/sitemap.ts)
// plus Search Console. Anyone adding a Google ping below is adding a no-op.
//
// Default mode submits a rotating daily slice rather than all ~234 URLs every
// day: IndexNow is meant for *changed* URLs, and re-blasting an unchanged set
// daily earns nothing. The rotation refreshes the whole site about weekly.

const KEY = "c7e1a94fd02b48b3a6f5e8d19c4b7a25";
const HOST = "hyrde.net";
const SLICE = 40;

function authorized(req: Request): boolean {
  // CRON_SECRET only. Vercel sends `Authorization: Bearer $CRON_SECRET` on
  // scheduled invocations once that env var is set.
  //
  // We deliberately do NOT trust the `x-vercel-cron` header: Vercel does not
  // strip it from inbound requests, so anyone could set it by hand and drive
  // this endpoint (verified against prod — it returned 200). This route has an
  // external side effect (it POSTs our URLs to IndexNow), so it fails closed:
  // no secret configured means nobody, including the cron, can run it.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  // Constant-time-ish compare: bail on length first, then diff every byte.
  if (auth.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const all = sitemap().map(e => String(e.url));
  const scope = new URL(req.url).searchParams.get("scope");

  let urlList: string[];
  if (scope === "all") {
    urlList = all;
  } else {
    // Deterministic daily rotation over the full set.
    const day = Math.floor(Date.now() / 86_400_000);
    const start = (day * SLICE) % all.length;
    urlList = all.length <= SLICE
      ? all
      : [...all, ...all].slice(start, start + SLICE);
  }

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList,
      }),
    });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      submitted: urlList.length,
      total: all.length,
      scope: scope === "all" ? "all" : "daily-slice",
    });
  } catch (e) {
    // Never let a failed ping page anyone — it retries tomorrow.
    return NextResponse.json({ ok: false, error: String(e) }, { status: 200 });
  }
}
