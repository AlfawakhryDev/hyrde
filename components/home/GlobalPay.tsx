// ── Get paid anywhere — the rails light up on hover ──────────────────────────
// Dark full-width band. Hovering lights each payout rail in sequence and plays
// the reference → sent → confirmed flow. Pure CSS, tap-focus on touch.

const RAILS = ["InstaPay", "Vodafone Cash", "USDT", "Airtm", "PayPal", "Bank wire"];

const CSS = `
.gp-band { outline: none; }
.gp-band .gp-rail { transition: all .35s ease; }
${RAILS.map((_, i) =>
  `.gp-band:is(:hover,:focus-within) .gp-rail-${i} { border-color: rgba(169,158,232,.6); color: #fff; background: rgba(169,158,232,.12); transition-delay: ${0.06 + i * 0.09}s }`
).join("\n")}
.gp-band .gp-step { opacity: .35; transition: opacity .3s ease; }
.gp-band:is(:hover,:focus-within) .gp-step-1 { opacity: 1; transition-delay: .1s }
.gp-band:is(:hover,:focus-within) .gp-step-2 { opacity: 1; transition-delay: .5s }
.gp-band:is(:hover,:focus-within) .gp-step-3 { opacity: 1; transition-delay: .95s }
.gp-band .gp-ok { opacity: 0; transform: scale(.6); }
.gp-band:is(:hover,:focus-within) .gp-ok { animation: gp-ok .4s 1.15s cubic-bezier(.2,.9,.3,1.35) forwards; }
@keyframes gp-ok { to { opacity: 1; transform: scale(1) } }
.gp-band .gp-glow { opacity: .45; transition: opacity .6s ease; }
.gp-band:is(:hover,:focus-within) .gp-glow { opacity: 1; }
`;

export default function GlobalPay() {
  return (
    <div tabIndex={0} className="gp-band relative overflow-hidden rounded-2xl bg-[#0A0A0B] px-8 md:px-14 py-14 md:py-16 cursor-default select-none">
      <style>{CSS}</style>
      <div
        aria-hidden="true"
        className="gp-glow absolute inset-0"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 90% at 85% 20%, rgba(91,79,207,0.3), transparent 60%)" }}
      />

      <div className="relative grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-[12px] font-medium text-white/50 mb-3">Borderless by design</p>
          <h2 className="font-light text-white leading-[1.04] tracking-[-0.03em] text-[clamp(30px,4.2vw,50px)] max-w-[15ch]">
            Get paid on your rails, anywhere
          </h2>
          <p className="text-[14px] text-white/55 leading-relaxed max-w-[420px] mt-5">
            No Stripe in your country? No problem — clients pay you directly on the rail you
            choose, with a tracked reference. Hyrde takes no cut.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {RAILS.map((r, i) => (
              <span
                key={r}
                className={`gp-rail gp-rail-${i} rounded-full border border-white/12 px-3.5 py-1.5 text-[12.5px] font-medium text-white/45`}
              >
                {r}
              </span>
            ))}
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 max-w-[420px]">
            <div className="gp-step gp-step-1 flex items-center justify-between py-1.5 text-[13px]">
              <span className="text-white/60">Reference</span>
              <span className="font-mono text-white/90">HYR-8F2K1C</span>
            </div>
            <div className="gp-step gp-step-2 flex items-center justify-between py-1.5 text-[13px] border-t border-white/8">
              <span className="text-white/60">Client marked</span>
              <span className="text-white/90 font-medium">Payment sent</span>
            </div>
            <div className="gp-step gp-step-3 flex items-center justify-between py-1.5 text-[13px] border-t border-white/8">
              <span className="text-white/60">You confirmed</span>
              <span className="gp-ok inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 text-emerald-300 text-[11.5px] font-semibold px-2.5 py-0.5">
                Received ✓
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
