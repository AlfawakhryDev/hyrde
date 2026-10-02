import Link from "next/link";
import Image from "next/image";
import { CREDENTIALS } from "@/lib/credentials";

// A row of cells, one per programme we belong to — the same hairline framing
// the rest of the site uses. One entry looks deliberate; six will too.
export default function CredentialStrip({ heading }: { heading: string }) {
  if (CREDENTIALS.length === 0) return null;

  return (
    <section aria-label={heading} className="border-y border-border-crisp">
      <div className="mx-auto max-w-[1180px] px-5 md:px-8 py-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant shrink-0">
          {heading}
        </p>
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {CREDENTIALS.map(c => {
            const body = (
              <>
                {c.logo ? (
                  <Image src={c.logo} alt={c.name} width={120} height={28} className="h-7 w-auto object-contain" />
                ) : (
                  <span className="text-[15px] font-semibold text-on-surface tracking-[-0.01em]">{c.name}</span>
                )}
                {/* The heading already says "Member of", so saying it again on
                    every cell is noise. A different relation — partner, investor
                    — is worth the words. */}
                {c.relation.toLowerCase() !== "member" && (
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant">
                    {c.relation}
                  </span>
                )}
              </>
            );
            return (
              <li key={c.id} className="flex items-center gap-3">
                {c.href ? (
                  <Link
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
