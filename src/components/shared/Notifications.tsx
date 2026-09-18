"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "./I18nProvider";

// ── The bell ─────────────────────────────────────────────────────────
// Email already went out for matches and messages, but there was nowhere in
// the product to see that anything had happened — and for a Gulf client the
// inbox we mail is often not the one they watch.
//
// Opening the panel marks everything read. Per-item read state sounds tidier
// and in practice just leaves people with a number they cannot clear.

type Notif = {
  id: string; kind: string; title: string; body: string | null;
  url: string | null; read_at: string | null; created_at: string;
};

const ICON: Record<string, string> = {
  message: "chat_bubble",
  matched: "bolt",
  delivered: "task_alt",
  call: "event",
  progress: "trending_up",
};

function ago(iso: string, t: (k: string, v?: Record<string, string | number>) => string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t("notif.now");
  if (mins < 60) return t("notif.mAgo", { n: mins });
  const h = Math.round(mins / 60);
  if (h < 24) return t("notif.hAgo", { n: h });
  return t("notif.dAgo", { n: Math.round(h / 24) });
}

export default function Notifications() {
  const t = useT();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const supa = supabaseBrowser();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) { setSignedIn(false); return; }
    setSignedIn(true);
    const { data } = await supa
      .from("notifications")
      .select("id, kind, title, body, url, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(12);
    setItems((data ?? []) as Notif[]);
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- the loader awaits the network before it sets any state; the rule cannot see through the await. Load-then-subscribe is what effects are for.
  useEffect(() => { void load(); }, [load]);

  // Realtime where it works, a slow poll as the floor. Supabase realtime needs
  // the table added to a publication, and a bell that silently stops updating
  // is worse than one that lags a minute.
  useEffect(() => {
    if (!signedIn) return;
    const id = setInterval(() => { void load(); }, 60_000);
    return () => clearInterval(id);
  }, [signedIn, load]);

  // Click-away and Escape, because a panel you cannot dismiss is a trap.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const unread = items.filter(n => !n.read_at).length;

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter(n => !n.read_at).map(n => n.id);
      setItems(prev => prev.map(n => n.read_at ? n : { ...n, read_at: new Date().toISOString() }));
      await supabaseBrowser()
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", ids);
    }
  }

  if (!signedIn) return null;

  return (
    <div className="relative" ref={panel}>
      <button
        onClick={toggle}
        aria-label={t("notif.aria")}
        aria-expanded={open}
        className="relative w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>notifications</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-electric-violet text-white text-[10px] font-semibold flex items-center justify-center tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute end-0 mt-2 w-[320px] max-h-[70vh] overflow-y-auto rounded-2xl border border-border-crisp bg-surface-bright shadow-xl z-[80]">
          <div className="px-4 py-3 border-b border-border-crisp">
            <p className="text-[13px] font-semibold text-on-surface">{t("notif.title")}</p>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-[13px] text-on-surface-variant text-center">
              {t("notif.empty")}
            </p>
          ) : (
            <ul className="divide-y divide-border-crisp">
              {items.map(n => {
                const row = (
                  <div className="flex gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors">
                    <span
                      className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5"
                      style={{ fontSize: "17px" }}
                      aria-hidden="true"
                    >
                      {ICON[n.kind] ?? "circle_notifications"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-on-surface leading-snug">{n.title}</p>
                      {n.body && (
                        <p className="text-[12.5px] text-on-surface-variant leading-snug mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[11.5px] text-on-surface-variant/70 mt-1">{ago(n.created_at, t)}</p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.url
                      ? <Link href={n.url} onClick={() => setOpen(false)} className="block">{row}</Link>
                      : row}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
