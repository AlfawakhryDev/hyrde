"use client";
import { useRef, type ReactNode } from "react";

// ── Paper "sketch card" ───────────────────────────────────────────────────────
// A hand-drawn card: warm paper, a faint notebook grid, a wobbly ink border drawn
// like a marker outline, and a slight resting tilt. Interactive like the cards on
// Clerk's site: it tilts in 3D toward the cursor and a soft spotlight tracks the
// pointer. Transforms are set imperatively (no re-render) so it stays smooth.
export default function SketchCard({
  children,
  rotate = -1,
  className = "",
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = outer.current, tilt = inner.current;
    if (!el || !tilt) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 5;   // tilt up/down
    const ry = (px - 0.5) * 6.5; // tilt left/right
    tilt.style.transform = `rotate(0deg) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    el.style.setProperty("--spot", "1");
  }
  function onLeave() {
    const el = outer.current, tilt = inner.current;
    if (tilt) tilt.style.transform = `rotate(${rotate}deg)`;
    if (el) el.style.setProperty("--spot", "0");
  }

  return (
    <div
      ref={outer}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group relative [perspective:1100px] ${className}`}
      style={{ ["--spot" as string]: "0" }}
    >
      <div
        ref={inner}
        className="relative [transform-style:preserve-3d] transition-transform duration-200 ease-out"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        {/* the paper */}
        <div
          className="relative overflow-hidden rounded-[2px] bg-[#F6F3E9] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55),0_2px_0_0_rgba(0,0,0,0.04)]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(20,20,15,0.045) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(20,20,15,0.045) 1px, transparent 1px)",
            backgroundSize: "22px 22px, 22px 22px",
          }}
        >
          {/* hand-drawn ink border (two passes = sketchy) */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-[#1A1A14]"
            viewBox="0 0 300 200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M9,8 C 90,4 180,11 291,7 C 294,64 289,132 293,193 C 210,197 110,190 10,195 C 7,132 12,70 9,8 Z"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M13,12 C 95,9 175,15 287,11 C 290,66 286,128 289,189 C 205,192 112,186 14,190 C 11,128 15,72 13,12"
              fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
              vectorEffect="non-scaling-stroke" opacity="0.35"
            />
          </svg>

          {/* cursor spotlight */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-200"
            style={{
              opacity: "var(--spot)",
              background: "radial-gradient(240px circle at var(--mx) var(--my), rgba(255,252,240,0.7), transparent 60%)",
              mixBlendMode: "soft-light",
            }}
          />

          <div className="relative z-10 p-5 md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
