import { ALTERNATIVES, COMPARISON_NOTES, COMPARISON_ROWS } from "@/lib/alternatives";

/**
 * The comparison a CTO runs before buying, rendered as a specification sheet
 * rather than a marketing grid: no ticks, no crosses, no "best value" badge.
 * Every cell states a fact and the reader draws the conclusion (§7, §10).
 *
 * Our column is marked with a hairline rule and a slightly denser ink — not
 * with colour. Amber is reserved exclusively for compliance warnings (§10),
 * and the blue is structural, not promotional.
 *
 * Server component: it is a static table, so no client JS.
 */
export default function AlternativesTable() {
  const usedNotes = Array.from(
    new Set(COMPARISON_ROWS.map((r) => r.note).filter((n): n is string => Boolean(n))),
  );

  return (
    <div>
      {/* Desktop: a real table. Semantics matter for screen readers here. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Vergleich: interner Aufbau, Direktbeauftragung einer externen Einzelperson und
            Werkvertrag mit Hyrde.
          </caption>
          <thead>
            <tr>
              <th scope="col" className="w-[22%] pb-4 pr-6 align-bottom">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-wv-ash">
                  Kriterium
                </span>
              </th>
              {ALTERNATIVES.map((alt) => {
                const isUs = alt.id === "hyrde";
                return (
                  <th
                    key={alt.id}
                    scope="col"
                    className={`w-[26%] border-b-2 pb-4 pr-6 align-bottom ${
                      isUs ? "border-wv-ink" : "border-wv-line"
                    }`}
                  >
                    <span
                      className={`block text-[15px] font-semibold tracking-[-0.01em] ${
                        isUs ? "text-wv-ink" : "text-wv-slate"
                      }`}
                    >
                      {alt.labelDe}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10.5px] uppercase tracking-[0.12em] text-wv-mist">
                      {alt.subDe}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row) => (
              <tr key={row.id} className="border-b border-wv-line align-top">
                <th scope="row" className="py-4 pr-6 text-[13px] font-medium text-wv-ash">
                  {row.labelDe}
                  {row.note && (
                    <sup className="ml-0.5 font-mono text-[10px] text-wv-mist">
                      {usedNotes.indexOf(row.note) + 1}
                    </sup>
                  )}
                </th>
                {ALTERNATIVES.map((alt) => {
                  const isUs = alt.id === "hyrde";
                  return (
                    <td
                      key={alt.id}
                      className={`py-4 pr-6 text-[13.5px] leading-relaxed ${
                        isUs
                          ? "border-l border-wv-line bg-wv-panel/45 pl-4 font-medium text-wv-ink"
                          : "text-wv-slate"
                      }`}
                    >
                      {row.values[alt.id]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: the table collapses to one block per alternative. A 4-column
          grid at 375px would be unreadable, and horizontal scroll hides our
          column — which is the one the comparison exists to surface. */}
      <div className="space-y-px overflow-hidden rounded-[4px] border border-wv-line bg-wv-line md:hidden">
        {ALTERNATIVES.map((alt) => {
          const isUs = alt.id === "hyrde";
          return (
            <section key={alt.id} className={isUs ? "bg-wv-panel p-6" : "bg-wv-paper p-6"}>
              <h3
                className={`text-[15px] font-semibold tracking-[-0.01em] ${
                  isUs ? "text-wv-ink" : "text-wv-slate"
                }`}
              >
                {alt.labelDe}
              </h3>
              <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-wv-mist">
                {alt.subDe}
              </p>
              <dl className="mt-4 space-y-3">
                {COMPARISON_ROWS.map((row) => (
                  <div key={row.id} className="border-t border-wv-line pt-3">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-wv-ash">
                      {row.labelDe}
                    </dt>
                    <dd
                      className={`mt-1 text-[13.5px] leading-relaxed ${
                        isUs ? "font-medium text-wv-ink" : "text-wv-slate"
                      }`}
                    >
                      {row.values[alt.id]}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>

      {/* Sources. A German B2B buyer checks these. */}
      {usedNotes.length > 0 && (
        <ol className="mt-6 space-y-1.5">
          {usedNotes.map((key, i) => (
            <li key={key} className="flex gap-2 text-[11.5px] leading-relaxed text-wv-mist">
              <span className="font-mono">{i + 1}</span>
              <span>{COMPARISON_NOTES[key]}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
