"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Subscription } from "@/lib/billing";

// Founder console: match Airtm transfers (by reference in the payment note)
// to pending subscriptions and activate them. Activation = 30 days from now;
// confirming again later stacks another 30 days via a fresh request.
export default function AdminClient({
  initialSubs,
  names,
}: {
  initialSubs: Subscription[];
  names: Record<string, string>;
}) {
  const [subs, setSubs] = useState<Subscription[]>(initialSubs);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function setStatus(sub: Subscription, status: "active" | "rejected") {
    setBusy(sub.id); setError("");
    const patch =
      status === "active"
        ? {
            status,
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 864e5).toISOString(),
          }
        : { status };
    const { error } = await supabaseBrowser().from("subscriptions").update(patch).eq("id", sub.id);
    if (error) setError(error.message);
    else setSubs(list => list.map(s => (s.id === sub.id ? { ...s, ...patch } as Subscription : s)));
    setBusy(null);
  }

  const pending = subs.filter(s => s.status === "pending_payment");
  const rest = subs.filter(s => s.status !== "pending_payment");
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—";

  const Row = ({ s, actions }: { s: Subscription; actions: boolean }) => (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 py-4">
      <span className="font-mono text-[13px] text-on-surface w-[130px]">{s.reference}</span>
      <span className="text-[13.5px] font-medium text-on-surface flex-1 min-w-[120px] truncate">{names[s.user_id] ?? "—"}</span>
      <span className="text-[13px] text-on-surface-variant capitalize">{s.tier}</span>
      <span className="text-[13.5px] font-semibold text-on-surface">${(s.amount_cents / 100).toFixed(0)}</span>
      <span className="text-[12.5px] text-on-surface-variant">{fmt(s.created_at)}</span>
      {actions ? (
        <span className="flex gap-2">
          <button
            onClick={() => setStatus(s, "active")}
            disabled={busy !== null}
            className="h-8 px-4 rounded-full bg-emerald-600 text-white text-[12.5px] font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {busy === s.id ? "…" : "Money received — activate"}
          </button>
          <button
            onClick={() => setStatus(s, "rejected")}
            disabled={busy !== null}
            className="h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-error transition disabled:opacity-60"
          >
            Reject
          </button>
        </span>
      ) : (
        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
          s.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-surface-container text-on-surface-variant"
        }`}>
          {s.status === "active" ? `active → ${fmt(s.expires_at)}` : s.status}
        </span>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12">
      <Link href="/dashboard" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
        <span aria-hidden="true">←</span> Back to dashboard
      </Link>
      <h1 className="text-[40px] font-light tracking-[-0.035em] leading-none text-on-surface mt-8 mb-2">Admin — billing</h1>
      <p className="text-[14px] text-on-surface-variant mb-10 max-w-[520px]">
        Match the reference in the Airtm payment note, then activate. Activation grants 30 days.
      </p>

      <h2 className="text-[15px] font-medium text-on-surface mb-2">Awaiting confirmation ({pending.length})</h2>
      <div className="divide-y divide-border-crisp border-y border-border-crisp mb-12">
        {pending.length === 0 && <p className="py-6 text-[13.5px] text-on-surface-variant">Nothing pending.</p>}
        {pending.map(s => <Row key={s.id} s={s} actions />)}
      </div>

      <h2 className="text-[15px] font-medium text-on-surface mb-2">History</h2>
      <div className="divide-y divide-border-crisp border-y border-border-crisp">
        {rest.length === 0 && <p className="py-6 text-[13.5px] text-on-surface-variant">No history yet.</p>}
        {rest.map(s => <Row key={s.id} s={s} actions={false} />)}
      </div>

      {error && <p className="text-[13px] text-error mt-6">{error}</p>}
    </div>
  );
}
