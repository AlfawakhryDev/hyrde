// ─── Hyrde Arena domain types (mirrors the Supabase schema) ──────────────────

export interface MountPoint {
  role: string;
  task: string;
  why: string;
  handoff: string;
  xp: number;
  bounty: string;
}

export interface ArenaTask {
  id: string;
  created_at: string;
  title: string;
  brief: string;
  category: string | null;
  origin: "human" | "ai_client";
  // Live enum values: open | agent_attempted | mounted | delivered | closed
  status: string;
  agent_completion: number;
  agent_summary: string | null;
  agent_deliverable: string | null;
  mount_points: string | null; // JSON array of MountPoint
  poster_id: string | null;
  amount_cents: number;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  deliverable_text: string | null;
  deadline: string | null;
  match_reason: string | null;
  match_score: number | null;
  matched_at: string | null;
  // TEXT column (not an enum) — safe for workflow states:
  // unpaid | approved | paid
  payment_status: string;
  ai_review: string | null; // JSON AiReview
}

export interface AiReview {
  verdict: "approve" | "approve_with_notes" | "request_changes";
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  reviewedAt: string;
}

export function parseAiReview(raw: string | null): AiReview | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiReview;
  } catch {
    return null;
  }
}

export interface Profile {
  id: string;
  mode: "client" | "pilot" | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  payout_method: PayoutMethod | null;
  payout_handle: string | null;
}

// ─── Payments (P2P settlement — platform coordinates, money moves on
//     rails both sides already have) ─────────────────────────────────────────

export type PayoutMethod = "airtm" | "instapay" | "vodafone_cash" | "usdt" | "paypal" | "bank";

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  task_id: string;
  payer_id: string;
  payee_id: string;
  amount_cents: number;
  currency: string;
  method: string | null;
  reference: string;
  proof_note: string | null;
  status: "awaiting_payment" | "payment_sent" | "confirmed" | "cancelled" | "disputed";
}

export const PAYOUT_METHODS: Record<PayoutMethod, {
  label: string;
  icon: string;              // material symbol
  placeholder: string;       // for the handle input
  payHint: string;           // instruction shown to the paying client
}> = {
  airtm: {
    label: "Airtm",
    icon: "account_balance_wallet",
    placeholder: "you@email.com (Airtm account email)",
    payHint: "Open Airtm → Send → enter the Pilot's email. Paste the reference code in the note.",
  },
  instapay: {
    label: "InstaPay (Egypt)",
    icon: "bolt",
    placeholder: "name@instapay or mobile number",
    payHint: "Open your banking app → InstaPay → send to the Pilot's IPA. Put the reference code in the transfer note.",
  },
  vodafone_cash: {
    label: "Vodafone Cash",
    icon: "smartphone",
    placeholder: "010XXXXXXXX",
    payHint: "Send via Vodafone Cash to the Pilot's wallet number, then keep the transaction ID.",
  },
  usdt: {
    label: "USDT (TRC-20)",
    icon: "currency_bitcoin",
    placeholder: "TRC-20 wallet address (starts with T…)",
    payHint: "Send USDT on the TRON (TRC-20) network only. Double-check the address — crypto transfers are irreversible.",
  },
  paypal: {
    label: "PayPal",
    icon: "payments",
    placeholder: "you@email.com (PayPal email)",
    payHint: "PayPal → Send money → the Pilot's email. Add the reference code in the note.",
  },
  bank: {
    label: "Bank transfer",
    icon: "account_balance",
    placeholder: "IBAN / account details",
    payHint: "Transfer from your banking app. Put the reference code in the transfer description.",
  },
};

// Human-readable unique reference quoted in the external transfer,
// e.g. HYR-7K2F4M. Unique enough for a settlement note; DB enforces uniqueness.
export function makePaymentReference(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `HYR-${s}`;
}

export const CATEGORIES = [
  "Development",
  "Design",
  "Copywriting",
  "Marketing",
  "Data",
  "Technical writing",
  "Other",
] as const;

export function parseMountPoints(raw: string | null): MountPoint[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function formatAmount(cents: number): string | null {
  if (!cents) return null;
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// Derived task state used across the UI.
export function taskState(t: ArenaTask): {
  label: string;
  tone: "open" | "ai" | "claimed" | "delivered" | "approved" | "paid" | "closed";
} {
  if (t.payment_status === "paid") return { label: "Paid", tone: "paid" };
  if (t.payment_status === "approved") return { label: "Approved", tone: "approved" };
  if (t.status === "delivered") return { label: "Delivered", tone: "delivered" };
  if (t.claimed_by_user_id) return { label: "Matched", tone: "claimed" };
  if (t.status === "closed") return { label: "Closed", tone: "closed" };
  return { label: "Open", tone: "open" };
}
