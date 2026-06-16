import { NextRequest, NextResponse } from "next/server";
import { readStore, writeStore } from "@/lib/store";

export const dynamic = "force-dynamic";

// ─── Google Form ("Freelancer signups") field mapping ───────────────────────
// GTM funnel: freelancers sign up first; some refer companies that are hiring,
// which seeds the client side of the marketplace. Each signup is forwarded to
// the freelancer Google Form so it lands as a row in the linked Google Sheet.
// The form uses the default "Contact information" template (5 generic columns),
// so freelancer-specific attributes are packed into the Comments column with
// clear labels. The durable source of truth remains data/freelancer-leads.json.
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSdJyaSbE9ZhrDWAenKCMBxzDNz1sPKxo3WWSxPRpTRZnoYAug/formResponse";

const FIELD = {
  name:     "entry.2005620554",
  email:    "entry.1045781291",
  address:  "entry.1065046570", // Address (required on the form) — we send location here
  phone:    "entry.1166974658",
  comments: "entry.839337160",
};

// Inbound FREELANCER lead (talent signing up to the marketplace).
export interface FreelancerLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  skill: string;
  experience: string;
  portfolio: string;
  knowsClients: string; // GTM referral — companies they know that are hiring
  createdAt: string;
  forwardedToGoogle: boolean;
}

// Pack freelancer-specific attributes into the single Comments column.
function buildComments(lead: FreelancerLead): string {
  const lines: string[] = [];
  if (lead.skill)        lines.push(`Primary skill: ${lead.skill}`);
  if (lead.experience)   lines.push(`Experience: ${lead.experience}`);
  if (lead.portfolio)    lines.push(`Portfolio/LinkedIn: ${lead.portfolio}`);
  if (lead.knowsClients) lines.push(`Companies hiring (referral): ${lead.knowsClients}`);
  return lines.join("\n");
}

async function forwardToGoogle(lead: FreelancerLead): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.set(FIELD.name, lead.name);
    params.set(FIELD.email, lead.email);
    params.set(FIELD.address, lead.location || "Not specified");
    if (lead.phone) params.set(FIELD.phone, lead.phone);
    const comments = buildComments(lead);
    if (comments) params.set(FIELD.comments, comments);
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
// Mirrors the client lead route: if TURNSTILE_SECRET_KEY isn't set we fail OPEN
// so the form keeps working; once the key is in Vercel, protection is enforced.
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

  const name  = String(body.name  ?? "").trim();
  const email = String(body.email ?? "").trim();
  const skill = String(body.skill ?? "").trim();

  // Keep the funnel fast: only name, email, and primary skill are required.
  if (!name || !email || !skill) {
    return NextResponse.json(
      { error: "Name, email, and your main skill are required." },
      { status: 400 },
    );
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
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

  const lead: FreelancerLead = {
    id: `flead_${Date.now()}`,
    name, email, skill,
    phone:        String(body.phone        ?? "").trim(),
    location:     String(body.location     ?? "").trim(),
    experience:   String(body.experience   ?? "").trim(),
    portfolio:    String(body.portfolio    ?? "").trim(),
    knowsClients: String(body.knowsClients ?? "").trim(),
    createdAt: new Date().toISOString(),
    forwardedToGoogle: false,
  };

  // Best-effort forward to the freelancer Google Form / Sheet.
  lead.forwardedToGoogle = await forwardToGoogle(lead);

  // Durable local store — the source of truth for inbound freelancer leads.
  let stored = false;
  try {
    const leads = readStore<FreelancerLead[]>("freelancer-leads", []);
    leads.unshift(lead);
    writeStore("freelancer-leads", leads.slice(0, 5000));
    stored = true;
  } catch {
    stored = false;
  }

  // Only fail if BOTH sinks failed.
  if (!stored && !lead.forwardedToGoogle) {
    return NextResponse.json({ error: "We couldn't save your details. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: lead.id });
}

// Lightweight admin read. Always returns the count; full data only when
// ?key=<LEADS_ADMIN_KEY env> matches, so leads aren't exposed publicly.
export async function GET(req: NextRequest) {
  const leads = readStore<FreelancerLead[]>("freelancer-leads", []);
  const key = req.nextUrl.searchParams.get("key");
  const adminKey = process.env.LEADS_ADMIN_KEY;
  if (adminKey && key === adminKey) {
    return NextResponse.json({ count: leads.length, leads });
  }
  return NextResponse.json({ count: leads.length });
}
