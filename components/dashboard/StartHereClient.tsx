"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useT } from "@/components/I18nProvider";
import { PROJECT_TEMPLATES } from "@/components/dashboard/ProjectComposer";

// ── First run for a new client ───────────────────────────────────────
// The freelancer side gets StartHere; this is its counterpart. A client's
// first job is not to configure an account, it is to describe one piece of
// work — so the whole thing is that question, and answering it opens the
// composer already seeded.
//
// Skipping is a real option: some people arrive to look around, and a modal
// that traps them is worse than one they close.

const FEATURED = ["Mvp", "Social"] as const;

export default function StartHereClient({
  onPick, onClose,
}: {
  onPick: (seed: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rest = PROJECT_TEMPLATES.filter(id => !FEATURED.includes(id as typeof FEATURED[number]));

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
            {t("startClient.eyebrow")}
          </p>
          <button onClick={onClose} aria-label={t("composer.close")}
            className="text-on-surface-variant hover:text-on-surface -mt-1">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <h2 className="text-[24px] font-light tracking-[-0.03em] text-on-surface mb-1.5">
          {t("startClient.title")}
        </h2>
        <p className="text-[13.5px] text-on-surface-variant leading-relaxed mb-5">
          {t("startClient.body")}
        </p>

        <div className="flex flex-col gap-2.5 mb-4">
          {FEATURED.map(id => (
            <button
              key={id}
              onClick={() => onPick(t(`composer.tpl${id}Text`))}
              className="group text-left border border-border-crisp rounded-2xl p-4 hover:border-electric-violet/60 hover:bg-surface-container-low transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-on-surface">
                  {t(`composer.tpl${id}`)}
                </span>
                <span className="text-on-surface-variant/50 group-hover:text-on-surface group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-2">
          {t("startClient.orElse")}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {rest.map(id => (
            <button
              key={id}
              onClick={() => onPick(t(`composer.tpl${id}Text`))}
              className="h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:border-electric-violet hover:text-on-surface transition-colors"
            >
              {t(`composer.tpl${id}`)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-crisp pt-4">
          <button
            onClick={() => onPick("")}
            className="h-10 px-5 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 transition"
          >
            {t("startClient.describe")}
          </button>
          <button
            onClick={onClose}
            className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {t("startClient.later")}
          </button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(body, document.body) : null;
}
