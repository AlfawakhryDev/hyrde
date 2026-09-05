// ── How it works — three steps that perform on hover ─────────────────────────
// Step 1 writes the brief, step 2 draws the match connection, step 3 stamps
// the payment. Pure CSS, tap-focus works on touch.
import { tFor, type Locale } from "@/lib/i18n";

const CSS = `
.hw-card { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; outline: none; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) { transform: translateY(-4px); box-shadow: 0 18px 48px -18px rgba(10,10,15,.16); }

/* 1 — the brief writes itself, then the polish chip pops */
.hw-card .hw-type { max-width: 0; overflow: hidden; white-space: nowrap; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-type { animation: hw-type 1s steps(32) .1s forwards; }
@keyframes hw-type { to { max-width: 100% } }
.hw-card .hw-chip { opacity: 0; transform: translateY(6px) scale(.9); transition: all .35s cubic-bezier(.2,.9,.3,1.3) 1.1s; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-chip { opacity: 1; transform: none; }

/* 2 — the connection draws, then the match pill pops */
.hw-card .hw-line { transform: scaleX(0); transform-origin: left; transition: transform .7s cubic-bezier(.2,.7,.2,1) .15s; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-line { transform: scaleX(1); }
.hw-card .hw-pill { opacity: 0; transform: translateY(6px) scale(.8); transition: all .4s cubic-bezier(.2,.9,.3,1.35) .8s; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-pill { opacity: 1; transform: none; }
.hw-card .hw-ava { transition: box-shadow .4s .8s, transform .4s .8s; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-ava { box-shadow: 0 0 0 3px rgba(20,20,15,.28); transform: scale(1.06); }

/* 3 — AI check appears, then PAID stamps */
.hw-card .hw-check { opacity: 0; transform: translateX(-6px); transition: all .35s ease .15s; }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-check { opacity: 1; transform: none; }
.hw-card .hw-paid { opacity: 0; transform: scale(.55) rotate(8deg); }
.hw-card:is(:hover,:focus-visible,:has(:focus-visible)) .hw-paid { animation: hw-paid .45s .7s cubic-bezier(.2,.9,.3,1.35) forwards; }
@keyframes hw-paid { to { opacity: 1; transform: scale(1) rotate(-3deg) } }
`;

const card =
  "hw-card group rounded-[8px] border border-[#E7E4DB] bg-[#FBFAF6] p-6 min-h-[280px] flex flex-col cursor-default select-none";

export default function HowItWorks({ locale = "en" }: { locale?: Locale }) {
  const t = tFor(locale);
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <style>{CSS}</style>

      {/* Step 1 */}
      <div tabIndex={0} className={card}>
        <p className="font-mono text-[12px] tracking-[0.1em] text-[#8A887E] mb-2">01</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("steps.s1H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">{t("steps.s1P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9a9aa4] mb-2">{t("steps.s1New")}</p>
          <p className="text-[13px] font-medium text-[#232329] mb-1.5">{t("steps.s1Title")}</p>
          <div className="flex items-center text-[12.5px] text-[#6B6B76]">
            <span className="hw-type">{t("steps.s1Type")}</span>
            <span className="text-[#14140F]">▍</span>
          </div>
          <div className="flex justify-end mt-2">
            <span className="hw-chip inline-flex items-center gap-1 rounded-full bg-[#14140F]/[0.06] text-[#14140F] text-[11.5px] font-semibold px-2.5 py-1">
              {t("steps.s1Chip")}
            </span>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div tabIndex={0} className={card}>
        <p className="font-mono text-[12px] tracking-[0.1em] text-[#8A887E] mb-2">02</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("steps.s2H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">{t("steps.s2P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <div className="flex items-center justify-center mb-2 h-6">
            <span className="hw-pill inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 text-[11.5px] font-semibold px-2.5 py-0.5">
              {t("steps.s2Matched")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-lg bg-[#F1F0F5] px-2.5 py-1.5 text-[11.5px] font-medium text-[#4A4A55]">{t("steps.s2Your")}</span>
            <div className="hw-line flex-1 h-[2px] rounded-full bg-[#14140F]" />
            <span className="hw-ava grid place-items-center h-9 w-9 shrink-0 rounded-full border border-[#E3E0D8] bg-white text-[#57564F] text-[13px] font-semibold">S</span>
          </div>
          <p className="text-right text-[11.5px] text-[#9a9aa4] mt-1.5">{t("steps.s2Meta")}</p>
        </div>
      </div>

      {/* Step 3 */}
      <div tabIndex={0} className={`${card} sm:col-span-2 lg:col-span-1`}>
        <p className="font-mono text-[12px] tracking-[0.1em] text-[#8A887E] mb-2">03</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">{t("steps.s3H")}</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">{t("steps.s3P")}</p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12.5px] font-medium text-[#232329]">{t("steps.s3Deliv")}</span>
            <span className="hw-check inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
              {t("steps.s3Check")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-[5px] bg-[#F4F2EC] px-3 py-2">
            <span className="text-[12px] text-[#6B6B76] font-mono">HYR-8F2K1C</span>
            <span className="hw-paid inline-flex items-center rounded-md border-2 border-emerald-500/70 text-emerald-600 text-[11px] font-bold px-2 py-0.5">
              {t("steps.s3Paid")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
