"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT, useLocale } from "@/components/I18nProvider";

// ── Task-scoped messaging ────────────────────────────────────────────
// Private to the two people on the task, enforced by RLS, and attached to the
// work it is about — so scope decisions live next to the brief rather than in
// someone's WhatsApp.
//
// Replaces the version in components/arena, which was untranslated, labelled
// people "Pilot" and "Client" instead of by name, and had no keyboard send.
// Sending inserts optimistically: the realtime echo is deduped by id, so the
// message appears instantly and does not double up when the socket answers.

type Message = {
  id: string; task_id: string; sender_id: string; body: string; created_at: string;
};

const MAX = 4000;

export default function TaskChat({
  taskId, userId, posterId, counterpartId, bare = false,
}: {
  taskId: string;
  userId: string;
  posterId: string | null;
  /** The other party. Null means nobody is matched yet. */
  counterpartId?: string | null;
  /** Drop the heading and outer border — the dock draws its own. */
  bare?: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const boxRef = useRef<HTMLTextAreaElement | null>(null);

  const isClient = userId === posterId;

  const load = useCallback(async () => {
    const supa = supabaseBrowser();
    const { data } = await supa
      .from("messages")
      .select("id, task_id, sender_id, body, created_at")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })
      .limit(300);
    setMessages((data ?? []) as Message[]);
    setLoaded(true);

    // Real names, not roles. "Pilot" is our word, not something a client says.
    const ids = [...new Set([userId, posterId, counterpartId].filter(Boolean))] as string[];
    if (ids.length) {
      const { data: profs } = await supa.from("profiles").select("id, display_name").in("id", ids);
      setNames(Object.fromEntries((profs ?? []).map(p => [p.id, p.display_name ?? ""])));
    }
  }, [taskId, userId, posterId, counterpartId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the loader awaits the network before it sets any state; the rule cannot see through the await. Load-then-subscribe is what effects are for.
    void load();
    const supa = supabaseBrowser();
    const channel = supa
      .channel(`chat-${taskId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `task_id=eq.${taskId}` },
        payload => {
          const m = payload.new as Message;
          setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        })
      .subscribe();
    return () => { void supa.removeChannel(channel); };
  }, [taskId, load]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }

  async function send() {
    const body = draft.trim().slice(0, MAX);
    if (!body || sending) return;
    setSending(true); setError("");
    const { data, error: err } = await supabaseBrowser()
      .from("messages")
      .insert({ task_id: taskId, sender_id: userId, body })
      .select("id, task_id, sender_id, body, created_at")
      .single();
    if (err) {
      setError(t("chat.errSend"));
    } else if (data) {
      const m = data as Message;
      setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
      setDraft("");
      if (boxRef.current) { boxRef.current.style.height = "auto"; }
    }
    setSending(false);
  }

  const time = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale === "ar" ? "ar-SA" : locale, { hour: "2-digit", minute: "2-digit" });
  const day = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-SA" : locale, { day: "numeric", month: "short" });

  const thread = (
    <>
      <div className={bare
        ? "flex-1 overflow-y-auto p-4 flex flex-col gap-2"
        : "max-h-[420px] min-h-[140px] overflow-y-auto p-4 flex flex-col gap-2"}>
          {loaded && messages.length === 0 && (
            <p className="text-[13px] text-on-surface-variant text-center py-8">{t("chat.empty")}</p>
          )}

          {messages.map((m, i) => {
            const mine = m.sender_id === userId;
            const newDay = i === 0 || day(m.created_at) !== day(messages[i - 1].created_at);
            const who = mine ? t("chat.you") : (names[m.sender_id] || "");
            return (
              <div key={m.id} className="flex flex-col gap-2">
                {newDay && (
                  <div className="flex items-center gap-3 my-1.5" aria-hidden="true">
                    <span className="h-px flex-1 bg-border-crisp" />
                    <span className="text-[11px] text-on-surface-variant">{day(m.created_at)}</span>
                    <span className="h-px flex-1 bg-border-crisp" />
                  </div>
                )}
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
                      mine
                        ? "bg-electric-violet text-white rounded-ee-md"
                        : "bg-surface-bright border border-border-crisp text-on-surface rounded-es-md"
                    }`}
                  >
                    <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                    <p className={`text-[10.5px] mt-1 ${mine ? "text-white/70" : "text-on-surface-variant"}`}>
                      {who ? `${who} · ` : ""}{time(m.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border-crisp bg-surface-bright p-2.5 flex items-end gap-2">
          <textarea
            ref={boxRef}
            value={draft}
            onChange={e => { setDraft(e.target.value.slice(0, MAX)); grow(e.target); }}
            // Enter sends, Shift+Enter breaks the line. On a phone the key is
            // a newline, so the button stays the real control.
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.placeholder")}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[13.5px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none max-h-[140px]"
          />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="h-9 px-4 rounded-full bg-on-surface text-inverse-on-surface text-[12.5px] font-medium hover:opacity-90 disabled:opacity-40 shrink-0"
        >
          {sending ? t("chat.sending") : t("chat.send")}
        </button>
      </div>
      {error && <p className="text-[12.5px] text-error px-4 pb-2">{error}</p>}
    </>
  );

  if (bare) return thread;

  return (
    <section className="pt-10 mt-10 border-t border-border-crisp">
      <h2 className="text-[15px] font-semibold text-on-surface">{t("chat.title")}</h2>
      <p className="text-[12.5px] text-on-surface-variant mt-0.5 mb-4">
        {t(isClient ? "chat.sub" : "chat.subClient")}
      </p>
      <div className="rounded-2xl border border-border-crisp overflow-hidden bg-surface-container-low">
        {thread}
      </div>
    </section>
  );
}
