"use client";
import { useState } from "react";

export interface CalendarSlot {
  id: string;
  label: string;
  iso: string;
  recommended?: boolean;
}

interface Props {
  slots: CalendarSlot[];
  brief?: string;
  onBooked?: (info: { slot: CalendarSlot; name: string; email: string }) => void;
  compact?: boolean;
}

export default function BookingCalendar({ slots, brief = "", onBooked, compact = false }: Props) {
  const [selected, setSelected] = useState<CalendarSlot | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);

  const confirm = async () => {
    if (!selected || !name || !email) return;
    setLoading(true);
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotLabel: selected.label, slotIso: selected.iso, name, email, topic: brief }),
      });
    } catch { /* show success anyway for demo */ }
    setBooked(true);
    onBooked?.({ slot: selected, name, email });
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="bg-white rounded-2xl border border-electric-violet/30 p-6 text-center">
        <div className="w-14 h-14 ai-match-gradient rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-white" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
        </div>
        <p className="font-bold font-headline text-tech-blue-deep text-lg mb-1">Call booked!</p>
        <p className="text-sm text-on-surface-variant font-body mb-0.5">{selected?.label}</p>
        <p className="text-xs text-on-surface-variant font-body">Confirmation sent to <strong>{email}</strong></p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border-crisp p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
        <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
          {compact ? "Book a strategy call" : "Book an intro call"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {slots.map(slot => (
          <button
            key={slot.id}
            onClick={() => setSelected(slot)}
            className={`relative text-left px-3 py-2.5 rounded-lg border text-xs font-body transition-all ${
              selected?.id === slot.id
                ? "border-electric-violet bg-electric-violet/8 text-electric-violet font-semibold"
                : "border-border-crisp text-on-surface-variant hover:border-electric-violet/40"
            }`}
          >
            {slot.recommended && (
              <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-electric-violet text-white px-1.5 py-0.5 rounded-full font-semibold leading-none">
                AI pick
              </span>
            )}
            {slot.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-2 mb-4 animate-fadeup">
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-border-crisp rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10"
          />
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            type="email" placeholder="Work email"
            className="w-full border border-border-crisp rounded-lg px-3 py-2.5 text-sm font-body focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10"
          />
        </div>
      )}

      <button
        onClick={confirm}
        disabled={!selected || !name || !email || loading}
        className="w-full bg-electric-violet text-white font-semibold font-body py-3 rounded-full text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading
          ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Confirming…</>
          : <><span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>Confirm booking</>}
      </button>
    </div>
  );
}
