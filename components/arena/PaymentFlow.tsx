"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  type ArenaTask, type Payment, type PayoutMethod,
  PAYOUT_METHODS, makePaymentReference, formatAmount,
} from "@/lib/arena";

// ─── P2P settlement flow ──────────────────────────────────────────────────────
// Client (payer) → creates a payment with a unique reference, pays on the
// Pilot's rail (Airtm / InstaPay / Vodafone Cash / USDT / PayPal / bank),
// marks it sent. Pilot (payee) → confirms receipt. Task flips to paid.
// Realtime keeps both sides in sync.

export default function PaymentFlow({
  task,
  userId,
  isOwner,
  isMyClaim,
  onPaid,
}: {
  task: ArenaTask;
  userId: string;
  isOwner: boolean;
  isMyClaim: boolean;
  onPaid: () => void;
}) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [payee, setPayee] = useState<{ display_name: string | null; payout_method: PayoutMethod | null; payout_handle: string | null } | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [proofInput, setProofInput] = useState("");

  const pilotId = task.claimed_by_user_id;

  const refetch = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data: pay } = await supabase
      .from("payments")
      .select("*")
      .eq("task_id", task.id)
      .not("status", "in", '("cancelled")')
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setPayment((pay as Payment) ?? null);

    if (pilotId) {
      // Payout handle is not world-readable; this RPC returns it only to the
      // task's poster or matched freelancer (server-enforced).
      const { data: prof } = await supabase.rpc("get_payout_for_task", { p_task_id: task.id });
      setPayee((prof as typeof payee) ?? null);
    }
    setLoaded(true);
  }, [task.id, pilotId]);

  useEffect(() => {
    refetch();
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`payments-${task.id}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `task_id=eq.${task.id}` },
        () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [task.id, refetch]);

  // ── Actions ────────────────────────────────────────────────────────────────
  async function createPayment() {
    if (!pilotId) return;
    const cents = task.amount_cents > 0
      ? task.amount_cents
      : Math.round(parseFloat(amountInput || "0") * 100);
    if (!cents || cents <= 0) { setError("Enter the amount you agreed to pay."); return; }
    setBusy(true); setError("");
    const { error } = await supabaseBrowser().from("payments").insert({
      task_id: task.id,
      payer_id: userId,
      payee_id: pilotId,
      amount_cents: cents,
      currency: "USD",
      method: payee?.payout_method ?? null,
      reference: makePaymentReference(),
    });
    if (error) setError(error.message);
    await refetch();
    setBusy(false);
  }

  async function markSent() {
    if (!payment) return;
    setBusy(true); setError("");
    const { error } = await supabaseBrowser()
      .from("payments")
      .update({ status: "payment_sent", proof_note: proofInput.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    if (error) setError(error.message);
    await refetch();
    setBusy(false);
  }

  async function cancelPayment() {
    if (!payment) return;
    setBusy(true); setError("");
    await supabaseBrowser()
      .from("payments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    await refetch();
    setBusy(false);
  }

  async function confirmReceived() {
    if (!payment) return;
    setBusy(true); setError("");
    const supabase = supabaseBrowser();
    const { error: pErr } = await supabase
      .from("payments")
      .update({ status: "confirmed", updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    if (pErr) { setError(pErr.message); setBusy(false); return; }
    await supabase.from("tasks").update({ payment_status: "paid" }).eq("id", task.id);
    await refetch();
    onPaid();
    setBusy(false);
  }

  async function disputePayment() {
    if (!payment) return;
    setBusy(true);
    await supabaseBrowser()
      .from("payments")
      .update({ status: "disputed", updated_at: new Date().toISOString() })
      .eq("id", payment.id);
    await refetch();
    setBusy(false);
  }

  if (!loaded || !pilotId) return null;

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <section className="pt-10 mt-10 border-t border-border-crisp">
      <h2 className="text-[13px] font-medium text-on-surface-variant mb-5">Payment</h2>
      {children}
    </section>
  );

  const amount = formatAmount(payment?.amount_cents ?? task.amount_cents);
  const methodMeta = payee?.payout_method ? PAYOUT_METHODS[payee.payout_method] : null;

  // ── Shared: confirmed banner ───────────────────────────────────────────────
  if (payment?.status === "confirmed" || task.payment_status === "paid") {
    return (
      <Wrap>
      <div className="bg-emerald-500/10 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-on-surface">
            Payment complete{amount ? `. ${amount}` : ""}
          </p>
          {payment && (
            <p className="text-xs font-body text-on-surface-variant mt-0.5">
              Ref {payment.reference}{payment.method ? ` · ${PAYOUT_METHODS[payment.method as PayoutMethod]?.label ?? payment.method}` : ""}
              {isMyClaim ? " · received by you" : " · confirmed by the Pilot"}
            </p>
          )}
        </div>
      </div>
      </Wrap>
    );
  }

  if (payment?.status === "disputed") {
    return (
      <Wrap>
      <div className="bg-error-container/40 rounded-2xl px-5 py-4 mb-8">
        <p className="text-sm font-semibold text-on-surface mb-0.5">Payment disputed</p>
        <p className="text-xs font-body text-on-surface-variant">
          The Pilot reported not receiving {amount} (ref {payment.reference}). Check the transfer on both sides.
          The reference code in the note is the fastest way to trace it. Contact{" "}
          <a href="mailto:abdelrahman@hyrde.net" className="text-electric-violet underline">support</a> if it can&apos;t be resolved.
        </p>
      </div>
      </Wrap>
    );
  }

  // ── Client (payer) side ────────────────────────────────────────────────────
  if (isOwner) {
    // Gate: only after work approved
    if (task.payment_status !== "approved") return null;

    if (!payment) {
      return (
        <Wrap>
        <div className="bg-surface-container-low rounded-2xl p-6 mb-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-on-surface mb-1.5">
            Pay {payee?.display_name || "the Pilot"}
          </h3>
          {payee?.payout_handle && methodMeta ? (
            <>
              <p className="text-sm font-body text-on-surface-variant mb-4">
                You approved the work. Settle up over <strong className="text-on-surface">{methodMeta.label}</strong>. No card networks needed.
              </p>
              {task.amount_cents === 0 && (
                <div className="relative mb-4 max-w-56">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">$</span>
                  <input
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="Agreed amount"
                    inputMode="decimal"
                    className="w-full border border-border-crisp rounded-xl pl-7 pr-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet"
                  />
                </div>
              )}
              <button
                onClick={createPayment}
                disabled={busy}
                className="bg-electric-violet text-white text-sm font-semibold font-body px-8 py-3.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
              >
                {busy ? "Preparing…" : `Get payment instructions${amount ? `. ${amount}` : ""}`}
              </button>
            </>
          ) : (
            <p className="text-sm font-body text-on-surface-variant">
              The Pilot hasn&apos;t added payout details yet. They&apos;ve been prompted on their dashboard.
              Check back shortly.
            </p>
          )}
          {error && <p className="text-sm font-body text-error mt-3">{error}</p>}
        </div>
        </Wrap>
      );
    }

    if (payment.status === "awaiting_payment" && methodMeta && payee?.payout_handle) {
      return (
        <Wrap>
        <div className="bg-surface-container-low rounded-2xl p-6 mb-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-on-surface mb-4">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontVariationSettings: "'FILL' 1" }}>{methodMeta.icon}</span>
            Send {amount} via {methodMeta.label}
          </h3>

          <div className="flex flex-col gap-2.5 mb-4">
            <CopyRow label={`${methodMeta.label}. ${payee.display_name || "Pilot"}`} value={payee.payout_handle} />
            {amount && <CopyRow label="Amount (USD)" value={amount.replace("$", "")} />}
            <CopyRow label="Reference. Include it in the transfer note" value={payment.reference} highlight />
          </div>

          <p className="text-xs font-body text-on-surface-variant leading-relaxed bg-surface-container rounded-xl px-4 py-3 mb-4">
            <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: "14px" }}>info</span>
            {methodMeta.payHint}
          </p>

          <input
            value={proofInput}
            onChange={e => setProofInput(e.target.value)}
            placeholder="Transaction ID / sender name (optional but helps the Pilot verify)"
            className="w-full border border-border-crisp rounded-xl px-4 py-3 text-sm font-body text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet mb-4"
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={markSent}
              disabled={busy}
              className="bg-electric-violet text-white text-sm font-semibold font-body px-8 py-3.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
            >
              {busy ? "Saving…" : "I've sent the payment"}
            </button>
            <button onClick={cancelPayment} disabled={busy}
              className="text-sm font-semibold font-body text-on-surface-variant px-4 hover:text-on-surface">
              Cancel
            </button>
          </div>
          {error && <p className="text-sm font-body text-error mt-3">{error}</p>}
        </div>
        </Wrap>
      );
    }

    if (payment.status === "payment_sent") {
      return (
        <Wrap>
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-5 py-4 mb-8 flex items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-on-surface">Payment sent. Waiting for the Pilot to confirm</p>
            <p className="text-xs font-body text-on-surface-variant mt-0.5">
              {amount} · ref {payment.reference}. This updates live the moment they confirm.
            </p>
          </div>
        </div>
        </Wrap>
      );
    }
    return null;
  }

  // ── Pilot (payee) side ─────────────────────────────────────────────────────
  if (isMyClaim) {
    if (!payee?.payout_handle && task.payment_status === "approved") {
      return (
        <Wrap>
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl px-5 py-4 mb-8">
          <p className="text-sm font-semibold text-on-surface mb-1">Add payout details to get paid</p>
          <p className="text-xs font-body text-on-surface-variant mb-3">
            The client approved your work and wants to pay. Add your Airtm / InstaPay / wallet details.
          </p>
          <Link href="/dashboard?payout=1"
            className="inline-block bg-electric-violet text-white text-xs font-semibold font-body px-5 py-2.5 rounded-full hover:opacity-90">
            Add payout details
          </Link>
        </div>
        </Wrap>
      );
    }

    if (payment?.status === "awaiting_payment") {
      return (
        <Wrap>
        <div className="bg-surface-container rounded-2xl px-5 py-4 mb-8 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-electric-violet/30 border-t-electric-violet rounded-full animate-spin shrink-0" />
          <p className="text-sm font-body text-on-surface-variant">
            The client is preparing your {amount} payment{methodMeta ? ` over ${methodMeta.label}` : ""}…
          </p>
        </div>
        </Wrap>
      );
    }

    if (payment?.status === "payment_sent") {
      return (
        <Wrap>
        <div className="bg-surface-container-lowest border border-emerald-500/30 rounded-xl p-6 mb-8">
          <h3 className="flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-on-surface mb-1.5">
            {amount} is on its way
          </h3>
          <p className="text-sm font-body text-on-surface-variant mb-1.5">
            The client says they sent it{payment.method ? ` via ${PAYOUT_METHODS[payment.method as PayoutMethod]?.label ?? payment.method}` : ""}.
            Look for reference <strong className="text-on-surface">{payment.reference}</strong> in the transfer note.
          </p>
          {payment.proof_note && (
            <p className="text-xs font-body text-on-surface-variant mb-4">Client&apos;s note: “{payment.proof_note}”</p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={confirmReceived}
              disabled={busy}
              className="bg-emerald-600 text-white text-sm font-semibold font-body px-8 py-3.5 rounded-lg hover:opacity-90 transition disabled:opacity-60"
            >
              {busy ? "Confirming…" : "Confirm. I received it"}
            </button>
            <button onClick={disputePayment} disabled={busy}
              className="text-sm font-semibold font-body text-on-surface-variant px-4 hover:text-error">
              Nothing arrived
            </button>
          </div>
          {error && <p className="text-sm font-body text-error mt-3">{error}</p>}
        </div>
        </Wrap>
      );
    }
    return null;
  }

  return null;
}

// ─── Copyable detail row ──────────────────────────────────────────────────────

function CopyRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
      highlight ? "border-electric-violet/40 bg-electric-violet/5" : "border-border-crisp bg-surface-bright"
    }`}>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-on-surface-variant mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-on-surface truncate">{value}</div>
      </div>
      <button
        onClick={async () => {
          try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
        }}
        className="shrink-0 flex items-center gap-1 text-xs font-semibold font-body text-electric-violet hover:opacity-80"
        aria-label={`Copy ${label}`}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>{copied ? "check" : "content_copy"}</span>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
