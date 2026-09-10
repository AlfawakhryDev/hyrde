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
  const [copied, setCopied] = useState(false);

  async function start(targetId: string, label: string) {
    if (purpose.trim().length < 8) {
      setError("Say what the session is for first. It goes in the log.");
      return;
    }
    setBusy(targetId); setError(""); setLink(null); setCopied(false);
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
            expires quickly. Copy it into a private window — opening it here replaces
            your own session, and you would have to sign back in to end the support one.
          </p>
          {/* The link itself, not just a button wrapping it. Opening it in this
              window signs you out of your own account, which is exactly what
              you do not want while supporting someone — so copying it into a
              private window is the normal path, and gets the primary button. */}
          <input
            readOnly
            value={link.url}
            onFocus={e => e.currentTarget.select()}
            className="w-full mb-2 border border-border-crisp rounded-lg px-3 py-2 text-[12px] font-mono text-on-surface-variant bg-surface truncate focus:outline-none focus:border-on-surface"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link.url);
                  setCopied(true);
                } catch {
                  // Clipboard refused (permissions, or an insecure origin).
                  // The field above is selectable, so say so rather than
                  // pretending the copy worked.
                  setError("Could not copy. Select the link above and copy it.");
                }
              }}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90"
            >
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Copied — paste in a private window" : "Copy link"}
            </button>
            <a
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full border border-border-crisp text-[12.5px] font-medium text-on-surface hover:border-on-surface"
            >
              Open here instead
              <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>open_in_new</span>
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
