"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Optional CV ──────────────────────────────────────────────────────
// Optional on purpose. The interview is what actually verifies skill, and
// gating on a CV would filter for people who keep one polished rather than
// people who can do the work. What a CV adds is context the interview cannot
// reach in ten minutes: years, domains, employers, a portfolio link.
//
// It is parsed on upload so the report can separate what the CV *claims* from
// what the interview *verified* — a distinction that is only possible if both
// exist.

const MAX_MB = 5;
const ACCEPT = ".pdf,.doc,.docx,.txt,.md";

export default function CvUpload() {
  const [existing, setExisting] = useState<{ filename: string; uploaded_at: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { setLoaded(true); return; }
      const { data } = await supa
        .from("candidate_cvs")
        .select("filename, uploaded_at")
        .order("uploaded_at", { ascending: false })
        .limit(1);
      setExisting(data?.[0] ?? null);
      setLoaded(true);
    })();
  }, []);

  async function upload(file: File) {
    setError("");
    if (file.size > MAX_MB * 1024 * 1024) { setError(`That file is over ${MAX_MB} MB.`); return; }
    setBusy(true);
    try {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { setError("Log in first."); return; }

      // The storage policy keys off the first path segment, so the folder must
      // be the uploader's own id.
      const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
      const { error: upErr } = await supa.storage.from("candidate-cvs").upload(path, file);
      if (upErr) { setError(upErr.message); return; }

      // Parsing is best effort: a stored CV a human can open still beats none.
      let parsed: unknown = null;
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/parse-cv", { method: "POST", body: fd });
        if (res.ok) parsed = await res.json();
      } catch { /* keep the file, skip the structure */ }

      const { error: insErr } = await supa.from("candidate_cvs").insert({
        user_id: user.id, storage_path: path, filename: file.name, bytes: file.size, parsed,
      });
      if (insErr) { setError(insErr.message); return; }
      setExisting({ filename: file.name, uploaded_at: new Date().toISOString() });
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return null;

  return (
    <div className="rounded-xl border border-border-crisp p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">
        CV or résumé · optional
      </p>
      <p className="text-[13px] text-on-surface-variant leading-relaxed mb-3">
        The interview decides whether you pass. A CV just adds the context it cannot
        cover in ten minutes — where you have worked, and for how long.
      </p>

      {existing ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: "18px" }}>description</span>
          <span className="text-[13.5px] text-on-surface">{existing.filename}</span>
          <label className="text-[12.5px] text-on-surface-variant hover:text-on-surface underline underline-offset-2 cursor-pointer">
            {busy ? "Uploading…" : "Replace"}
            <input type="file" accept={ACCEPT} className="hidden" disabled={busy}
              onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
          </label>
        </div>
      ) : (
        <label className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-border-crisp text-[13px] font-medium text-on-surface hover:border-electric-violet transition-colors cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: "17px" }}>upload_file</span>
          {busy ? "Uploading…" : "Attach a CV"}
          <input type="file" accept={ACCEPT} className="hidden" disabled={busy}
            onChange={e => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
        </label>
      )}

      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
    </div>
  );
}
