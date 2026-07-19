"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Video answer recorder ─────────────────────────────────────────────────────
// Records the candidate on camera while transcribing their speech live in the
// browser (Web Speech API). The spoken transcript is what the AI grades; the
// recording is stored privately as proof. Speaking on camera is the anti-cheat:
// you can't paste a chatbot's answer into your own mouth.

/* eslint-disable @typescript-eslint/no-explicit-any */
type SpeechRec = any;

export function videoInterviewSupported(): boolean {
  if (typeof window === "undefined") return false;
  const hasSR = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  const hasMedia = typeof navigator.mediaDevices?.getUserMedia === "function" && typeof MediaRecorder !== "undefined";
  return hasSR && hasMedia;
}

function pickMime(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  for (const c of candidates) {
    try { if (MediaRecorder.isTypeSupported(c)) return c; } catch { /* ignore */ }
  }
  return "";
}

export default function VideoAnswer({
  questionIndex,
  submitting,
  interviewerSpeaking = false,
  autoRecordSignal = 0,
  onSubmit,
  onUnsupported,
}: {
  questionIndex: number;
  submitting: boolean;
  interviewerSpeaking?: boolean;
  autoRecordSignal?: number;
  onSubmit: (transcript: string, recording: Blob | null, mime: string) => void;
  onUnsupported: (reason: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const srRef = useRef<SpeechRec>(null);
  const recordingRef = useRef(false);
  const mimeRef = useRef<string>("");
  // Voice-activity turn-taking: mirror the transcript in a ref, and auto-end
  // the turn after the candidate goes quiet for a beat.
  const finalTextRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSubmitRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hushing, setHushing] = useState(false); // "you paused, sending…" window

  // How long a pause ends your turn. Long enough to think mid-answer, short
  // enough to feel like a real back-and-forth.
  const SILENCE_MS = 3200;

  // Acquire camera + mic once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, facingMode: "user" },
          audio: true,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      } catch {
        onUnsupported("Camera or microphone access was denied — you can continue with the text interview instead.");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      try { srRef.current?.stop(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset per question.
  useEffect(() => {
    setFinalText(""); setInterim(""); setBlob(null); setElapsed(0);
    finalTextRef.current = "";
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    setHushing(false);
  }, [questionIndex]);

  // Clear any pending silence timer on unmount.
  useEffect(() => () => { if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current); }, []);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const clearSilence = useCallback(() => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    setHushing(false);
  }, []);

  // End the turn automatically: stop recording and (via onstop) submit.
  const finishTurn = useCallback(() => {
    if (!recordingRef.current) return;
    autoSubmitRef.current = true;
    clearSilence();
    recordingRef.current = false;
    setRecording(false);
    setInterim("");
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    try { srRef.current?.stop(); } catch { /* ignore */ }
  }, [clearSilence]);

  // (Re)start the "gone quiet" countdown. Any speech calls this and resets it;
  // once the candidate has said something real and then stays silent, submit.
  const armSilence = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (!recordingRef.current || finalTextRef.current.trim().length < 25) { setHushing(false); return; }
    setHushing(true);
    silenceTimerRef.current = setTimeout(() => { setHushing(false); finishTurn(); }, SILENCE_MS);
  }, [finishTurn]);

  const startSR = useCallback(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    const sr = new Ctor();
    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = "en-US";
    sr.onresult = (e: any) => {
      let interimChunk = "";
      let sawSpeech = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        sawSpeech = true;
        if (r.isFinal) {
          finalTextRef.current = (finalTextRef.current + " " + r[0].transcript).trim();
          setFinalText(finalTextRef.current);
        } else interimChunk += r[0].transcript;
      }
      setInterim(interimChunk);
      // They're talking → cancel any pending auto-submit and rearm from now.
      if (sawSpeech) armSilence();
    };
    // Chrome stops recognition periodically — restart while still recording.
    sr.onend = () => { if (recordingRef.current) { try { sr.start(); } catch { /* ignore */ } } };
    sr.onerror = () => { /* transient; onend handles restart */ };
    try { sr.start(); } catch { /* ignore */ }
    srRef.current = sr;
  }, [armSilence]);

  function startRecording() {
    if (!streamRef.current) return;
    setFinalText(""); setInterim(""); setBlob(null); setElapsed(0);
    finalTextRef.current = ""; autoSubmitRef.current = false;
    clearSilence();
    chunksRef.current = [];
    const mime = pickMime();
    mimeRef.current = mime;
    try {
      const rec = mime
        ? new MediaRecorder(streamRef.current, { mimeType: mime })
        : new MediaRecorder(streamRef.current);
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const b = new Blob(chunksRef.current, { type: mimeRef.current || "video/webm" });
        setBlob(b);
        // If the turn ended because the candidate went quiet, submit for them.
        if (autoSubmitRef.current) {
          autoSubmitRef.current = false;
          const t = finalTextRef.current.trim();
          if (t.length >= 25) onSubmitRef.current(t, b, mimeRef.current || "video/webm");
        }
      };
      rec.start(1000);
      recorderRef.current = rec;
      recordingRef.current = true;
      setRecording(true);
      startSR();
    } catch {
      onUnsupported("Recording couldn't start in this browser — continuing with the text interview.");
    }
  }

  function stopRecording() {
    autoSubmitRef.current = false; // manual stop → don't auto-submit
    clearSilence();
    recordingRef.current = false;
    setRecording(false);
    setInterim("");
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    try { srRef.current?.stop(); } catch { /* ignore */ }
  }

  // Hands-free turn-taking: when the interviewer finishes speaking (signal
  // bumps), open the mic automatically so the candidate can just answer.
  useEffect(() => {
    if (autoRecordSignal > 0 && ready && !recordingRef.current && !submitting) {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRecordSignal, ready]);

  const transcript = (finalText + (interim ? " " + interim : "")).trim();
  const mmss = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      {/* Camera */}
      <div className="relative bg-[#0A0A0B]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full aspect-video object-cover -scale-x-100"
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[13px] text-white/70">Waiting for camera access…</p>
          </div>
        )}
        {recording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-error animate-pulse" aria-hidden="true" />
            <span className="text-[12px] font-medium text-white tabular-nums">{mmss}</span>
          </div>
        )}
        {interviewerSpeaking && !recording && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
            <div className="flex items-center gap-2.5 bg-black/50 rounded-full px-4 py-2">
              <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                <span className="w-0.5 bg-white rounded-full animate-[vbar_0.9s_ease-in-out_infinite] h-2" />
                <span className="w-0.5 bg-white rounded-full animate-[vbar_0.9s_ease-in-out_0.15s_infinite] h-3.5" />
                <span className="w-0.5 bg-white rounded-full animate-[vbar_0.9s_ease-in-out_0.3s_infinite] h-2.5" />
              </span>
              <span className="text-[12.5px] font-medium text-white">Interviewer is speaking — listen, then answer</span>
            </div>
          </div>
        )}
      </div>

      {/* Live transcript */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[12px] text-on-surface-variant">
            Just talk — pause when you&apos;re done and the interviewer picks it up.
          </p>
          {recording && (
            <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium ${hushing ? "text-electric-violet" : "text-emerald-600 dark:text-emerald-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hushing ? "bg-electric-violet" : "bg-emerald-500 animate-pulse"}`} aria-hidden="true" />
              {hushing ? "You paused — sending…" : "Listening"}
            </span>
          )}
        </div>
        <div className="min-h-[72px] max-h-[160px] overflow-y-auto rounded-xl bg-surface-bright px-4 py-3">
          {transcript ? (
            <p className="text-[13.5px] text-on-surface leading-relaxed">
              {finalText}
              {interim && <span className="text-on-surface-variant"> {interim}</span>}
            </p>
          ) : (
            <p className="text-[13.5px] text-on-surface-variant/60">
              {recording ? "Listening… start talking whenever you're ready." : "Answer out loud — it starts listening automatically after each question."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={!ready || submitting || interviewerSpeaking}
              className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {interviewerSpeaking ? "Interviewer speaking…" : blob || finalText ? "Answer again" : "Start answering"}
            </button>
          ) : (
            <>
              <button
                onClick={finishTurn}
                disabled={finalText.trim().length < 25}
                className="h-10 px-6 rounded-full bg-electric-violet text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
              >
                {submitting ? "Sending…" : "Send answer now"}
              </button>
              <button
                onClick={stopRecording}
                className="h-10 px-5 rounded-full border border-border-crisp text-sm font-medium text-on-surface-variant hover:text-on-surface transition"
              >
                Stop
              </button>
            </>
          )}

          <span className="text-[11.5px] text-on-surface-variant ml-auto">
            {recording
              ? "Or just stop talking — I'll pick it up automatically."
              : finalText.trim().length > 0 && finalText.trim().length < 25
              ? "Say a little more — a couple of sentences minimum."
              : "Specifics beat polish. Filler words are fine."}
          </span>
        </div>
      </div>
    </div>
  );
}
