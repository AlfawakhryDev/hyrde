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
  onSubmit,
  onUnsupported,
}: {
  questionIndex: number;
  submitting: boolean;
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

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0);

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
  }, [questionIndex]);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const startSR = useCallback(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    const sr = new Ctor();
    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = "en-US";
    sr.onresult = (e: any) => {
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) setFinalText(prev => (prev + " " + r[0].transcript).trim());
        else interimChunk += r[0].transcript;
      }
      setInterim(interimChunk);
    };
    // Chrome stops recognition periodically — restart while still recording.
    sr.onend = () => { if (recordingRef.current) { try { sr.start(); } catch { /* ignore */ } } };
    sr.onerror = () => { /* transient; onend handles restart */ };
    try { sr.start(); } catch { /* ignore */ }
    srRef.current = sr;
  }, []);

  function startRecording() {
    if (!streamRef.current) return;
    setFinalText(""); setInterim(""); setBlob(null); setElapsed(0);
    chunksRef.current = [];
    const mime = pickMime();
    mimeRef.current = mime;
    try {
      const rec = mime
        ? new MediaRecorder(streamRef.current, { mimeType: mime })
        : new MediaRecorder(streamRef.current);
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        setBlob(new Blob(chunksRef.current, { type: mimeRef.current || "video/webm" }));
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
    recordingRef.current = false;
    setRecording(false);
    setInterim("");
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    try { srRef.current?.stop(); } catch { /* ignore */ }
  }

  const transcript = (finalText + (interim ? " " + interim : "")).trim();
  const canSubmit = !recording && finalText.trim().length >= 25 && !submitting;
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
      </div>

      {/* Live transcript */}
      <div className="p-4">
        <p className="text-[12px] text-on-surface-variant mb-2">
          Live transcript — speak your answer; this is what the AI grades.
        </p>
        <div className="min-h-[72px] max-h-[160px] overflow-y-auto rounded-xl bg-surface-bright px-4 py-3">
          {transcript ? (
            <p className="text-[13.5px] text-on-surface leading-relaxed">
              {finalText}
              {interim && <span className="text-on-surface-variant"> {interim}</span>}
            </p>
          ) : (
            <p className="text-[13.5px] text-on-surface-variant/60">
              {recording ? "Listening…" : "Press Record, then answer out loud."}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          {!recording ? (
            <button
              onClick={startRecording}
              disabled={!ready || submitting}
              className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {blob || finalText ? "Re-record answer" : "Record answer"}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="h-10 px-6 rounded-full bg-error text-white text-sm font-medium hover:opacity-90 transition"
            >
              Stop recording
            </button>
          )}

          <button
            onClick={() => onSubmit(finalText.trim(), blob, mimeRef.current || "video/webm")}
            disabled={!canSubmit}
            className="h-10 px-6 rounded-full bg-electric-violet text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-40"
          >
            {submitting ? "Submitting…" : "Submit answer"}
          </button>

          <span className="text-[11.5px] text-on-surface-variant ml-auto">
            {!recording && finalText.trim().length > 0 && finalText.trim().length < 25
              ? "Say a little more — a couple of sentences minimum."
              : "Specifics beat polish. Filler words are fine."}
          </span>
        </div>
      </div>
    </div>
  );
}
