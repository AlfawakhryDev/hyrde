"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "./I18nProvider";

// ── The verification wall ────────────────────────────────────────────
// Signup returns a session immediately, but the proxy will not let an
// unconfirmed address past /verify, so this card is the whole gate.
//
// It asks for the code itself rather than signup doing it: at signup the
// request raced the auth cookie and was fire-and-forget, so failures were
// invisible, and it never ran for social sign-ins at all. By the time this
// mounts the page has been server-rendered from a valid session.
//
// The send is idempotent server side — a live code is left alone — so a reload
// cannot invalidate the digits someone is halfway through typing.

export default function VerifyEmailCard({ email, next }: { email: string; next: string }) {
  const t = useT();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  // Message *keys*, not translated text. The mount effect captures its `t` from
  // the first render, which can still be English before the locale cookie has
  // been applied — storing the key and translating at render time keeps the
  // message in the reader's language, and re-translates it if they switch.
  const [noteKey, setNoteKey] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const asked = useRef(false);

  async function send(resend: boolean) {
    setErrorKey("");
    if (resend) { setBusy(true); setNoteKey(""); }
    try {
      const res = await fetch("/api/verify/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend }),
      });
      const data = await res.json();
      // The route answers in English; the reader may not be reading English.
      if (!res.ok) { setErrorKey("verify.errSend"); return; }
      setNoteKey(data.pending ? "verify.pending" : "verify.sentAgain");
    } catch {
      setErrorKey("verify.errNet");
    } finally {
      if (resend) setBusy(false);
    }
  }

  // Strict Mode mounts twice in dev; the ref keeps that to one request.
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void send(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirm() {
    setBusy(true); setErrorKey("");
    try {
      const res = await fetch("/api/verify/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        const why: Record<string, string> = {
          invalid: "verify.reasonInvalid", expired: "verify.reasonExpired",
          too_many: "verify.reasonTooMany", none: "verify.reasonNone",
        };
        setErrorKey(why[data.reason] ?? "verify.errGeneric");
        return;
      }
      // The gate reads the database, so the server has to see the new row.
      router.replace(next);
      router.refresh();
    } catch {
      setErrorKey("verify.errNet");
    } finally {
      setBusy(false);
    }
  }

  // Typo'd the address at signup? Without this they are locked out for good.
  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.push("/signup");
  }

  return (
    <div className="rounded-2xl border border-border-crisp bg-surface-bright p-6 md:p-8">
      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "26px" }}>mark_email_unread</span>
      <h1 className="text-[26px] font-light tracking-[-0.03em] text-on-surface mt-3 mb-2">
        {t("verify.title")}
      </h1>
      <p className="text-[14px] text-on-surface-variant leading-relaxed mb-1">
        {t("verify.sentTo")} <span className="font-medium text-on-surface">{email}</span>
      </p>
      <p className="text-[13px] text-on-surface-variant mb-6">{t("verify.expires")}</p>

      <form onSubmit={e => { e.preventDefault(); void confirm(); }}>
        <input
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          placeholder="000000"
          aria-label={t("verify.label")}
          dir="ltr"
          className="w-full border border-border-crisp rounded-xl px-4 py-3 text-[24px] tracking-[0.4em] text-center font-mono text-on-surface bg-surface-bright focus:outline-none focus:border-on-surface"
        />
        <button
          type="submit"
          disabled={busy || code.length !== 6}
          className="w-full mt-3 h-11 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {busy ? t("verify.checking") : t("verify.confirm")}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
        <button
          onClick={() => send(true)}
          disabled={busy}
          className="text-[13px] text-on-surface-variant hover:text-on-surface underline underline-offset-2 disabled:opacity-60"
        >
          {busy ? t("verify.sending") : t("verify.resend")}
        </button>
        <button
          onClick={signOut}
          className="text-[13px] text-on-surface-variant hover:text-on-surface underline underline-offset-2"
        >
          {t("verify.wrongEmail")}
        </button>
      </div>

      {noteKey && <p className="text-[13px] text-on-surface-variant mt-4">{t(noteKey)}</p>}
      {errorKey && <p className="text-[13px] text-error mt-4">{t(errorKey)}</p>}
    </div>
  );
}
