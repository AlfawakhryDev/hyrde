"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/arena";
import { VETTING_QUESTIONS, BAND_STYLES, type VettingAssessment } from "@/lib/vetting";
import { supabaseBrowser } from "@/lib/supabase/client";
import VideoAnswer, { videoInterviewSupported } from "@/components/vetting/VideoAnswer";
import LiveInterview from "@/components/vetting/LiveInterview";
import { speak, cancelSpeech } from "@/lib/speech";

interface ExistingVetting {
  id: string;
  category: string;
  status: string;
  score: number | null;
  band: string | null;
  completed_at: string | null;
  created_at: string;
}

type Phase = "pick" | "mode" | "interview" | "live" | "verdict";

interface ChatMsg { role: "interviewer" | "you"; text: string }

export default function VettingClient({ existing }: { existing: ExistingVetting[] }) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [category, setCategory] = useState<string | null>(null);
  const [vettingId, setVettingId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<{ passed: boolean; assessment: VettingAssessment } | null>(null);
  const [mode, setMode] = useState<"text" | "video">("text");
  const [videoOk, setVideoOk] = useState(false);
  const [videoNote, setVideoNote] = useState("");
  // Voice: the interviewer speaks each question aloud, then hands the mic over.
  const [speaking, setSpeaking] = useState(false);
  const [autoRecordSignal, setAutoRecordSignal] = useState(0);
  const [intro, setIntro] = useState<string>("");
  const [live, setLive] = useState<{ signedUrl: string; vettingId: string } | null>(null);
  const lastSpokenRef = useRef<string>("");
  const introSpokenRef = useRef(false);

  // Start a real-time voice interview. If the live agent isn't configured yet,
  // fall back gracefully to the recorded voice interview.
  async function startLive(cat: string) {
    setCategory(cat);
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/vet/live-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat }),
      });
      const data = await res.json();
      if (res.status === 501) { setBusy(false); start(cat, "video"); return; } // not configured yet
      if (!res.ok) { setError(data.error ?? "Couldn't start the live interview."); setBusy(false); return; }
      setLive({ signedUrl: data.signedUrl, vettingId: data.vettingId });
      setVettingId(data.vettingId);
      setPhase("live");
    } catch {
      setError("Couldn't reach the interviewer. Try again.");
    }
    setBusy(false);
  }

  useEffect(() => { setVideoOk(videoInterviewSupported()); }, []);

  // Speak each newly-arrived interviewer question in voice mode, then signal the
  // recorder to auto-listen — so it plays like a real spoken conversation.
  const latestQuestion = [...messages].reverse().find(m => m.role === "interviewer")?.text ?? "";
  useEffect(() => {
    if (phase !== "interview" || mode !== "video") return;
    if (!latestQuestion || latestQuestion === lastSpokenRef.current) return;
    lastSpokenRef.current = latestQuestion;
    // On the very first question, break the ice with the spoken intro first.
    const toSpeak = !introSpokenRef.current && intro
      ? `${intro} … ${latestQuestion}`
      : latestQuestion;
    introSpokenRef.current = true;
    setSpeaking(true);
    let cancelled = false;
    speak(toSpeak).finally(() => {
      if (cancelled) return;
      setSpeaking(false);
      setAutoRecordSignal(s => s + 1); // interviewer finished → open the mic
    });
    return () => { cancelled = true; cancelSpeech(); };
  }, [latestQuestion, phase, mode, intro]);

  // Stop any speech when leaving the interview.
  useEffect(() => () => cancelSpeech(), []);

  const passedByCategory = new Map(
    existing.filter(v => v.status === "passed").map(v => [v.category, v]),
  );

  function pickCategory(cat: string) {
    setCategory(cat);
    setError("");
    if (videoOk) {
      setPhase("mode");
    } else {
      start(cat, "text");
    }
  }

  async function start(cat: string, chosenMode: "text" | "video") {
    setCategory(cat);
    setMode(chosenMode);
    setError("");
    setBusy(true);
    setPhase("interview");
    setMessages([]);
    setIntro("");
    introSpokenRef.current = false;
    lastSpokenRef.current = "";
    try {
      const res = await fetch("/api/vet/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, mode: chosenMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not start.");
        setPhase("pick");
        return;
      }
      setVettingId(data.vettingId);
      setIndex(data.index);
      if (data.resumed && data.mode) setMode(data.mode);
      if (data.intro) setIntro(data.intro);
      setMessages([{ role: "interviewer", text: data.question }]);
    } catch {
      setError("Could not reach the interviewer. Try again.");
      setPhase("pick");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer(mine: string, recording?: Blob | null, mime?: string) {
    if (mine.length < 25 || !vettingId) {
      setError("A couple of sentences minimum. Specifics beat polish.");
      return;
    }
    setMessages(m => [...m, { role: "you", text: mine }]);
    setAnswer("");
    setError("");
    setBusy(true);

    // Store the recording privately (best-effort — the transcript is graded).
    if (recording && recording.size > 0) {
      try {
        const { data: { user } } = await supabaseBrowser().auth.getUser();
        if (user) {
          const ext = (mime ?? "video/webm").includes("mp4") ? "mp4" : "webm";
          await supabaseBrowser().storage
            .from("interview-recordings")
            .upload(`${user.id}/${vettingId}/q${index}.${ext}`, recording, {
              contentType: mime ?? "video/webm",
              upsert: true,
            });
        }
      } catch { /* recording is evidence, not a blocker */ }
    }

    try {
      const res = await fetch("/api/vet/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vettingId, answer: mine }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Resubmit.");
        // Give the answer back so they can retry.
        setMessages(m => m.slice(0, -1));
        setAnswer(mine);
        return;
      }
      if (data.done) {
        setVerdict({ passed: data.passed, assessment: data.assessment });
        setPhase("verdict");
      } else {
        setIndex(data.index);
        setMessages(m => [...m, { role: "interviewer", text: data.question }]);
      }
    } catch {
      setError("Connection hiccup. Resubmit your answer.");
      setMessages(m => m.slice(0, -1));
      setAnswer(mine);
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    submitAnswer(answer.trim());
  }

  // ── Mode chooser ───────────────────────────────────────────────────────────
  if (phase === "mode" && category) {
    return (
      <div className="mx-auto max-w-[640px] px-5 md:px-6 py-14">
        <button onClick={() => setPhase("pick")} className="text-[13px] font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          <span aria-hidden="true">←</span> Back
        </button>
        <h1 className="text-[32px] md:text-[40px] font-light tracking-[-0.035em] text-on-surface leading-[1.05] mt-8 mb-3">
          {category} interview
        </h1>
        <p className="text-[14px] text-on-surface-variant leading-relaxed mb-10 max-w-[480px]">
          Same four adaptive questions, same grading, either way. The voice interview is the
          stronger signal. Clients trust it more, and it proves the answers are yours.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => startLive(category)}
            disabled={busy}
            className="text-left rounded-2xl bg-surface-container-low p-6 hover:bg-surface-container transition-colors disabled:opacity-60"
          >
            <p className="flex items-center gap-2 text-[15px] font-semibold text-on-surface mb-1.5">
              Live voice interview
              <span className="text-[10.5px] font-medium text-electric-violet bg-electric-violet/10 px-2 py-0.5 rounded-full">Recommended</span>
            </p>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              {busy ? "Connecting…" : <>A real-time conversation. The interviewer <span className="text-on-surface">talks with you out loud</span>,
              listens as you speak, and you can jump in any time. ~7 minutes, four questions, graded on the spot.</>}
            </p>
          </button>
          <button
            onClick={() => start(category, "text")}
            className="text-left rounded-2xl bg-surface-container-low p-6 hover:bg-surface-container transition-colors"
          >
            <p className="text-[15px] font-semibold text-on-surface mb-1.5">Text interview</p>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Type your answers. Works everywhere. No camera or microphone needed.
            </p>
          </button>
        </div>
        {error && <p className="text-[13px] text-error mt-5">{error}</p>}
      </div>
    );
  }

  // ── Verdict ────────────────────────────────────────────────────────────────
  if (phase === "verdict" && verdict) {
    const a = verdict.assessment;
    return (
      <div className="mx-auto max-w-[640px] px-5 md:px-6 py-14">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-5 ${
            verdict.passed ? "border-emerald-500/40" : "border-error/30"
          }`}>
            <span className="text-3xl font-semibold tracking-[-0.02em] text-on-surface">{a.score}</span>
          </div>
          <h1 className="text-4xl font-light tracking-[-0.03em] text-on-surface mb-2">
            {verdict.passed ? `You're vetted. ${a.band}` : "Not this time"}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-[440px] mx-auto leading-relaxed">
            {verdict.passed
              ? `Clients now see a ${a.band} badge in ${category} next to your name. The AI will match ${category} tasks to you automatically. No bidding.`
              : "You can retake the interview in 24 hours. The feedback below is your prep list."}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-border-crisp rounded-xl p-6 mb-4">
          <h2 className="text-[13px] font-medium text-on-surface mb-2">Assessment</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{a.summary}</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-container-lowest border border-border-crisp rounded-xl p-5">
            <h3 className="text-[13px] font-medium text-emerald-600 dark:text-emerald-400 mb-2">
              {verdict.passed ? "Verified skills" : "What worked"}
            </h3>
            <ul className="space-y-1.5">
              {(verdict.passed ? a.verifiedSkills : a.strengths).map(s => (
                <li key={s} className="text-[13px] text-on-surface-variant">· {s}</li>
              ))}
            </ul>
          </div>
          <div className="bg-surface-container-lowest border border-border-crisp rounded-xl p-5">
            <h3 className="text-[13px] font-medium text-amber-600 dark:text-amber-400 mb-2">Growth areas</h3>
            <ul className="space-y-1.5">
              {a.growthAreas.map(s => (
                <li key={s} className="text-[13px] text-on-surface-variant">· {s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="h-10 inline-flex items-center px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
            {verdict.passed ? "Claim your first task" : "Back to dashboard"}
          </Link>
          {!verdict.passed && (
            <button onClick={() => { setPhase("pick"); setVerdict(null); }} className="h-10 inline-flex items-center px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
              Pick another category
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Live voice interview ────────────────────────────────────────────────────
  if (phase === "live" && live && category) {
    return (
      <div className="mx-auto max-w-[720px] px-5 md:px-8 py-12">
        <div className="mb-8">
          <p className="text-[13px] font-medium text-on-surface">{category} interview · live</p>
          <p className="text-[12.5px] text-on-surface-variant mt-0.5">A real conversation. Speak naturally.</p>
        </div>
        {error && <p className="text-[13px] text-error mb-4">{error}</p>}
        <LiveInterview
          signedUrl={live.signedUrl}
          vettingId={live.vettingId}
          category={category}
          onComplete={v => { setVerdict(v); setPhase("verdict"); }}
          onError={reason => { setError(reason); setLive(null); setPhase("mode"); }}
        />
      </div>
    );
  }

  // ── Interview ──────────────────────────────────────────────────────────────
  if (phase === "interview") {
    const currentQuestion = [...messages].reverse().find(m => m.role === "interviewer")?.text ?? "";
    const loadingFirst = busy && messages.length === 0;
    const waitingNext = busy && messages.length > 0 && messages[messages.length - 1].role === "you";
    const grading = waitingNext && index >= VETTING_QUESTIONS;
    const qNum = Math.min(Math.max(index, 1), VETTING_QUESTIONS);

    return (
      <div className="mx-auto max-w-[720px] px-5 md:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[13px] font-medium text-on-surface">{category} interview</p>
            <p className="text-[12.5px] text-on-surface-variant mt-0.5">
              {mode === "video" ? "Answer out loud. Specifics beat polish." : "Type your answer. Specifics beat polish."}
            </p>
          </div>
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: VETTING_QUESTIONS }).map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i < index ? "bg-electric-violet" : "bg-surface-container-high"}`} />
            ))}
          </div>
        </div>

        {/* Current question */}
        <div className="border-t border-border-crisp pt-8 mb-8">
          <p className="text-[13px] font-medium text-on-surface-variant mb-3">
            Question {qNum} of {VETTING_QUESTIONS}
          </p>
          <p className={`text-[20px] md:text-[24px] font-light tracking-[-0.02em] leading-[1.4] ${loadingFirst ? "text-on-surface-variant" : "text-on-surface"}`}>
            {loadingFirst ? "Preparing your first question…" : currentQuestion}
          </p>
          {mode === "video" && currentQuestion && !waitingNext && !grading && (
            <div className="flex items-center gap-2.5 mt-4">
              {speaking ? (
                <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-electric-violet">
                  <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                    <span className="w-0.5 bg-electric-violet rounded-full animate-[vbar_0.9s_ease-in-out_infinite] h-2" />
                    <span className="w-0.5 bg-electric-violet rounded-full animate-[vbar_0.9s_ease-in-out_0.15s_infinite] h-3.5" />
                    <span className="w-0.5 bg-electric-violet rounded-full animate-[vbar_0.9s_ease-in-out_0.3s_infinite] h-2.5" />
                  </span>
                  Interviewer is speaking…
                </span>
              ) : (
                <button
                  onClick={() => { setSpeaking(true); speak(currentQuestion).finally(() => setSpeaking(false)); }}
                  className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ fontSize: "16px" }}>volume_up</span>
                  Replay question
                </button>
              )}
            </div>
          )}
          {(waitingNext || grading) && (
            <div className="flex items-center gap-1.5 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/60 animate-pulse [animation-delay:300ms]" />
              <span className="text-[12.5px] text-on-surface-variant ml-1.5">
                {grading ? "Grading your interview…" : "Interviewer is thinking…"}
              </span>
            </div>
          )}
        </div>

        {/* Camera-fallback banner — persists even after we switch to text */}
        {videoNote && (
          <div className="flex items-start gap-3 bg-amber-500/10 rounded-2xl px-5 py-3.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" aria-hidden="true" />
            <p className="text-[13.5px] text-on-surface">{videoNote}</p>
          </div>
        )}

        {/* Answer input */}
        {mode === "video" ? (
          <VideoAnswer
            questionIndex={index}
            submitting={busy}
            interviewerSpeaking={speaking}
            autoRecordSignal={autoRecordSignal}
            onSubmit={(transcript, blob, mime) => { cancelSpeech(); submitAnswer(transcript, blob, mime); }}
            onUnsupported={reason => { cancelSpeech(); setMode("text"); setVideoNote(reason); }}
          />
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-4">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={5}
              disabled={busy}
              placeholder="Your answer. Name real tools, real decisions, real numbers…"
              className="w-full bg-transparent text-[14px] text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none resize-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11.5px] text-on-surface-variant">
                {answer.trim().length < 25 ? `${Math.max(0, 25 - answer.trim().length)} more characters` : "Ready"}
              </span>
              <button
                onClick={submit}
                disabled={busy || answer.trim().length < 25}
                className="h-10 px-6 rounded-full bg-on-surface text-inverse-on-surface text-[13px] font-medium hover:opacity-90 transition disabled:opacity-40"
              >
                {index >= VETTING_QUESTIONS ? "Submit final answer" : "Submit answer"}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-[13px] text-error mt-4">{error}</p>}
      </div>
    );
  }

  // ── Category picker ────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[720px] px-5 md:px-6 py-14">
      <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border-crisp text-xs font-medium text-on-surface-variant mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-electric-violet" />
        The AI skill interview
      </div>
      <h1 className="text-[36px] md:text-[46px] font-light text-on-surface leading-[1.05] tracking-[-0.035em] mb-4">
        Get vetted. Let work find you.
      </h1>
      <p className="text-[15px] text-on-surface-variant leading-relaxed mb-3 max-w-[560px]">
        Four questions, ~10 minutes. On camera or in text: a scenario, a probing follow-up
        on your own answer, a live work sample, and a real-project deep-dive. Graded 0–100 by AI against a
        strict rubric. Templated answers are detected and capped.
      </p>
      <p className="text-[13px] text-on-surface-variant mb-8">
        Pass (60+) and clients see your badge everywhere your name appears. Fail and you get
        specific feedback plus a retake in 24 hours.
      </p>

      <div className="pt-8 mt-8 border-t border-border-crisp">
        <h2 className="text-[13px] font-medium text-on-surface-variant mb-5">Choose a category</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {CATEGORIES.map(cat => {
          const passed = passedByCategory.get(cat);
          return (
            <button
              key={cat}
              onClick={() => !passed && pickCategory(cat)}
              disabled={!!passed || busy}
              className={`text-left border rounded-xl p-5 transition-colors ${
                passed
                  ? "border-emerald-500/30 bg-emerald-500/5 cursor-default"
                  : "border-border-crisp bg-surface-container-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[15px] font-semibold text-on-surface">{cat}</span>
                {passed ? (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${BAND_STYLES[passed.band ?? "Vetted"]}`}>
                    {passed.band} · {passed.score}
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "17px" }}>arrow_forward</span>
                )}
              </div>
              <p className="text-[13px] text-on-surface-variant">
                {passed ? "Vetted. Badge live on your profile" : "4 questions · ~10 minutes"}
              </p>
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-error mt-5">{error}</p>}
    </div>
  );
}
