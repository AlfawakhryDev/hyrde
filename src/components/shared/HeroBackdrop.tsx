"use client";
import { useEffect, useRef } from "react";

// ── Mouse-reactive hero backdrop ──────────────────────────────────────────────
// Three layers: (1) faint base grid + ambient violet wash, (2) a brighter grid
// + glow revealed through a radial mask that follows the cursor, (3) a soft
// violet bloom at the cursor itself. Pure CSS vars updated on rAF — no canvas,
// no jank, and it degrades to the static backdrop without a pointer.
export default function HeroBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = parent.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
        el.style.setProperty("--reveal", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--reveal", "0");

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf.current);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0"
      style={{ ["--mx" as string]: "70%", ["--my" as string]: "30%", ["--reveal" as string]: "0" }}
    >
      {/* Base: ambient washes + faint grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 70% 20%, rgba(247,245,240,0.10), transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 15% 85%, rgba(247,245,240,0.05), transparent 60%)," +
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "auto, auto, 56px 56px, 56px 56px",
        }}
      />

      {/* Reveal: brighter grid + violet sheen, masked around the cursor */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "var(--reveal)",
          backgroundImage:
            "radial-gradient(240px at var(--mx) var(--my), rgba(247,245,240,0.10), transparent 70%)," +
            "linear-gradient(rgba(247,245,240,0.22) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(247,245,240,0.22) 1px, transparent 1px)",
          backgroundSize: "auto, 56px 56px, 56px 56px",
          WebkitMaskImage:
            "radial-gradient(260px circle at var(--mx) var(--my), black 0%, rgba(0,0,0,0.4) 55%, transparent 80%)",
          maskImage:
            "radial-gradient(260px circle at var(--mx) var(--my), black 0%, rgba(0,0,0,0.4) 55%, transparent 80%)",
        }}
      />

      {/* Cursor bloom */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: "calc(var(--reveal) * 0.9)",
          background:
            "radial-gradient(140px circle at var(--mx) var(--my), rgba(247,245,240,0.10), transparent 70%)",
        }}
      />
    </div>
  );
}
