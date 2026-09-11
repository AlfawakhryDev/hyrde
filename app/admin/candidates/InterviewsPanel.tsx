"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Every interview a candidate sat, readable by an admin ────────────
// Transcripts and assessments are deliberately not column-granted to
// `authenticated`, so this cannot be a plain select — granting them would hand
// every passed candidate's answers to every signed-in user through the public
// vettings policy. It reads through admin_candidate_interviews() instead,
// which returns nothing to a non-admin.
//
// Unfinished and abandoned attempts are shown too. Where candidates stop says
// more about the interview than a pass does.

type Turn = { q: string; a?: string; askedAt?: string };
type Assessment = {
  score?: number; band?: string; summary?: string;
  strengths?: string[]; growthAreas?: string[]; verifiedSkills?: string[];
};
type Interview = {
  id: string; category: string; status: string; score: number | null; band: string | null;
  mode: string | null; locale: string | null; created_at: string; completed_at: string | null;
  transcript: Turn[] | null; assessment: Assessment | null;
};

const STATUS: Record<string, { label: string; cls: string }> = {
  passed:      { label: "Passed",     cls: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400" },
  failed:      { label: "Failed",     cls: "bg-error/10 text-error" },
  in_progress: { label: "Unfinished", cls: "bg-amber-500/12 text-amber-700 dark:text-amber-400" },
  abandoned:   { label: "Abandoned",  cls: "bg-surface-container text-on-surface-variant" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

export default function InterviewsPanel({ userId }: { userId: string }) {
  const [rows, setRows] = useState<Interview[] | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  // vetting id → question number → signed URL. Recordings are stored as
  // <user>/<vetting>/q<n>.<ext>, with n counting from 1 in asking order.
  const [clips, setClips] = useState<Record<string, Record<number, string>>>({});

  useEffect(() => {
    let live = true;
    supabaseBrowser()
      .rpc("admin_candidate_interviews", { p_user: userId })
      .then(({ data, error }) => {
        if (!live) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as Interview[]);
      });
    return () => { live = false; };
  }, [userId]);

  async function toggle(v: Interview) {
    const next = open === v.id ? null : v.id;
    setOpen(next);
    if (!next || v.mode !== "video" || clips[v.id]) return;

    // Signed, short-lived URLs: the bucket is private and should stay that way.
    const store = supabaseBrowser().storage.from("interview-recordings");
    const folder = `${userId}/${v.id}`;
    const { data: files } = await store.list(folder);
    const byQ: Record<number, string> = {};
    if (files?.length) {
      const { data: signed } = await store.createSignedUrls(files.map(f => `${folder}/${f.name}`), 3600);
      for (const s of signed ?? []) {
        const n = s.path?.match(/\/q(\d+)\.\w+$/)?.[1];
        if (n && s.signedUrl) byQ[Number(n)] = s.signedUrl;
      }
    }
    setClips(c => ({ ...c, [v.id]: byQ }));
  }

  if (error) return <p className="text-[12.5px] text-error mt-3">{error}</p>;
  if (!rows) return <p className="text-[12.5px] text-on-surface-variant mt-3">Loading interviews…</p>;
  if (!rows.length) return <p className="text-[12.5px] text-on-surface-variant mt-3">No interviews.</p>;

  return (
    <div className="mt-4 rounded-xl border border-border-crisp divide-y divide-border-crisp overflow-hidden">
      {rows.map(v => {
        const s = STATUS[v.status] ?? { label: v.status, cls: "bg-surface-container text-on-surface-variant" };
        const turns = Array.isArray(v.transcript) ? v.transcript : [];
        const answered = turns.filter(t => t.a).length;
        const isOpen = open === v.id;
        return (
          <div key={v.id}>
            <button
              onClick={() => toggle(v)}
              aria-expanded={isOpen}
              className="w-full flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 py-3 text-start hover:bg-surface-container-low transition-colors"
            >
              <span className="text-[13.5px] font-medium text-on-surface">{v.category}</span>
              <span className="text-[12px] text-on-surface-variant">
                {v.mode === "video" ? "Video" : "Text"}
                {v.locale === "ar" ? " · Arabic" : ""} · {when(v.created_at)}
              </span>
              <span className="text-[12px] text-on-surface-variant tabular-nums">
                {answered}/{turns.length} answered
              </span>
              <span className="flex-1" />
              {v.score != null && (
                <span className="text-[12.5px] text-on-surface tabular-nums">
                  {v.score}{v.band ? ` · ${v.band}` : ""}
                </span>
              )}
              <span className={`text-[11.5px] font-medium px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "18px" }} aria-hidden="true">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-5 pt-2 bg-surface-container-low space-y-5">
                <ol className="space-y-4">
                  {turns.map((t, i) => {
                    const clip = clips[v.id]?.[i + 1];
                    return (
                      <li key={i} className="text-[13px] leading-relaxed">
                        <p className="text-on-surface-variant">
                          <span className="tabular-nums">Q{i + 1}.</span> {t.q}
                        </p>
                        {t.a
                          ? <p className="text-on-surface mt-1 whitespace-pre-wrap">{t.a}</p>
                          : <p className="text-on-surface-variant italic mt-1">Not answered.</p>}
                        {v.mode === "video" && t.a && (
                          clip
                            ? <video src={clip} controls preload="none" className="mt-2 w-full max-w-[420px] rounded-lg bg-black" />
                            : clips[v.id] && (
                                <p className="text-[12px] text-on-surface-variant mt-1">No recording stored for this answer.</p>
                              )
                        )}
                      </li>
                    );
                  })}
                </ol>

                {v.assessment && (
                  <div className="border-t border-border-crisp pt-4 space-y-3">
                    {v.assessment.summary && (
                      <p className="text-[13px] text-on-surface leading-relaxed">{v.assessment.summary}</p>
                    )}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Items title="Verified" items={v.assessment.verifiedSkills} />
                      <Items title="Strengths" items={v.assessment.strengths} />
                      <Items title="To grow" items={v.assessment.growthAreas} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Items({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">{title}</p>
      <ul className="space-y-1">
        {items.map(x => <li key={x} className="text-[12.5px] text-on-surface leading-relaxed">{x}</li>)}
      </ul>
    </div>
  );
}
