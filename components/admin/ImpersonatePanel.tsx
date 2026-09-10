"use client";
import { useState } from "react";

// ── Support session control ──────────────────────────────────────────
// Deliberately unglamorous and slightly effortful: a purpose is required
// before the button does anything, because "why did you sign in as her on the
// 14th" is the question this feature has to be able to answer.
//
// The panel shows only what the server says is allowed. It decides nothing.

export default function ImpersonatePanel({
  targets,
}: {
  targets: { id: string; label: string }[];
}) {
  const [purpose, setPurpose] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState<{ url: string; who: string } | null>(null);

  async function start(targetId: string, label: string) {
    if (purpose.trim().length < 8) {
      setError("Say what the session is for first. It goes in the log.");
      return;
    }
    setBusy(targetId); setError(""); setLink(null);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId, purpose: purpose.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Refused."); return; }
      setLink({ url: data.actionLink, who: label });
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-12 rounded-2xl border border-amber-500/40 bg-amber-500/[0.05] p-5">
      <div className="flex items-start gap-2.5 mb-1">
        <span className="material-symbols-outlined text-amber-600 mt-0.5" style={{ fontSize: "18px" }}>
          visibility
        </span>
        <h2 className="text-[15px] font-semibold text-on-surface">Support session</h2>
      </div>
      <p className="text-[13px] text-on-surface-variant leading-relaxed mb-4 max-w-[62ch]">
        Signs you in <em>as</em> the account, for the pilot only. Anything you do is
        recorded against them, not you. Every attempt is logged, including refused ones.
      </p>

      <label className="block mb-3">
        <span className="block text-[11px] uppercase tracking-[0.14em] text-on-surface-variant mb-1.5">
          What is this for
        </span>
        <input
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          placeholder="e.g. posting the RZM milestone plan on her behalf"
          className="w-full border border-border-crisp rounded-lg px-3 py-2 text-[13.5px] text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => start(t.id, t.label)}
            disabled={busy !== null}
            className="h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90 disabled:opacity-50"
          >
            {busy === t.id ? "Issuing…" : `View as ${t.label}`}
          </button>
        ))}
      </div>

      {error && <p className="text-[12.5px] text-error mt-3">{error}</p>}

      {link && (
        <div className="mt-4 rounded-xl border border-border-crisp bg-surface-bright p-3.5">
          <p className="text-[12.5px] text-on-surface mb-2">
            One-time link for <strong>{link.who}</strong>. It signs you in as them and
            expires quickly. Open it in a private window so your own session survives.
          </p>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface hover:border-on-surface"
          >
            Open the session
            <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>open_in_new</span>
          </a>
        </div>
      )}
    </section>
  );
}
