import Link from "next/link";

// The Hyrde "H" — two uprights bridged by a dot (the original mark, cleaned up:
// no gradient tile, monochrome, inherits text color).
export function HyrdeMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M3.4 2.4v11.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12.6 2.4v11.2" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="8" cy="8" r="1.9" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ href = "/", onClick }: { href?: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label="Hyrde home"
      className="inline-flex items-center gap-2 text-on-surface hover:opacity-80 transition-opacity"
    >
      <HyrdeMark />
      <span className="text-[17px] font-semibold tracking-[-0.02em] leading-none select-none">
        hyrde
      </span>
    </Link>
  );
}
