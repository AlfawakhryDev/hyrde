"use client";
import { useEffect, useRef, type ReactNode } from "react";

// ── A hand-drawn stroke that draws itself under a phrase ───────────────────
// The homepage annotates its demo cards with ochre marker circles and
// underlines; this is the same idea for a headline. The stroke is drawn once,
// when the words scroll into view.
//
// Under prefers-reduced-motion the global rule in globals.css collapses the
// animation, which leaves the finished stroke — the mark, without the drawing.
export default function MarkerUnderline({
  children,
  color = "var(--color-electric-violet, #5B4FCF)",
}: {
  children: ReactNode;
  color?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.dataset.drawn = "true"; return; }
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (!e.isIntersecting) return;
        el.dataset.drawn = "true";
        io.disconnect();
      }),
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className="relative inline-block marker-underline">
      {children}
      {/* Deliberately uneven, so it reads as drawn rather than as a border. */}
      <svg
        aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none"
        className="absolute left-0 -bottom-1 w-full h-[0.38em] overflow-visible"
      >
        <path
          d="M2 8.5C28 4.6 61 3.4 99 4.2c34 .7 66 2.6 99 5.1"
          fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round"
          pathLength={1}
        />
      </svg>
    </span>
  );
}
