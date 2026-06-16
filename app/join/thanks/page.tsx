import Link from "next/link";

export default function FreelancerThanksPage() {
  return (
    <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-lg text-center">

        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-[12px] ai-match-gradient shadow-[0_4px_14px_rgba(91,79,207,0.35)]">
            <svg width="22" height="22" viewBox="0 0 512 512" aria-hidden="true">
              <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
              </g>
              <circle cx="256" cy="256" r="32" fill="#fff" />
            </svg>
          </span>
          <span className="text-2xl font-bold font-headline tracking-tight text-tech-blue-deep leading-none">Hyrde</span>
        </Link>

        <div className="bg-white rounded-2xl border border-border-crisp shadow-sm p-8 md:p-10">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-electric-violet/10 mb-6">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "34px", fontVariationSettings: "'FILL' 1" }}>
              celebration
            </span>
          </span>

          <h1 className="text-2xl md:text-3xl font-bold font-headline text-tech-blue-deep mb-3">
            You&apos;re on the list!
          </h1>
          <p className="font-body text-on-surface-variant text-base leading-relaxed mb-6 max-w-md mx-auto">
            We&apos;ve got your details. Your AI agent is being set up to <strong className="text-tech-blue-deep">match you to the right jobs</strong> — no bidding, no proposals, ever.
          </p>

          <div className="bg-surface-gray rounded-xl border border-border-crisp p-4 mb-7 text-left">
            <p className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest mb-3">What happens next</p>
            <ol className="space-y-2.5">
              {[
                "We review your signup — usually within one business day.",
                "A founding-team member emails you to activate your profile.",
                "Your AI agent starts pitching you to matching briefs automatically.",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-electric-violet text-white text-[11px] font-bold font-body flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm font-body text-on-surface leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-tech-blue-deep text-white font-semibold font-body text-sm px-6 py-3 rounded-full hover:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
            Back to home
          </Link>
        </div>

        <p className="text-xs font-body text-on-surface-variant mt-6">
          Questions? Email <span className="font-semibold text-tech-blue-deep">hello@hyrde.com</span>
        </p>
      </div>
    </div>
  );
}
