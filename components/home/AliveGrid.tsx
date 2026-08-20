// ── Clerk-style "alive" bento ─────────────────────────────────────────────────
// Each card is a miniature of the real product that performs on hover (and on
// tap-focus for touch): the interview types, spam sweeps away, the review bar
// fills, the fees get struck through. Pure CSS — no JS, fully reversible.
import { tFor, type Locale } from "@/lib/i18n";

const CSS = `
.alive { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; outline: none; }
.alive:is(:hover,:focus-within) { transform: translateY(-4px); box-shadow: 0 18px 48px -18px rgba(10,10,15,.16); }

/* 1 — interview answer types, then the grade stamps */
.alive .ag-type { max-width: 0; overflow: hidden; white-space: nowrap; }
.alive:is(:hover,:focus-within) .ag-type { animation: ag-type 1.1s steps(36) .1s forwards; }
@keyframes ag-type { to { max-width: 100% } }
.alive .ag-caret { animation: blink 1s step-end infinite; }
.alive .ag-stamp { opacity: 0; transform: scale(.55) rotate(-8deg); }
.alive:is(:hover,:focus-within) .ag-stamp { animation: ag-stamp .45s 1.25s cubic-bezier(.2,.9,.3,1.35) forwards; }
@keyframes ag-stamp { to { opacity: 1; transform: scale(1) rotate(-2deg) } }

/* 2 — proposal spam sweeps out, the match pops in */
.alive .ag-spam { transition: transform .45s ease, opacity .45s ease; }
.alive:is(:hover,:focus-within) .ag-spam-1 { transform: translateX(28px); opacity: 0; transition-delay: .04s }
.alive:is(:hover,:focus-within) .ag-spam-2 { transform: translateX(28px); opacity: 0; transition-delay: .16s }
.alive:is(:hover,:focus-within) .ag-spam-3 { transform: translateX(28px); opacity: 0; transition-delay: .28s }
.alive .ag-win { opacity: 0; transform: translateY(10px) scale(.97); transition: all .45s cubic-bezier(.2,.7,.2,1) .5s; }
.alive:is(:hover,:focus-within) .ag-win { opacity: 1; transform: none; }

/* 3 — review bar fills, verdict flips */
.alive .ag-bar { width: 7%; transition: width .85s cubic-bezier(.2,.7,.2,1) .15s; }
.alive:is(:hover,:focus-within) .ag-bar { width: 92%; }
.alive .ag-idle { transition: opacity .25s .55s } .alive .ag-done { opacity: 0; transition: opacity .25s .55s }
.alive:is(:hover,:focus-within) .ag-idle { opacity: 0; transition-delay: .5s }
.alive:is(:hover,:focus-within) .ag-done { opacity: 1; transition-delay: .55s }

/* 4 — the fees get struck through, 100% lights up */
.alive .ag-strike { position: relative; transition: opacity .3s; }
.alive .ag-strike::after { content: ""; position: absolute; left: 0; top: 50%; height: 1.5px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .32s ease; }
.alive:is(:hover,:focus-within) .ag-strike { opacity: .45; }
.alive:is(:hover,:focus-within) .ag-strike-1::after { transform: scaleX(1); transition-delay: .05s }
.alive:is(:hover,:focus-within) .ag-strike-2::after { transform: scaleX(1); transition-delay: .2s }
.alive:is(:hover,:focus-within) .ag-strike-3::after { transform: scaleX(1); transition-delay: .35s }
.alive .ag-keep { opacity: .35; transform: scale(.94); transition: all .45s cubic-bezier(.2,.9,.3,1.2) .55s; }
.alive:is(:hover,:focus-within) .ag-keep { opacity: 1; transform: scale(1.04); color: #14140F; }
`;

const card =
  "alive group rounded-[8px] border border-[#E7E4DB] bg-[#FBFAF6] p-6 min-h-[300px] flex flex-col cursor-default select-none";

