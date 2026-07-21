// ── How it works — three steps that perform on hover ─────────────────────────
// Step 1 writes the brief, step 2 draws the match connection, step 3 stamps
// the payment. Pure CSS, tap-focus works on touch.

const CSS = `
.hw-card { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; outline: none; }
.hw-card:is(:hover,:focus-within) { transform: translateY(-4px); box-shadow: 0 18px 48px -18px rgba(10,10,15,.16); }

/* 1 — the brief writes itself, then the polish chip pops */
.hw-card .hw-type { max-width: 0; overflow: hidden; white-space: nowrap; }
.hw-card:is(:hover,:focus-within) .hw-type { animation: hw-type 1s steps(32) .1s forwards; }
@keyframes hw-type { to { max-width: 100% } }
.hw-card .hw-chip { opacity: 0; transform: translateY(6px) scale(.9); transition: all .35s cubic-bezier(.2,.9,.3,1.3) 1.1s; }
.hw-card:is(:hover,:focus-within) .hw-chip { opacity: 1; transform: none; }

/* 2 — the connection draws, then the match pill pops */
.hw-card .hw-line { transform: scaleX(0); transform-origin: left; transition: transform .7s cubic-bezier(.2,.7,.2,1) .15s; }
.hw-card:is(:hover,:focus-within) .hw-line { transform: scaleX(1); }
.hw-card .hw-pill { opacity: 0; transform: translateY(6px) scale(.8); transition: all .4s cubic-bezier(.2,.9,.3,1.35) .8s; }
.hw-card:is(:hover,:focus-within) .hw-pill { opacity: 1; transform: none; }
.hw-card .hw-ava { transition: box-shadow .4s .8s, transform .4s .8s; }
.hw-card:is(:hover,:focus-within) .hw-ava { box-shadow: 0 0 0 3px rgba(91,79,207,.35); transform: scale(1.06); }

/* 3 — AI check appears, then PAID stamps */
.hw-card .hw-check { opacity: 0; transform: translateX(-6px); transition: all .35s ease .15s; }
.hw-card:is(:hover,:focus-within) .hw-check { opacity: 1; transform: none; }
.hw-card .hw-paid { opacity: 0; transform: scale(.55) rotate(8deg); }
.hw-card:is(:hover,:focus-within) .hw-paid { animation: hw-paid .45s .7s cubic-bezier(.2,.9,.3,1.35) forwards; }
@keyframes hw-paid { to { opacity: 1; transform: scale(1) rotate(-3deg) } }
`;

const card =
  "hw-card group rounded-2xl bg-[#F7F6FA] p-6 min-h-[280px] flex flex-col cursor-default select-none";

export default function HowItWorks() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <style>{CSS}</style>

      {/* Step 1 */}
      <div tabIndex={0} className={card}>
        <p className="text-[12px] font-semibold text-electric-violet mb-1.5">01</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">Describe the work</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">
          One rough sentence is enough. The AI structures it into a brief specialists can act on.
        </p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#9a9aa4] mb-2">New task</p>
          <p className="text-[13px] font-medium text-[#232329] mb-1.5">Landing page copy for fintech app</p>
          <div className="flex items-center text-[12.5px] text-[#6B6B76]">
            <span className="hw-type">Voice: confident, no jargon. 6 sections + CTA…</span>
            <span className="text-electric-violet">▍</span>
          </div>
          <div className="flex justify-end mt-2">
            <span className="hw-chip inline-flex items-center gap-1 rounded-full bg-electric-violet/10 text-electric-violet text-[11.5px] font-semibold px-2.5 py-1">
              ✦ Polished with AI
            </span>
          </div>
        </div>
      </div>

      {/* Step 2 */}
      <div tabIndex={0} className={card}>
        <p className="text-[12px] font-semibold text-electric-violet mb-1.5">02</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">The AI matches</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">
          It scores every vetted specialist in the category and assigns the single best fit. No bidding, no browsing.
        </p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <div className="flex items-center justify-center mb-2 h-6">
            <span className="hw-pill inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 text-[11.5px] font-semibold px-2.5 py-0.5">
              Matched · 91
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 rounded-lg bg-[#F1F0F5] px-2.5 py-1.5 text-[11.5px] font-medium text-[#4A4A55]">Your task</span>
            <div className="hw-line flex-1 h-[2px] rounded-full bg-gradient-to-r from-[#A99EE8] to-[#5B4FCF]" />
            <span className="hw-ava grid place-items-center h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#6D5FD6] to-[#A99EE8] text-white text-[13px] font-semibold">S</span>
          </div>
          <p className="text-right text-[11.5px] text-[#9a9aa4] mt-1.5">Sara K. · Copywriting · Strong</p>
        </div>
      </div>

      {/* Step 3 */}
      <div tabIndex={0} className={`${card} sm:col-span-2 lg:col-span-1`}>
        <p className="text-[12px] font-semibold text-electric-violet mb-1.5">03</p>
        <h3 className="text-[17px] font-semibold text-[#232329] mb-1.5">Approve &amp; pay direct</h3>
        <p className="text-[13.5px] text-[#5B5B66] leading-relaxed mb-5">
          The AI checks the deliverable against your brief first. Then you pay the freelancer directly. They keep 100%.
        </p>
        <div className="mt-auto rounded-xl bg-[#ffffff] shadow-[0_4px_20px_rgba(10,10,15,.06)] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12.5px] font-medium text-[#232329]">Deliverable v1</span>
            <span className="hw-check inline-flex items-center gap-1 text-[11.5px] font-semibold text-emerald-600">
              AI check ✓ 92/100
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-[#F7F6FA] px-3 py-2">
            <span className="text-[12px] text-[#6B6B76] font-mono">HYR-8F2K1C</span>
            <span className="hw-paid inline-flex items-center rounded-md border-2 border-emerald-500/70 text-emerald-600 text-[11px] font-bold px-2 py-0.5">
              PAID
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
