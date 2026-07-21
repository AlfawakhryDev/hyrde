"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  AIRTM_LINK, TIERS, FREE_TASKS_PER_MONTH, newReference, activeSub, pendingSub,
  type Subscription,
} from "@/lib/billing";

// Airtm has no webhooks — the flow is: pick a tier → get a reference code →
// pay the Airtm link with the code in the note → founder confirms in /admin →
// subscription activates for 30 days. This page drives the client half.
export default function BillingClient({
  userId,
  initialSubs,
}: {
  userId: string;
  initialSubs: Subscription[];
}) {
  const [subs, setSubs] = useState<Subscription[]>(initialSubs);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const active = activeSub(subs);
  const pending = pendingSub(subs);

  async function startUpgrade(tierId: "pro" | "scale") {
    setBusy(tierId); setError("");
    const tier = TIERS.find(t => t.id === tierId)!;
    const { data, error } = await supabaseBrowser()
      .from("subscriptions")
      .insert({
        user_id: userId,
        tier: tierId,
        status: "pending_payment",
        reference: newReference(),
        amount_cents: tier.usd * 100,
        method: "airtm",
      })
      .select()
      .single();
    if (error) setError(error.message);
    else setSubs(s => [data as Subscription, ...s]);
    setBusy(null);
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="mx-auto max-w-[880px] px-5 md:px-8 py-12">
      <Link href="/dashboard" className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
        <span aria-hidden="true">←</span> Back to dashboard
      </Link>

      <h1 className="text-[40px] md:text-[48px] font-light tracking-[-0.035em] leading-none text-on-surface mt-8">
        Plans &amp; billing
      </h1>
      <p className="text-[14px] text-on-surface-variant mt-3 max-w-[520px]">
        Free gets you {FREE_TASKS_PER_MONTH}{" "}task posts a month. Upgrade when you&apos;re hiring for real.
        The AI matching works the same on every plan.
      </p>

      {/* Current state */}
      {(active || pending) && (
        <div className="border-y border-border-crisp divide-y divide-border-crisp mt-8">
          {active && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                <span className="font-medium capitalize">{active.tier} is active</span>{" "}
                <span className="text-on-surface-variant">
                 . Until {active.expires_at ? fmtDate(active.expires_at) : "—"}. Renew any time by paying the same way; days stack.
                </span>
              </p>
            </div>
          )}
          {pending && (
            <div className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[13.5px] text-on-surface flex-1 min-w-[240px]">
                <span className="font-medium capitalize">{pending.tier}. Awaiting your payment.</span>{" "}
                <span className="text-on-surface-variant">
                  Reference <strong className="font-mono text-on-surface">{pending.reference}</strong>. We activate it as soon as the transfer lands (usually within a few hours).
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tier cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-10">
        {TIERS.map(t => {
          const isCurrent = active?.tier === t.id;
          const isPending = pending?.tier === t.id;
          return (
            <div key={t.id} className={`rounded-2xl border p-7 flex flex-col ${
              t.id === "pro" ? "border-electric-violet/40 bg-electric-violet/[0.03]" : "border-border-crisp"
            }`}>
              <div className="flex items-baseline justify-between mb-1">
                <h2 className="text-[19px] font-semibold text-on-surface">{t.name}</h2>
                <p className="text-[26px] font-semibold tracking-[-0.02em] text-on-surface">
                  ${t.usd}<span className="text-[13px] font-normal text-on-surface-variant">/mo</span>
                </p>
              </div>
              <p className="text-[13px] text-on-surface-variant mb-5">{t.blurb}</p>
              <ul className="space-y-2.5 mb-7">
                {t.perks.map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-[13.5px] text-on-surface">
                    <span className="text-emerald-500 font-bold mt-px" aria-hidden="true">✓</span>{p}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => startUpgrade(t.id)}
                disabled={busy !== null || isCurrent || isPending}
                className={`mt-auto h-11 rounded-full text-sm font-medium transition disabled:opacity-60 ${
                  t.id === "pro"
                    ? "bg-on-surface text-inverse-on-surface hover:opacity-90"
                    : "border border-border-crisp text-on-surface hover:bg-surface-container"
                }`}
              >
                {isCurrent ? "Current plan" : isPending ? "Awaiting payment" : busy === t.id ? "One moment…" : `Get ${t.name}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment instructions — appear once a request exists */}
      {pending && (
        <div className="rounded-2xl bg-surface-container-low p-7 mt-8">
          <h3 className="text-[17px] font-semibold text-on-surface mb-4">How to pay. 2 minutes</h3>
          <ol className="space-y-3.5">
            {[
              <>Open <a href={AIRTM_LINK} target="_blank" rel="noopener noreferrer" className="font-medium text-electric-violet hover:opacity-80">airtm.me/alfawakhry</a>. Pay by bank transfer, card, stablecoins, or 500+ wallets.</>,
              <>Send <strong className="text-on-surface">${(pending.amount_cents / 100).toFixed(0)} USD</strong> and put{" "}
                <strong className="font-mono text-on-surface">{pending.reference}</strong> in the payment note.</>,
              <>Done. We confirm receipt and your plan activates. You&apos;ll see it here and on your dashboard.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-3.5 items-start text-[14px] text-on-surface-variant leading-relaxed">
                <span className="w-6 h-6 shrink-0 rounded-full bg-electric-violet/10 text-electric-violet text-xs font-semibold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-[12px] text-on-surface-variant mt-5">
            Sent it already? Sit tight. Activation is manual-confirmed for now and usually lands within a few hours.
          </p>
        </div>
      )}

      {error && <p className="text-[13px] text-error mt-6">{error}</p>}

      <p className="text-[12.5px] text-on-surface-variant mt-10">
        Freelancers never pay. They keep 100% of what clients pay them. Plans only change how much you can post.
      </p>
    </div>
  );
}
