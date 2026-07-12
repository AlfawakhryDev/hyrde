"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Soft product tour ─────────────────────────────────────────────────────────
// Spotlights elements marked with data-tour="<id>", one step at a time, with a
// short explanation. Skippable at every step; completion is remembered per
// browser so it only plays on the first visit.

export interface TourStep {
  id: string;      // matches data-tour attribute
  title: string;
  body: string;
}

const PAD = 8; // spotlight padding around the target

export default function Tour({ steps, storageKey }: { steps: TourStep[]; storageKey: string }) {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [ready, setReady] = useState(false);
  const lastClick = useRef(0);
  const stepIds = useRef(steps.map(s => s.id).join(","));

  // Only offer steps whose targets actually exist on this screen.
  const [available, setAvailable] = useState<TourStep[]>([]);

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch { return; }
    // Let the dashboard finish its first paint + data load settle.
    const t = setTimeout(() => {
      const found = steps.filter(s => document.querySelector(`[data-tour="${s.id}"]`));
      if (found.length >= 2) {
        setAvailable(found);
        setActive(true);
      }
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, stepIds.current]);

  const measure = useCallback(() => {
    const step = available[idx];
    if (!step) return;
    const el = document.querySelector(`[data-tour="${step.id}"]`);
    if (!el) { setRect(null); return; }
    setRect(el.getBoundingClientRect());
  }, [available, idx]);

  // Scroll the target into view, then measure (and keep measuring on scroll/resize).
  useEffect(() => {
    if (!active || !available[idx]) return;
    setReady(false);
    const el = document.querySelector(`[data-tour="${available[idx].id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const settle = setTimeout(() => { measure(); setReady(true); }, 350);
    const onMove = () => measure();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [active, idx, available, measure]);

  const finish = useCallback(() => {
    try { localStorage.setItem(storageKey, new Date().toISOString()); } catch { /* ignore */ }
    setActive(false);
  }, [storageKey]);

  // Guard against double-dispatched clicks advancing two steps at once.
  const guarded = useCallback((fn: () => void) => {
    const now = Date.now();
    if (now - lastClick.current < 300) return;
    lastClick.current = now;
    fn();
  }, []);

  if (!active || !available.length || !rect || !ready) return null;

  const step = available[idx];
  const last = idx === available.length - 1;

  // Tooltip placement: below the target if there's room, else above.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const tipW = Math.min(320, vw - 24);
  const below = rect.bottom + 170 < vh;
  const tipTop = below ? rect.bottom + PAD + 10 : undefined;
  const tipBottom = below ? undefined : vh - rect.top + PAD + 10;
  const tipLeft = Math.max(12, Math.min(rect.left + rect.width / 2 - tipW / 2, vw - tipW - 12));

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-label="Product tour">
      {/* Spotlight: the hole is the target; the shadow dims everything else. */}
      <div
        className="absolute rounded-xl transition-all duration-300 pointer-events-none"
        style={{
          top: rect.top - PAD,
          left: rect.left - PAD,
          width: rect.width + PAD * 2,
          height: rect.height + PAD * 2,
          boxShadow: "0 0 0 9999px rgba(8,8,10,0.62)",
          border: "1.5px solid rgba(91,79,207,0.9)",
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-surface-bright border border-border-crisp rounded-xl p-4 shadow-[0_12px_48px_rgba(0,0,0,0.28)]"
        style={{ top: tipTop, bottom: tipBottom, left: tipLeft, width: tipW }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-sm font-semibold text-on-surface">{step.title}</h3>
          <span className="text-[11px] text-on-surface-variant">{idx + 1}/{available.length}</span>
        </div>
        <p className="text-[13px] text-on-surface-variant leading-relaxed mb-3.5">{step.body}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={finish}
            className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors px-1"
          >
            Skip tour
          </button>
          <span className="flex gap-1 mx-auto">
            {available.map((_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === idx ? "bg-electric-violet" : "bg-surface-container-highest"}`} />
            ))}
          </span>
          {idx > 0 && (
            <button
              onClick={() => guarded(() => setIdx(i => i - 1))}
              className="h-8 px-3 rounded-full border border-border-crisp text-[13px] font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => guarded(() => (last ? finish() : setIdx(i => i + 1)))}
            className="h-8 px-3.5 rounded-full bg-electric-violet text-white text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            {last ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
