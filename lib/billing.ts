// ── Billing: client subscription tiers, paid via Airtm ───────────────────────
// No card processor is available (Egypt, no Stripe/MoR yet), so payment is a
// P2P Airtm transfer with a reference code; an admin confirms receipt in
// /admin and the subscription activates for 30 days. Task limits are enforced
// by a DB trigger (enforce_task_limit) — the UI only explains them.

export const AIRTM_LINK = "https://airtm.me/alfawakhry";

export type Tier = "free" | "pro" | "scale";

export const TIERS: {
  id: Exclude<Tier, "free">;
  name: string;
  usd: number;
  tasksPerMonth: string;
  blurb: string;
  perks: string[];
}[] = [
  {
    id: "pro",
    name: "Pro",
    usd: 20,
    tasksPerMonth: "50 projects / month",
    blurb: "For teams hiring every week.",
    perks: [
      "50 projects per month",
      "AI matching + AI delivery review",
      "Re-match on demand",
      "Priority email support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    usd: 200,
    tasksPerMonth: "Unlimited projects",
    blurb: "For agencies and heavy pipelines.",
    perks: [
      "Unlimited projects",
      "Everything in Pro",
      "Direct founder line",
      "Early access to new features",
    ],
  },
];

// The first three projects carry no Hyrde fee at all — the client pays the
// specialist and nothing else. Lifetime, not monthly: it is an onboarding
// offer, not an allowance that refills.
//
// The unit is a PROJECT, not a task. A project fans out into one task per
// milestone, so counting tasks meant a five-milestone plan blew a three-task
// cap partway through creating itself — a free client could not post a single
// project. enforce_task_limit() counts distinct project_id (plus standalone
// tasks) and is the real enforcement; everything here only explains it.
export const FREE_PROJECTS = 3;

export type Subscription = {
  id: string;
  user_id: string;
  tier: "pro" | "scale";
  status: "pending_payment" | "active" | "expired" | "rejected";
  reference: string;
  amount_cents: number;
  method: string;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export function newReference(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `HYR-SUB-${s}`;
}

export function activeSub(subs: Subscription[]): Subscription | null {
  const now = Date.now();
  return (
    subs.find(s => s.status === "active" && s.expires_at && new Date(s.expires_at).getTime() > now) ?? null
  );
}

export function pendingSub(subs: Subscription[]): Subscription | null {
  return subs.find(s => s.status === "pending_payment") ?? null;
}

// The DB trigger raises 'TASK_LIMIT|<tier>|<limit>' when the cap is hit —
// lifetime on free, per month on paid.
export function parseTaskLimitError(message: string): { tier: string; limit: number } | null {
  const m = message.match(/TASK_LIMIT\|(\w+)\|(\d+)/);
  return m ? { tier: m[1], limit: Number(m[2]) } : null;
}