export default function AliveGrid({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale);
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <style>{CSS}</style>

      {/* 1 — Interview-vetted only */}
      <div tabIndex={0} className={`${card}`}>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("grid.g1H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5 max-w-[46ch]">{t("grid.g1P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9a9aa4] mb-2">{t("grid.g1Live")}</p>
          <p className="text-[13px] text-[#4A4A55] mb-2.5">{t("grid.g1Q")}</p>
          <div className="flex items-center text-[13px] font-medium text-[#232329]">
            <span className="ag-type">{t("grid.g1A")}</span>
            <span className="ag-caret text-[#14140F]">▍</span>
          </div>
          <div className="flex justify-end mt-2">
            <span className="ag-stamp inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500/70 text-emerald-600 text-[12px] font-bold px-2.5 py-0.5">
              {t("grid.g1Stamp")}
            </span>
          </div>
        </div>
      </div>

      {/* 2 — Zero proposals */}
      <div tabIndex={0} className={`${card}`}>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("grid.g2H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5 max-w-[46ch]">{t("grid.g2P")}</p>
        <div className="mt-auto space-y-1.5">
          {[
            ["ag-spam-1", t("grid.g2Spam1")],
            ["ag-spam-2", t("grid.g2Spam2")],
            ["ag-spam-3", t("grid.g2Spam3")],
          ].map(([cls, txt]) => (
            <div key={cls} className={`ag-spam ${cls} rounded-lg bg-[#ffffff]/70 px-3.5 py-2 text-[12.5px] text-[#9a9aa4] line-clamp-1`}>
              {txt}
            </div>
          ))}
          <div className="ag-win rounded-lg bg-[#ffffff] shadow-[0_4px_20px_rgba(20,20,15,.1)] px-3.5 py-2.5 flex items-center gap-2.5">
            <span className="grid place-items-center h-6 w-6 rounded-full border border-[#E3E0D8] bg-white text-[#57564F] text-[10.5px] font-semibold">S</span>
            <span className="text-[13px] font-medium text-[#232329] flex-1">{t("grid.g2Match")}</span>
            <span className="text-[11.5px] font-semibold text-emerald-600">{t("grid.g2Score")}</span>
          </div>
        </div>
      </div>

      {/* 3 — AI-checked delivery */}
      <div tabIndex={0} className={`${card}`}>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("grid.g3H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5 max-w-[46ch]">{t("grid.g3P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12px] font-medium text-[#4A4A55]">{t("grid.g3VsBrief")}</span>
            <span className="relative text-[13px] font-semibold text-[#232329]">
              <span className="ag-idle absolute right-0">…</span>
              <span className="ag-done">92/100</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F1F0F5] overflow-hidden mb-3">
            <div className="ag-bar h-full rounded-full bg-[#14140F]" />
          </div>
          <div className="relative h-6">
            <span className="ag-idle absolute inline-flex items-center gap-1.5 rounded-full bg-[#F1F0F5] text-[#6B6B76] text-[11.5px] font-medium px-2.5 py-1">
              {t("grid.g3Reviewing")}
            </span>
            <span className="ag-done absolute inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11.5px] font-semibold px-2.5 py-1">
              {t("grid.g3Verdict")}
            </span>
          </div>
        </div>
      </div>

      {/* 4 — Keep 100% */}
      <div tabIndex={0} className={`${card}`}>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("grid.g4H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5 max-w-[46ch]">{t("grid.g4P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          {[
            ["ag-strike-1", t("grid.g4Row1L"), t("grid.g4Row1C")],
            ["ag-strike-2", t("grid.g4Row2L"), t("grid.g4Row2C")],
            ["ag-strike-3", t("grid.g4Row3L"), t("grid.g4Row3C")],
          ].map(([cls, label, cost]) => (
            <div key={cls} className="flex items-center justify-between py-1.5 text-[13px] text-[#6B6B76]">
              <span className={`ag-strike ${cls}`}>{label}</span>
              <span className={`ag-strike ${cls} font-medium`}>{cost}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2.5 mt-1.5 border-t border-[#F1F0F5]">
            <span className="text-[13px] font-medium text-[#232329]">{t("grid.g4Keep")}</span>
            <span className="ag-keep text-[22px] font-semibold tracking-[-0.02em] text-[#232329]">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
