"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  display?: string;     // static override (e.g. a range) — skips animation
  comma?: boolean;      // format with thousands separators
  durationMs?: number;
  className?: string;
}

/**
 * Animated count-up. Counts 0 → value the first time it scrolls into view.
 * Respects prefers-reduced-motion and supports a static `display` override
 * for non-single-number figures (e.g. "$17k–$240k").
 */
export default function StatCounter({
  value,
  prefix = "",
  suffix = "",
  display,
  comma = false,
  durationMs = 1600,
  className = "",
}: Props) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (display) return; // static figure, nothing to animate
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setN(value);
      return;
    }

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs);
              const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
              setN(Math.round(value * eased));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [value, display, durationMs]);

  const formatted = comma ? n.toLocaleString("en-US") : String(n);

  return (
    <span ref={ref} className={className}>
      {display ?? `${prefix}${formatted}${suffix}`}
    </span>
  );
}
