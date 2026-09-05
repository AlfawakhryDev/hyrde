"use client";
import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Picking a time across timezones ──────────────────────────────────
// Riyadh is UTC+3 and our specialists are not, so "3pm Tuesday" is the single
// easiest way to lose a call. Everything here is stored as timestamptz (UTC)
// and rendered through Intl in whichever zone the viewer is actually in, so
// neither side ever does the arithmetic.
//
// The client proposes a few windows, the specialist confirms one. No calendar
// OAuth: for one pilot client that is weeks of integration work to replace a
// dropdown, and Google/Microsoft sync can come when a second client asks.

export type Slot = { id: string; starts_at: string; state: string };

const DAYS_AHEAD = 10;
const HOURS = [9, 11, 13, 15, 17];   // local working hours offered
const localZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** "Tue 9 Sep, 3:00 pm" in a specific zone. */
export function inZone(iso: string, zone: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short", day: "numeric", month: "short",
    hour: "numeric", minute: "2-digit", timeZone: zone,
  }).format(new Date(iso));
}
const zoneAbbr = (zone: string) => zone.split("/").pop()?.replace(/_/g, " ") ?? zone;

export default function CallScheduler({
  callRequestId, slots: initial, freelancerName, freelancerTimezone, canPropose, canConfirm, scheduledAt,
}: {
  callRequestId: string;
  slots: Slot[];
  freelancerName: string;
  /** Null until they have set one; we then show both sides' local time. */
  freelancerTimezone: string | null;
  canPropose: boolean;   // the client
  canConfirm: boolean;   // the specialist
  scheduledAt: string | null;
}) {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<string | null>(scheduledAt);
  const me = localZone();

  // Next N weekdays x working hours, as real UTC instants.
  const options = useMemo(() => {
    const out: { iso: string; day: string }[] = [];
    const now = new Date();
    for (let d = 1; d <= DAYS_AHEAD && out.length < 40; d++) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      if (day.getDay() === 5 || day.getDay() === 6) continue;   // skip Fri/Sat (Gulf weekend)
      for (const h of HOURS) {
        const slot = new Date(day);
        slot.setHours(h, 0, 0, 0);
        out.push({
          iso: slot.toISOString(),
          day: new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" }).format(slot),
        });
      }
    }
    return out;
  }, []);

  const byDay = useMemo(() => {
    const m = new Map<string, { iso: string; day: string }[]>();
    for (const o of options) m.set(o.day, [...(m.get(o.day) ?? []), o]);
    return [...m.entries()].slice(0, 6);
  }, [options]);

  async function propose() {
    if (!picked.length) { setError("Pick at least one time that works."); return; }
    setBusy(true); setError("");
    const supa = supabaseBrowser();
    const { data, error: e } = await supa.from("call_slots")
      .insert(picked.map(iso => ({ call_request_id: callRequestId, starts_at: iso })))
      .select("id, starts_at, state");
    if (!e) await supa.from("call_requests").update({ client_timezone: me }).eq("id", callRequestId);
    setBusy(false);
    if (e || !data) { setError("Could not send those times."); return; }
    setSlots(prev => [...prev, ...(data as Slot[])]);
    setPicked([]);
  }

  async function confirm(slot: Slot) {
    setBusy(true); setError("");
    const supa = supabaseBrowser();
    const { error: e } = await supa.from("call_slots").update({ state: "confirmed" }).eq("id", slot.id);
    if (!e) {
      await supa.from("call_requests")
        .update({ scheduled_at: slot.starts_at, freelancer_timezone: me, status: "scheduled" })
        .eq("id", callRequestId);
    }
    setBusy(false);
    if (e) { setError("Could not confirm that time."); return; }
    setConfirmed(slot.starts_at);
    setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, state: "confirmed" } : s));
  }

  if (confirmed) {
    return (
      <div className="rounded-xl border border-border-crisp p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-2">Call confirmed</p>
        <p className="text-[15px] font-semibold text-on-surface">{inZone(confirmed, me)}</p>
        <p className="text-[12.5px] text-on-surface-variant mt-1">Your time ({zoneAbbr(me)})</p>
        {freelancerTimezone && freelancerTimezone !== me && (
          <p className="text-[12.5px] text-on-surface-variant mt-2">
            {freelancerName}: {inZone(confirmed, freelancerTimezone)} ({zoneAbbr(freelancerTimezone)})
          </p>
        )}
      </div>
    );
  }

  // Specialist's view: confirm one of the client's proposed windows.
  if (canConfirm && slots.length > 0) {
    return (
      <div className="rounded-xl border border-border-crisp p-4">
        <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1">Pick a time</p>
        <p className="text-[12.5px] text-on-surface-variant mb-3">
          Shown in your timezone ({zoneAbbr(me)}). Confirming books it for both of you.
        </p>
        <div className="flex flex-col gap-2">
          {slots.map(s => (
            <button
              key={s.id}
              onClick={() => confirm(s)}
              disabled={busy}
              className="flex items-center justify-between gap-3 h-11 px-4 rounded-full border border-border-crisp text-[13.5px] text-on-surface hover:border-outline transition-colors disabled:opacity-60"
            >
              <span>{inZone(s.starts_at, me)}</span>
              <span className="text-[12px] font-medium text-on-surface-variant">Confirm</span>
            </button>
          ))}
        </div>
        {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
      </div>
    );
  }

  if (!canPropose) {
    return (
      <p className="text-[13px] text-on-surface-variant">
        {slots.length ? `Waiting for ${freelancerName} to confirm one of your times.` : "No times proposed yet."}
      </p>
    );
  }

  // Client's view: propose windows.
  return (
    <div>
      <p className="text-[12.5px] text-on-surface-variant mb-3">
        Pick a few windows that suit you. Times are in your timezone ({zoneAbbr(me)}); {freelancerName} sees them in theirs.
      </p>
      <div className="flex flex-col gap-3 mb-4">
        {byDay.map(([day, times]) => (
          <div key={day}>
            <p className="text-[11px] uppercase tracking-[0.12em] text-on-surface-variant mb-1.5">{day}</p>
            <div className="flex flex-wrap gap-1.5">
              {times.map(t => {
                const on = picked.includes(t.iso);
                return (
                  <button
                    key={t.iso}
                    type="button"
                    onClick={() => setPicked(p => on ? p.filter(x => x !== t.iso) : [...p, t.iso])}
                    className={`h-8 px-3 rounded-full text-[12.5px] font-medium transition-colors ${
                      on ? "bg-on-surface text-inverse-on-surface"
                         : "border border-border-crisp text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(t.iso))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {slots.length > 0 && (
        <p className="text-[12.5px] text-on-surface-variant mb-3">
          Already sent: {slots.map(s => inZone(s.starts_at, me)).join(" · ")}
        </p>
      )}
      <button
        onClick={propose}
        disabled={busy || !picked.length}
        className="h-10 px-5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "Sending…" : `Send ${picked.length || ""} time${picked.length === 1 ? "" : "s"} to ${freelancerName.split(" ")[0]}`}
      </button>
      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
    </div>
  );
}
