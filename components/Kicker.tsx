// A mono, uppercase section marker: "01 — What it costs". Small type doing
// the work of a label, which is what makes a schematic readable.
export default function Kicker({ n, children }: { n?: string; children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant mb-3">
      {n && <span className="text-electric-violet">{n}</span>}
      {n && <span className="mx-2 opacity-40">—</span>}
      {children}
    </p>
  );
}
