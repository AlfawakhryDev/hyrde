"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, CATEGORY_JOB_KEY } from "@/lib/arena";
import { useT } from "@/components/I18nProvider";
import CvUpload from "@/components/vetting/CvUpload";

// ── First run for a new freelancer ───────────────────────────────────
// They arrive here straight from signup and previously met a flat grid of
// seven equal categories plus two separate optional cards, with no indication
// of what to do first. This is the same three steps in the order they
// actually happen: what you do, what you can show us, then the interview.
//
// Social media and software engineering lead because that is the demand we
// have right now. The rest stay one tap away — promoting two roles is not the
// same as hiding the others.
//
// Portalled to <body> for the reason BookDemo is: an ancestor with
// backdrop-filter captures a fixed overlay and pins it to the wrong box.

const FEATURED = ["Social media", "Development"] as const;

export default function StartHere({
  onPick, onClose,
}: {
  onPick: (category: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [step, setStep] = useState<"role" | "cv">("role");
  const [picked, setPicked] = useState<string | null>(null);
  // The portal cannot exist during SSR, so render nothing on the first pass on
  // BOTH sides. Returning null on the server and a portal on the client is a
  // hydration mismatch — BookDemo dodges it only because it starts closed.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rest = CATEGORIES.filter(c => !FEATURED.includes(c as typeof FEATURED[number]));

  const body = (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-surface-bright border border-border-crisp rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 app-sheet overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-1">
          <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant">
            {t(step === "role" ? "start.step1" : "start.step2")}
          </p>
          <button onClick={onClose} aria-label={t("composer.close")} className="text-on-surface-variant hover:text-on-surface -mt-1">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        {step === "role" ? (
          <>
            <h2 className="text-[24px] font-light tracking-[-0.03em] text-on-surface mb-1.5">
              {t("start.whatDoYouDo")}
            </h2>
            <p className="text-[13.5px] text-on-surface-variant leading-relaxed mb-5">
              {t("start.whatBody")}
            </p>

            <div className="flex flex-col gap-2.5 mb-4">
              {FEATURED.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setPicked(cat); setStep("cv"); }}
                  className="group text-left border border-border-crisp rounded-2xl p-4 hover:border-electric-violet/60 hover:bg-surface-container-low transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[15px] font-semibold text-on-surface">
                        {t(`job.${CATEGORY_JOB_KEY[cat]}`)}
                      </span>
                      <span className="block text-[12.5px] text-on-surface-variant mt-0.5">
                        {t("start.hiringNow")}
                      </span>
                    </div>
                    <span className="text-on-surface-variant/50 group-hover:text-on-surface group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-2">
              {t("start.orElse")}
            </p>
            <div className="flex flex-wrap gap-2">
              {rest.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setPicked(cat); setStep("cv"); }}
                  className="h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:border-electric-violet hover:text-on-surface transition-colors"
                >
                  {t(`job.${CATEGORY_JOB_KEY[cat]}`)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[24px] font-light tracking-[-0.03em] text-on-surface mb-1.5">
              {t("start.showUs")}
            </h2>
            <p className="text-[13.5px] text-on-surface-variant leading-relaxed mb-5">
              {t("start.showBody")}
            </p>

            <CvUpload />

            <div className="flex flex-wrap items-center gap-2.5 mt-6">
              <button
                onClick={() => picked && onPick(picked)}
                className="h-11 flex-1 min-w-[180px] rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition"
              >
                {t("start.startInterview", { role: picked ? t(`job.${CATEGORY_JOB_KEY[picked]}`) : "" })}
              </button>
              <button
                onClick={() => setStep("role")}
                className="h-11 px-4 text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                {t("vet.back")}
              </button>
            </div>
            <p className="text-[12px] text-on-surface-variant mt-3">
              {t("start.duration")}
            </p>
          </>
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(body, document.body) : null;
}
