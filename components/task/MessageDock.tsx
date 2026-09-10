"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import TaskChat from "@/components/task/TaskChat";
import { useT } from "@/components/I18nProvider";

// ── Messaging you can actually find ──────────────────────────────────
// The thread used to sit at the bottom of one task page, below the status,
// the deliverable and the payment block. Worse, a five milestone project meant
// five separate threads and no clue which one you last spoke in.
//
// So the conversation comes to wherever the person already is: a button on the
// project card in the dashboard, and a docked button on the task page. Both
// open the same panel, both show what is unread, and neither asks anyone to
// scroll to find out whether they were answered.
//
// A slide-over rather than a modal on purpose: the work stays on screen behind
// it, which is the whole point of talking about that work.

export default function MessageDock({
  taskId, userId, posterId, counterpartId, unread = 0, subtitle, variant = "inline",
}: {
  taskId: string;
  userId: string;
  posterId: string | null;
  counterpartId?: string | null;
  /** Unread message count for this task, counted by the parent in one query. */
  unread?: number;
  /** What the conversation is about — the project or milestone title. */
  subtitle?: string;
  /** "inline" sits in a row; "floating" docks to the corner of a page. */
  variant?: "inline" | "floating";
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Escape closes, and the page behind stops scrolling while it is open.
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const badge = unread > 0 && (
    <span className="min-w-[17px] h-[17px] px-1 rounded-full bg-electric-violet text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
      {unread > 9 ? "9+" : unread}
    </span>
  );

  const trigger = variant === "floating" ? (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      aria-label={t("chat.title")}
      className="fixed bottom-5 end-5 z-[60] h-12 ps-4 pe-5 rounded-full bg-on-surface text-inverse-on-surface shadow-xl flex items-center gap-2.5 hover:opacity-90 transition-opacity"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "19px" }}>chat_bubble</span>
      <span className="text-[13px] font-medium">{t("chat.title")}</span>
      {badge}
    </button>
  ) : (
    <button
      onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
      aria-label={t("chat.title")}
      className="h-8 ps-2.5 pe-3 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface hover:border-on-surface transition-colors flex items-center gap-1.5 shrink-0"
    >
      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>chat_bubble</span>
      {t("chat.title")}
      {badge}
    </button>
  );

  const panel = open && (
    <div
      className="fixed inset-0 z-[90] flex justify-end bg-black/40 backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label={t("chat.title")}
        className="w-full sm:max-w-[440px] h-full bg-surface-bright border-s border-border-crisp flex flex-col animate-[slideInRight_.22s_cubic-bezier(.2,.7,.2,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-3.5 border-b border-border-crisp">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-on-surface">{t("chat.title")}</p>
            {subtitle && (
              <p className="text-[12px] text-on-surface-variant truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("composer.close")}
            className="text-on-surface-variant hover:text-on-surface shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
          </button>
        </div>

        <TaskChat
          taskId={taskId}
          userId={userId}
          posterId={posterId}
          counterpartId={counterpartId}
          bare
        />
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
