import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// ─── Google Form ("Contact Information") field mapping ──────────────────────────
// Client signups are forwarded here so each lead lands as a row in the linked
// Google Sheet. The form now has a dedicated column per field (email collection
// is set to "Do not collect", so anonymous POSTs succeed). The durable source of
// truth remains data/leads.json below in case the network forward ever fails.
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSf4Q4-EK8-z4aZk6GFTZpcEeW6fsQ-Rqv45PTwZD3JqaN3wbQ/formResponse";

const FIELD = {
  name:             "entry.2005620554",
  email:            "entry.1045781291",
  country:          "entry.1065046570",
  phone:            "entry.1166974658",
  comments:         "entry.839337160",
  company:          "entry.1864631983",
  website:          "entry.1155140852",
  postingsPerMonth: "entry.547560551",
  startTiming:      "entry.1462316813",
  rolesNeeded:      "entry.1099500524",
};

// Inbound CLIENT lead (companies looking to hire talent).
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  country: string;
  postingsPerMonth: string;
  startTiming: string;
  rolesNeeded: string;
  createdAt: string;
  forwardedToGoogle: boolean;
}

async function forwardToGoogle(lead: Lead): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.set(FIELD.name, lead.name);
    params.set(FIELD.email, lead.email);
    params.set(FIELD.country, lead.country || "Not specified");
    params.set(FIELD.phone, lead.phone);
    params.set(FIELD.company, lead.company);
    if (lead.website)     params.set(FIELD.website, lead.website);
    params.set(FIELD.postingsPerMonth, lead.postingsPerMonth);
    params.set(FIELD.startTiming, lead.startTiming);
    if (lead.rolesNeeded) params.set(FIELD.rolesNeeded, lead.rolesNeeded);
    params.set("fvv", "1");
    params.set("pageHistory", "0");

    const res = await fetch(GOOGLE_FORM_ACTION, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Cloudflare Turnstile (anti-spam) verification ──────────────────────────
// When TURNSTILE_SECRET_KEY is set, submissions must carry a valid token. If the
// secret isn't configured yet, we fail OPEN (allow) so the form keeps working;
// once you add the key in Vercel, protection is enforced automatically.
async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping captcha verification.");
    return true;
  }
  if (!token) return false;
  try {
    const params = new URLSearchParams();
    params.set("secret", secret);
    params.set("response", token);
    if (ip) params.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // Network error reaching Cloudflare — don't block a genuine lead.
    console.warn("Turnstile verify request failed — allowing submission.");
    return true;
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name             = String(body.name             ?? "").trim();
  const email            = String(body.email            ?? "").trim();
  const phone            = String(body.phone            ?? "").trim();
  const company          = String(body.company          ?? "").trim();
  const postingsPerMonth = String(body.postingsPerMonth ?? "").trim();
  const startTiming      = String(body.startTiming      ?? "").trim();

  // Required for inbound client qualification
  if (!name || !email || !phone || !company || !postingsPerMonth || !startTiming) {
    return NextResponse.json(
      { error: "Name, work email, phone, company, monthly postings, and start timing are required." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid work email address." }, { status: 400 });
  }

  // Anti-spam: verify the Cloudflare Turnstile token before accepting the lead.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
  const captchaOk = await verifyTurnstile(String(body.turnstileToken ?? ""), ip);
  if (!captchaOk) {
    return NextResponse.json(
      { error: "Anti-spam check failed. Please reload the page and try again." },
      { status: 400 },
    );
  }

  const lead: Lead = {
    id: `lead_${Date.now()}`,
    name, email, phone, company, postingsPerMonth, startTiming,
    website:     String(body.website     ?? "").trim(),
    country:     String(body.country     ?? "").trim(),
    rolesNeeded: String(body.rolesNeeded ?? "").trim(),
    createdAt: new Date().toISOString(),
    forwardedToGoogle: false,
  };

  // Best-effort forward to Google Form (auto-works once the form restriction is lifted)
  lead.forwardedToGoogle = await forwardToGoogle(lead);

  // Durable local store — the source of truth for inbound client leads
  let stored = false;
  try {
    const leads = readStore<Lead[]>("leads", []);
    leads.unshift(lead);
    writeStore("leads", leads.slice(0, 5000));
    stored = true;
  } catch {
    stored = false;
  }

  // Only fail if BOTH sinks failed (e.g. read-only FS + restricted form)
  if (!stored && !lead.forwardedToGoogle) {
    return NextResponse.json({ error: "We couldn't save your details. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: lead.id });
}

// Lightweight admin read. Always returns the count; full lead data only when
// ?key=<LEADS_ADMIN_KEY env> matches, so leads aren't exposed publicly.
export async function GET(req: NextRequest) {
  const leads = readStore<Lead[]>("leads", []);
  const key = req.nextUrl.searchParams.get("key");
  const adminKey = process.env.LEADS_ADMIN_KEY;
  if (adminKey && key === adminKey) {
    return NextResponse.json({ count: leads.length, leads });
  }
  return NextResponse.json({ count: leads.length });
}
