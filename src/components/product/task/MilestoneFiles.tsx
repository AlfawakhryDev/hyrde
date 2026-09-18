"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Files on a milestone ─────────────────────────────────────────────
// Either side can attach: the client drops in brand guides and references, the
// matched specialist attaches the deliverable. Optional everywhere.
//
// Links are SIGNED, not public. The task-files bucket used to be public and
// task_attachments carried `SELECT ... to public USING (true)`, so anyone with
// the anon key could enumerate every uploaded file on the platform and fetch
// it. Both are fixed; a URL is now minted on click, scoped to this viewer, and
// expires. Never reintroduce a hardcoded /object/public/ link here.

const MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED = /\.(pdf|png|jpe?g|webp|svg|gif|docx?|xlsx?|csv|txt|md|zip|pptx?|ai|psd|fig|sketch)$/i;

export type Attachment = {
  id: string; file_name: string; file_size: number | null; storage_path: string;
};

export default function MilestoneFiles({
  taskId, userId, initial, canUpload,
}: {
  taskId: string;
  userId: string;
  initial: Attachment[];
  /** Poster or matched specialist. Nobody else can attach to this milestone. */
  canUpload: boolean;
}) {
  const [files, setFiles] = useState<Attachment[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function open(a: Attachment) {
    setError("");
    const { data, error: e } = await supabaseBrowser()
      .storage.from("task-files")
      .createSignedUrl(a.storage_path, 60);
    if (e || !data) { setError("That file could not be opened."); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function upload(list: FileList | null) {
    if (!list?.length) return;
    setError("");
    const chosen = Array.from(list);

    const tooBig = chosen.find(f => f.size > MAX_BYTES);
    if (tooBig) { setError(`${tooBig.name} is over 25 MB.`); return; }
    const wrongType = chosen.find(f => !ALLOWED.test(f.name));
    if (wrongType) { setError(`${wrongType.name} is not a file type we accept.`); return; }

    setBusy(true);
    const supa = supabaseBrowser();
    const added: Attachment[] = [];
    for (const f of chosen) {
      // Path must start with the uploader's id: the storage delete policy keys off it.
      const path = `${userId}/${taskId}/${Date.now()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
      const { error: upErr } = await supa.storage.from("task-files").upload(path, f);
      if (upErr) { setError(`Could not upload ${f.name}.`); continue; }
      const { data: row } = await supa.from("task_attachments").insert({
        task_id: taskId, uploaded_by: userId, file_name: f.name,
        file_size: f.size, storage_path: path, mime_type: f.type || null,
      }).select("id, file_name, file_size, storage_path").single();
      if (row) added.push(row as Attachment);
    }
    setFiles(prev => [...prev, ...added]);
    setBusy(false);
  }

  return (
    <div>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {files.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => open(a)}
              className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface hover:border-outline transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>description</span>
              {a.file_name}
              {a.file_size ? <span className="text-on-surface-variant font-normal">{Math.round(a.file_size / 1024)} KB</span> : null}
            </button>
          ))}
        </div>
      )}

      {canUpload && (
        <label className="inline-flex items-center gap-2 h-8 px-3.5 rounded-full border border-dashed border-border-crisp text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface hover:border-outline transition-colors cursor-pointer">
          <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>attach_file</span>
          {busy ? "Uploading…" : files.length ? "Add another file" : "Attach a file"}
          <input type="file" multiple hidden disabled={busy} onChange={e => upload(e.target.files)} />
        </label>
      )}

      {error && <p className="text-[12.5px] text-error mt-2">{error}</p>}
      {canUpload && !files.length && !error && (
        <p className="text-[12px] text-on-surface-variant mt-2">
          Optional. Brand guides, copy, screenshots, anything the specialist should work from.
        </p>
      )}
    </div>
  );
}
