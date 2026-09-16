"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/components/I18nProvider";

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

// How long a pause ends your turn, how much speech counts as a real answer,
// and how loud a frame has to be to count as speech at all.
const SILENCE_MS = 3200;
const MIN_SPEECH_MS = 2500;
const VAD_TICK_MS = 150;
const SPEECH_RMS = 0.015;

// The browser recogniser has to be told which language to expect. It defaults
// to English, and then hears nothing at all when the answer is in Arabic. Most
// candidates are Egyptian; Chrome falls back to generic Arabic for the rest.
const SR_LANG: Record<string, string> = { en: "en-US", de: "de-DE", ar: "ar-EG" };

export type Answer = { transcript: string; video: Blob | null; mime: string; audio: Blob | null };

function pickAudioMime(): string {
  for (const c of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    try { if (MediaRecorder.isTypeSupported(c)) return c; } catch { /* ignore */ }
  }
  return "";
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
  locale,
  interviewerSpeaking = false,
  autoRecordSignal = 0,
  onSubmit,
  onUnsupported,
}: {
  questionIndex: number;
  submitting: boolean;
  locale: string;
  interviewerSpeaking?: boolean;
  autoRecordSignal?: number;
  onSubmit: (answer: Answer) => void;
  onUnsupported: (reason: string) => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const srRef = useRef<SpeechRec>(null);
  const recordingRef = useRef(false);
  const mimeRef = useRef<string>("");
  // A second, audio-only recording. The video is the anti-cheat record; this is
  // what gets transcribed — roughly 50 KB a minute, so it uploads on a weak
  // connection and stays well under the serverless request limit.
  const audioRecRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioMimeRef = useRef<string>("");
  // Both recorders stop together; whichever flushes last submits the turn.
  const partsRef = useRef<{ video: Blob | null; mime: string; audio: Blob | null; left: number }>({ video: null, mime: "", audio: null, left: 0 });
  // Voice activity measured from the microphone itself, not from whatever the
  // recogniser managed to understand.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spokeMsRef = useRef(0);
  const lastLoudRef = useRef(0);
  const spokeRef = useRef(false);
  // Voice-activity turn-taking: mirror the transcript in a ref, and auto-end
  // the turn after the candidate goes quiet for a beat.
  const finalTextRef = useRef("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSubmitRef = useRef(false);
  const onSubmitRef = useRef(onSubmit);
  // Kept current after every render; read later by the recorder's callbacks.
  useEffect(() => { onSubmitRef.current = onSubmit; }, [onSubmit]);

  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [finalText, setFinalText] = useState("");
  const [interim, setInterim] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [hushing, setHushing] = useState(false); // "you paused, sending…" window
  const [spoke, setSpoke] = useState(false);     // enough speech to send

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
        onUnsupported("Camera or microphone access was denied. You can continue with the text interview instead.");
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      try { srRef.current?.stop(); } catch { /* ignore */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset per question. State is reset while rendering, React's pattern for
  // "adjust state when a prop changes"; the refs and the timer, which are not
  // rendered, are cleared in the effect.
  const [answering, setAnswering] = useState(questionIndex);
  if (answering !== questionIndex) {
    setAnswering(questionIndex);
    setFinalText(""); setInterim(""); setBlob(null); setElapsed(0); setHushing(false); setSpoke(false);
  }
  useEffect(() => {
    finalTextRef.current = "";
    spokeRef.current = false; spokeMsRef.current = 0;
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
  }, [questionIndex]);

  // Clear any pending timers on unmount.
  useEffect(() => () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (vadTimerRef.current) clearInterval(vadTimerRef.current);
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
  }, []);

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

  const stopVad = useCallback(() => {
    if (vadTimerRef.current) { clearInterval(vadTimerRef.current); vadTimerRef.current = null; }
    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    audioCtxRef.current = null;
  }, []);

  // End the turn: stop both recorders, and submit once they have both flushed.
  const finishTurn = useCallback(() => {
    if (!recordingRef.current) return;
    autoSubmitRef.current = true;
    clearSilence();
    stopVad();
    recordingRef.current = false;
    setRecording(false);
    setInterim("");
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    try { audioRecRef.current?.stop(); } catch { /* ignore */ }
    try { srRef.current?.stop(); } catch { /* ignore */ }
  }, [clearSilence, stopVad]);

  const finishTurnRef = useRef(finishTurn);
  useEffect(() => { finishTurnRef.current = finishTurn; }, [finishTurn]);

  // Listen to the microphone, not to the recogniser. The turn ends when someone
  // has actually spoken and then gone quiet, which works the same in Arabic, in
  // German, and in a browser that transcribes nothing at all.
  const startVad = useCallback((stream: MediaStream) => {
    stopVad();
    spokeMsRef.current = 0;
    spokeRef.current = false;
    lastLoudRef.current = Date.now();
    let ctx: AudioContext;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new Ctor();
    } catch { return; }
    audioCtxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.fftSize);
    vadTimerRef.current = setInterval(() => {
      analyser.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
      const now = Date.now();
      if (Math.sqrt(sum / buf.length) > SPEECH_RMS) {
        lastLoudRef.current = now;
        spokeMsRef.current += VAD_TICK_MS;
        if (!spokeRef.current && spokeMsRef.current >= MIN_SPEECH_MS) { spokeRef.current = true; setSpoke(true); }
        setHushing(false);
        return;
      }
      if (!spokeRef.current) return;
      const quiet = now - lastLoudRef.current;
      if (quiet >= SILENCE_MS) { setHushing(false); finishTurnRef.current(); }
      else if (quiet >= SILENCE_MS / 2) setHushing(true);
    }, VAD_TICK_MS);
  }, [stopVad]);

  const startSR = useCallback(() => {
    const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Ctor) return;
    const sr = new Ctor();
    sr.continuous = true;
    sr.interimResults = true;
    sr.lang = SR_LANG[locale] ?? "en-US";
    // Only a live preview now. The graded transcript comes from the server.
    sr.onresult = (e: any) => {
      let interimChunk = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalTextRef.current = (finalTextRef.current + " " + r[0].transcript).trim();
          setFinalText(finalTextRef.current);
        } else interimChunk += r[0].transcript;
      }
      setInterim(interimChunk);
    };
    // Chrome stops recognition periodically — restart while still recording.
    sr.onend = () => { if (recordingRef.current) { try { sr.start(); } catch { /* ignore */ } } };
    sr.onerror = () => { /* transient; onend handles restart */ };
    try { sr.start(); } catch { /* ignore */ }
    srRef.current = sr;
  }, [locale]);

  function submitIfReady() {
    const p = partsRef.current;
    if (p.left > 0 || !autoSubmitRef.current) return;
    autoSubmitRef.current = false;
    if (!spokeRef.current) return;
    onSubmitRef.current({ transcript: finalTextRef.current.trim(), video: p.video, mime: p.mime, audio: p.audio });
  }

  function startRecording() {
    if (!streamRef.current) return;
    setFinalText(""); setInterim(""); setBlob(null); setElapsed(0); setSpoke(false);
    finalTextRef.current = ""; autoSubmitRef.current = false;
    clearSilence();
    chunksRef.current = [];
    audioChunksRef.current = [];
    partsRef.current = { video: null, mime: "", audio: null, left: 0 };
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
        partsRef.current.video = b;
        partsRef.current.mime = mimeRef.current || "video/webm";
        partsRef.current.left -= 1;
        submitIfReady();
      };
      rec.start(1000);
      recorderRef.current = rec;
      partsRef.current.left += 1;

      // The audio-only twin that gets transcribed.
      const audioMime = pickAudioMime();
      audioMimeRef.current = audioMime;
      const audioStream = new MediaStream(streamRef.current.getAudioTracks());
      const arec = audioMime
        ? new MediaRecorder(audioStream, { mimeType: audioMime })
        : new MediaRecorder(audioStream);
      arec.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      arec.onstop = () => {
        partsRef.current.audio = new Blob(audioChunksRef.current, { type: audioMimeRef.current || "audio/webm" });
        partsRef.current.left -= 1;
        submitIfReady();
      };
      arec.start(1000);
      audioRecRef.current = arec;
      partsRef.current.left += 1;

      recordingRef.current = true;
      setRecording(true);
      startVad(streamRef.current);
      startSR();
    } catch {
      onUnsupported("Recording couldn't start in this browser. Continuing with the text interview.");
    }
  }

  function stopRecording() {
    autoSubmitRef.current = false; // manual stop → don't auto-submit
    clearSilence();
    stopVad();
    recordingRef.current = false;
    setRecording(false);
    setInterim("");
    try { recorderRef.current?.stop(); } catch { /* ignore */ }
    try { audioRecRef.current?.stop(); } catch { /* ignore */ }
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
            <p className="text-[13px] text-white/70">{t("liveUi.waitingCamera")}</p>
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
              <span className="text-[12.5px] font-medium text-white">{t("liveUi.listenThenAnswer")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Live transcript */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[12px] text-on-surface-variant">
            Just talk. Pause when you&apos;re done and the interviewer picks it up.
          </p>
          {recording && (
            <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium ${hushing ? "text-electric-violet" : "text-emerald-600 dark:text-emerald-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hushing ? "bg-electric-violet" : "bg-emerald-500 animate-pulse"}`} aria-hidden="true" />
              {hushing ? "You paused. Sending…" : "Listening"}
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
              {recording
                ? spoke
                  ? "Recording. Your answer is transcribed when you finish."
                  : "Listening… start talking whenever you're ready."
                : "Answer out loud. It starts listening automatically after each question."}
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
                disabled={!spoke}
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
              ? "Or just stop talking. I'll pick it up automatically."
              : blob && !spoke
              ? "That was very short. Answer again, a couple of sentences."
              : "Specifics beat polish. Filler words are fine."}
          </span>
        </div>
      </div>
    </div>
  );
}
