// Shared page header for interior marketing pages — keeps the numbered-marker
// register consistent without repeating markup.
export default function PageHead({ marker, title, intro }: { marker: string; title: string; intro?: string }) {
  return (
    <div className="border-b border-wv-line">
      <div className="mx-auto max-w-[1120px] px-5 py-14 md:px-8 md:py-20">
        <div className="flex items-center gap-3">
          <span className="h-px w-7 bg-wv-line" aria-hidden="true" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-wv-ash">{marker}</span>
        </div>
        <h1 className="mt-6 max-w-[24ch] text-[clamp(30px,4.2vw,46px)] font-semibold leading-[1.08] tracking-[-0.02em] text-wv-ink">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-[58ch] text-[16px] leading-[1.6] text-wv-slate">{intro}</p>}
      </div>
    </div>
  );
}

// A visible "content pending legal review" notice for legal pages. Neutral
// styling on purpose — amber is reserved for real compliance warnings (§10).
export function PendingLegalNotice() {
  return (
    <div className="rounded-[3px] border border-dashed border-wv-line bg-wv-panel px-5 py-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-wv-ash">LEGAL_REVIEW_REQUIRED</p>
      <p className="mt-2 text-[13.5px] leading-relaxed text-wv-slate">
        Dieser Text ist ein Platzhalter und noch nicht rechtlich geprüft. Verbindliche Fassung folgt
        nach Freigabe durch einen Fachanwalt.
      </p>
    </div>
  );
}
