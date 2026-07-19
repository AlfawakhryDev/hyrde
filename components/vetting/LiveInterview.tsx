"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import type { VettingAssessment } from "@/lib/vetting";

type Turn = { role: "agent" | "candidate"; text: string };
type Verdict = { passed: boolean; assessment: VettingAssessment };

// ── Live voice interview (ElevenLabs Conversational AI) ────────────────────────
// A real-time, full-duplex spoken interview: the agent talks in a neural voice,
// listens continuously, and can be interrupted (barge-in) — all handled by the
// SDK over a signed WebSocket. We capture the transcript and grade it at the end.
function LiveInner({
  signedUrl,
  vettingId,
  category,
  onComplete,
  onError,
}: {
  signedUrl: string;
  vettingId: string;
  category: string;
  onComplete: (v: Verdict) => void;
  onError: (reason: string) => void;
}) {
  const turnsRef = useRef<Turn[]>([]);
  const finishingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<"idle" | "connecting" | "live" | "grading">("idle");
  const [captions, setCaptions] = useState<Turn[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [orb, setOrb] = useState(1); // scale, reacts to whoever is talking

  const conversation = useConversation({
    onConnect: () => {
      setPhase("live");
      // Tell the agent which category to interview on (no dashboard vars needed).
      try {
        conversation.sendContextualUpdate(
          `This candidate is being vetted for the "${category}" category. Tailor every question specifically to ${category}. Begin the interview now.`,
        );
      } catch { /* ignore */ }
    },
    onMessage: ({ message, source }: { message: string; source: "user" | "ai" }) => {
      const t: Turn = { role: source === "ai" ? "agent" : "candidate", text: message };
      if (!t.text.trim()) return;
      turnsRef.current = [...turnsRef.current, t];
      setCaptions(turnsRef.current.slice(-4));
    },
    onDisconnect: () => { void finish(); },
    onError: (msg: string) => {
      if (finishingRef.current) return;
      onError(msg || "The live interview dropped — you can use the text interview instead.");
    },
  });

  // Grade once the conversation ends (agent wrapped up, user ended, or dropped).
  const finish = useCallback(async () => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try { conversation.endSession(); } catch { /* ignore */ }
    setPhase("grading");
    try {
      const res = await fetch("/api/vet/live-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vettingId, turns: turnsRef.current }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? "Couldn't grade the interview."); return; }
      onComplete({ passed: data.passed, assessment: data.assessment });
    } catch {
      onError("Lost connection while grading — try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vettingId]);

  // Elapsed timer + a safety auto-end so a stuck call can't run forever.
  useEffect(() => {
    if (phase !== "live") return;
    const id = setInterval(() => setElapsed(e => {
      const n = e + 1;
      if (n >= 12 * 60) void finish(); // 12-minute hard cap
      return n;
    }), 1000);
    return () => clearInterval(id);
  }, [phase, finish]);

  // Volume-reactive orb.
  useEffect(() => {
    if (phase !== "live") return;
    const tick = () => {
      try {
        const out = conversation.getOutputVolume?.() ?? 0; // agent
        const inp = conversation.getInputVolume?.() ?? 0;   // candidate
        setOrb(1 + Math.min(0.6, Math.max(out, inp) * 1.4));
      } catch { /* ignore */ }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase, conversation]);

  useEffect(() => () => { try { conversation.endSession(); } catch { /* ignore */ } }, [conversation]);

  function begin() {
    setPhase("connecting");
    try {
      conversation.startSession({ signedUrl, connectionType: "websocket" });
    } catch {
      onError("Couldn't reach the microphone — you can use the text interview instead.");
    }
  }

  const agentTalking = conversation.isSpeaking;
  const mmss = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  if (phase === "idle") {
    return (
      <div className="rounded-2xl bg-surface-container-low p-8 text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-electric-violet/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "34px" }}>graphic_eq</span>
        </div>
        <h3 className="text-[19px] font-semibold text-on-surface mb-1.5">Live voice interview</h3>
        <p className="text-[13.5px] text-on-surface-variant leading-relaxed max-w-[420px] mx-auto mb-6">
          A real conversation — the interviewer talks with you, listens as you speak, and you can
          jump in any time. Four questions, ~7 minutes. Find a quiet spot.
        </p>
        <button
          onClick={begin}
          className="h-11 px-7 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition"
        >
          Begin — allow microphone
        </button>
      </div>
    );
  }

  if (phase === "grading") {
    return (
      <div className="rounded-2xl bg-surface-container-low p-10 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-2 h-2 rounded-full bg-electric-violet animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
        <p className="text-[15px] font-medium text-on-surface">Scoring your interview…</p>
        <p className="text-[13px] text-on-surface-variant mt-1">Reading the whole conversation against the rubric.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0A0A0B] overflow-hidden">
      <div className="relative flex flex-col items-center justify-center py-12 px-6">
        {/* Orb */}
        <div className="relative mb-8" style={{ transform: `scale(${orb})`, transition: "transform 80ms linear" }}>
          <div className={`w-28 h-28 rounded-full ${agentTalking ? "bg-electric-violet" : "bg-white/10"} transition-colors duration-300`}
            style={{ boxShadow: agentTalking ? "0 0 60px 8px rgba(91,79,207,0.55)" : "0 0 30px 2px rgba(255,255,255,0.08)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: "40px", fontVariationSettings: "'FILL' 1" }}>
              {agentTalking ? "graphic_eq" : "mic"}
            </span>
          </div>
        </div>

        <p className="text-[13px] font-medium text-white/80">
          {phase === "connecting" ? "Connecting…" : agentTalking ? "Interviewer is speaking" : "Listening — go ahead"}
        </p>
        <p className="text-[12px] text-white/40 mt-1 tabular-nums">{mmss} · {category}</p>

        {/* Live captions */}
        <div className="w-full max-w-[520px] mt-8 space-y-2 min-h-[96px]">
          {captions.map((t, i) => (
            <p key={i} className={`text-[13.5px] leading-relaxed ${t.role === "agent" ? "text-white/85" : "text-[#A99EE8]"} ${i === captions.length - 1 ? "opacity-100" : "opacity-45"}`}>
              <span className="text-[11px] uppercase tracking-wider mr-2 text-white/35">{t.role === "agent" ? "Interviewer" : "You"}</span>
              {t.text}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-9">
          <button
            onClick={() => finish()}
            className="h-10 px-6 rounded-full bg-white/10 border border-white/15 text-white text-sm font-medium hover:bg-white/15 transition"
          >
            End &amp; get my result
          </button>
        </div>
        <p className="text-[11.5px] text-white/35 mt-4">You can talk over the interviewer any time — it&apos;ll stop and listen.</p>
      </div>
    </div>
  );
}

export default function LiveInterview(props: {
  signedUrl: string;
  vettingId: string;
  category: string;
  onComplete: (v: Verdict) => void;
  onError: (reason: string) => void;
}) {
  return (
    <ConversationProvider>
      <LiveInner {...props} />
    </ConversationProvider>
  );
}
