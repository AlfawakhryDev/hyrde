"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

// ── Task-scoped chat between client and pilot ────────────────────────────────
// Private to the two parties on the task (enforced by RLS), realtime, and
// on-platform — scope talk stays attached to the work it's about.

interface Message {
  id: string;
  task_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TaskChat({
  taskId,
  userId,
  posterId,
}: {
  taskId: string;
  userId: string;
  posterId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listEnd = useRef<HTMLDivElement | null>(null);
  const loaded = useRef(false);

  const fetchAll = useCallback(async () => {
    const { data } = await supabaseBrowser()
      .from("messages")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true })
      .limit(200);
    if (data) setMessages(data as Message[]);
    loaded.current = true;
  }, [taskId]);

  useEffect(() => {
    fetchAll();
    const supabase = supabaseBrowser();
    const channel = supabase
      .channel(`chat-${taskId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `task_id=eq.${taskId}` },
        payload => {
          const m = payload.new as Message;
          setMessages(prev => (prev.some(x => x.id === m.id) ? prev : [...prev, m]));
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [taskId, fetchAll]);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    const { data, error } = await supabaseBrowser()
      .from("messages")
      .insert({ task_id: taskId, sender_id: userId, body })
      .select()
      .single();
    if (error) {
      setError("Couldn't send. Try again.");
    } else if (data) {
      setMessages(prev => (prev.some(x => x.id === data.id) ? prev : [...prev, data as Message]));
      setDraft("");
    }
    setSending(false);
  }

  return (
    <section className="pt-10 mt-10 border-t border-border-crisp">
      <h2 className="text-[13px] font-medium text-on-surface-variant mb-5">
        Messages. Private between you and the other party
      </h2>

      <div className="bg-surface-container-low rounded-2xl overflow-hidden">
        {/* Thread */}
        <div className="max-h-[360px] min-h-[120px] overflow-y-auto p-4 space-y-2.5">
          {messages.length === 0 && loaded.current && (
            <p className="text-[13px] text-on-surface-variant text-center py-6">
              No messages yet. Align on scope, deadlines, or details here. Everything stays attached to the task.
            </p>
          )}
          {messages.map(m => {
            const mine = m.sender_id === userId;
            const label = mine ? "You" : m.sender_id === posterId ? "Client" : "Pilot";
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${
                  mine
                    ? "bg-electric-violet text-white rounded-br-md"
                    : "bg-surface-container border border-border-crisp text-on-surface rounded-bl-md"
                }`}>
                  <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-0.5 ${mine ? "text-white/70" : "text-on-surface-variant"}`}>
                    {label} · {timeLabel(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={listEnd} />
        </div>

        {/* Composer */}
        <div className="flex items-end gap-2 border-t border-border-crisp p-3">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            rows={1}
            placeholder="Write a message… (Enter to send)"
            className="flex-1 bg-surface-bright border border-border-crisp rounded-lg px-3.5 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-electric-violet resize-none"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-electric-violet text-white hover:opacity-90 transition disabled:opacity-40"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
          </button>
        </div>
        {error && <p className="text-[13px] text-error px-4 pb-3">{error}</p>}
      </div>
    </section>
  );
}
