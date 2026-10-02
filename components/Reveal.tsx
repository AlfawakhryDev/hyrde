"use client";
import { useEffect, useRef, type ReactNode } from "react";

// ── Sections that arrive as you reach them ─────────────────────────────────
// The whole page used to land at once, which reads like a printed document.
// This fades each block up as it scrolls into view.
//
// Three rules it keeps:
//   1. The server renders everything visible. The hiding only ever happens in
//      the browser, so nothing depends on JavaScript to be readable — by a
//      person or by a crawler.
//   2. Anything already on screen when the page hydrates is left alone, so
//      there is no flash of content disappearing and coming back.
//   3. prefers-reduced-motion switches the whole thing off.
//
// Classes are toggled on the node rather than held in state: no re-render, and
// the element never re-mounts mid-animation.
export default function Reveal({
  children,
  delayMs = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;
    // Already in view at hydration: it has been seen, leave it be.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("reveal-pending");
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (delayMs) el.style.animationDelay = `${delayMs}ms`;
          el.classList.remove("reveal-pending");
          el.classList.add("animate-fadeup");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delayMs]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
