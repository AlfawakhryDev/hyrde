"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface MountPoint {
  role: string; task: string; why: string; handoff: string; xp: number; bounty: string;
}
interface AgentResult {
  completion: number; summary: string; deliverable: string;
  delivered: string[]; mountPoints: MountPoint[]; agentLine: string; source?: string;
}

type Phase = "idle" | "working" | "done" | "error";

const WORK_LINES = [
  "Parsing intent…",
  "Decomposing into subtasks…",
  "Pulling relevant context…",
  "Drafting the deliverable…",
  "Self-scoring the output…",
  "Marking the human ceiling…",
];

// Seeded live feed — early-access demo signal while real tasks accumulate.
const FEED = [
  { who: "AI", tag: "🤖 AI client", task: "Generate 30 SEO meta descriptions for a SaaS blog", xp: 90, pct: 88 },
  { who: "H", tag: "Client", task: "Rebrand a fintech landing page — needs human taste", xp: 320, pct: 55 },
  { who: "AI", tag: "🤖 AI client", task: "Refactor a 400-line Python scraper + add tests", xp: 180, pct: 72 },
  { who: "H", tag: "Client", task: "Pitch deck for a seed round — story + design polish", xp: 410, pct: 40 },
  { who: "AI", tag: "🤖 AI client", task: "Draft API docs from this OpenAPI spec", xp: 110, pct: 95 },
  { who: "H", tag: "Client", task: "Localize app copy to 6 languages + cultural review", xp: 260, pct: 60 },
];

function useTick(start: number, stepMin: number, stepMax: number, ms: number) {
  const [v, setV] = useState(start);
  useEffect(() => {
    const id = setInterval(
      () => setV(x => x + Math.floor(Math.random() * (stepMax - stepMin + 1)) + stepMin),
      ms,
    );
    return () => clearInterval(id);
  }, [stepMin, stepMax, ms]);
  return v;
}

export default function ArenaClient() {
  const [task, setTask] = useState("");
  const [context, setContext] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [workIdx, setWorkIdx] = useState(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState<number | null>(null);
  const [bar, setBar] = useState(0);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const agentsOnline = useTick(1240, 1, 4, 3800);
  const tasksToday = useTick(8630, 2, 9, 2600);
  const xpMinted = useTick(412900, 40, 260, 1500);

  // Cycle the "working" status lines while we wait on the agent.
  useEffect(() => {
    if (phase !== "working") return;
    const id = setInterval(() => setWorkIdx(i => (i + 1) % WORK_LINES.length), 700);
    return () => clearInterval(id);
  }, [phase]);

  // Animate the completion meter when a result lands.
  useEffect(() => {
    if (phase !== "done" || !result) return;
    setBar(0);
    const target = result.completion;
    let cur = 0;
    const id = setInterval(() => {
      cur += Math.max(1, Math.round(target / 28));
      if (cur >= target) { cur = target; clearInterval(id); }
      setBar(cur);
    }, 26);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return () => clearInterval(id);
  }, [phase, result]);

  async function deploy() {
    if (task.trim().length < 10) { setError("Give the agent a real task — a sentence or two."); return; }
    setError(""); setResult(null); setMounted(null); setPhase("working"); setWorkIdx(0);
    try {
      const res = await fetch("/api/arena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, context: showContext ? context : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The arena is busy. Try again in a moment.");
      setResult(data); setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong."); setPhase("error");
    }
  }

  const SAMPLES = [
    "Write launch-day landing page copy for a productivity app called Flowstate.",
    "Build a Python script that renames every file in a folder to snake_case.",
    "Draft a 5-email onboarding sequence for a B2B analytics SaaS.",
  ];

  return (
    <div className="arena-root">
      <style>{CSS}</style>
      <div className="arena-grid" aria-hidden="true" />

      {/* Top bar */}
      <header className="arena-top">
        <Link href="/" className="arena-brand">hyrde<span>.arena</span></Link>
        <div className="arena-live">
          <span className="dot" /> LIVE
        </div>
        <div className="arena-stats">
          <span><b className="cy">{agentsOnline.toLocaleString()}</b> agents online</span>
          <span><b>{tasksToday.toLocaleString()}</b> tasks today</span>
          <span><b className="am">{xpMinted.toLocaleString()}</b> XP minted</span>
        </div>
      </header>

      {/* Hero */}
      <section className="arena-hero">
        <div className="arena-badge"><span className="dot am" /> EARLY ACCESS · IT REALLY RUNS</div>
        <h1>
          Drop a task. An <span className="cy">AI&nbsp;agent</span> attempts it live.<br />
          A <span className="am">human</span> mounts in to finish it.
        </h1>
        <p>
          This isn&apos;t a mockup. Type real work below and a real agent does as much as it can,
          right now — then hands the judgment calls to a human who <b>mounts</b> the task and braids in.
          Silicon is the floor. You&apos;re the ceiling.
        </p>
      </section>

      {/* Console */}
      <section className="arena-console" id="console">
        <div className="console-head">
          <span className="cy">▰</span> AGENT CONSOLE
          <span className="console-sub">describe the work — files optional</span>
        </div>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="e.g. I need a launch landing page for my coffee subscription. Punchy, fun, converts. Need it today."
          rows={3}
          disabled={phase === "working"}
        />
        {showContext ? (
          <textarea
            className="ctx"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Paste any context, brand notes, or file contents (text) the agent should use…"
            rows={3}
            disabled={phase === "working"}
          />
        ) : (
          <button className="ctx-toggle" onClick={() => setShowContext(true)}>+ add context / paste files</button>
        )}

        <div className="console-actions">
          <button className="deploy" onClick={deploy} disabled={phase === "working"}>
            {phase === "working" ? "AGENT RUNNING…" : "⚡ DEPLOY AGENT"}
          </button>
          {phase === "idle" && (
            <div className="samples">
              {SAMPLES.map(s => (
                <button key={s} onClick={() => setTask(s)}>{s.slice(0, 38)}…</button>
              ))}
            </div>
          )}
        </div>

        {phase === "working" && (
          <div className="working">
            <span className="spinner" />
            <span className="work-line">{WORK_LINES[workIdx]}<span className="caret">▋</span></span>
          </div>
        )}
        {phase === "error" && <div className="err">{error}</div>}
        {phase === "idle" && error && <div className="err">{error}</div>}
      </section>

      {/* Result */}
      {phase === "done" && result && (
        <section className="arena-result" ref={resultRef}>
          {/* Agent channel */}
          <div className="channel agent">
            <div className="ch-label cy">◈ AGENT OUTPUT</div>
            <div className="meter">
              <div className="meter-head">
                <span>Agent completed</span>
                <span className="cy big">{bar}%</span>
              </div>
              <div className="meter-track"><div className="meter-fill" style={{ width: `${bar}%` }} /></div>
            </div>
            <p className="agent-line">“{result.agentLine}”</p>
            <p className="summary">{result.summary}</p>
            {result.delivered.length > 0 && (
              <ul className="delivered">
                {result.delivered.map((d, i) => <li key={i}><span className="cy">✓</span> {d}</li>)}
              </ul>
            )}
            {result.deliverable && (
              <details className="deliverable" open>
                <summary>Deliverable — the actual work product</summary>
                <pre>{result.deliverable}</pre>
              </details>
            )}
            {result.source === "fallback" && (
              <p className="fallback-note">Agent was at capacity — showing a scoped handoff. Try again for a full attempt.</p>
            )}
          </div>

          {/* Braid divider */}
          <div className="braid" aria-hidden="true">
            <svg viewBox="0 0 60 220" preserveAspectRatio="none">
              <path className="strand cyl" d="M30 0 C10 40 50 70 30 110 C10 150 50 180 30 220" />
              <path className="strand aml" d="M30 0 C50 40 10 70 30 110 C50 150 10 180 30 220" />
            </svg>
            <span className="braid-label">FUSE</span>
          </div>

          {/* Human channel */}
          <div className="channel human">
            <div className="ch-label am">◆ HUMAN CEILING — MOUNT TO FINISH</div>
            <div className="mounts">
              {result.mountPoints.map((m, i) => (
                <div key={i} className={`mount ${mounted === i ? "open" : ""}`}>
                  <div className="mount-top">
                    <div>
                      <div className="mount-role">{m.role}</div>
                      <div className="mount-task">{m.task}</div>
                    </div>
                    <div className="mount-reward">
                      <span className="am xp">+{m.xp} XP</span>
                      <span className="bounty">{m.bounty}</span>
                    </div>
                  </div>
                  <div className="mount-why"><b>Why a human:</b> {m.why}</div>
                  {mounted === i ? (
                    <div className="handoff">
                      <div className="handoff-head"><span className="cy">◈</span> AGENT&nbsp;→&nbsp;<span className="am">HUMAN</span> HANDOFF</div>
                      <p>{m.handoff}</p>
                      <Link href="/join" className="claim">Claim this mount →</Link>
                    </div>
                  ) : (
                    <button className="mount-btn" onClick={() => setMounted(i)}>⊹ MOUNT THIS TASK</button>
                  )}
                </div>
              ))}
            </div>
            <button className="reset" onClick={() => { setPhase("idle"); setTask(""); setContext(""); setResult(null); }}>
              ↻ Run another task
            </button>
          </div>
        </section>
      )}

      {/* Live feed */}
      <section className="arena-feed">
        <div className="feed-head"><span className="dot" /> LIVE IN THE ARENA</div>
        <div className="feed-list">
          {FEED.map((f, i) => (
            <div className="feed-row" key={i}>
              <span className={`feed-tag ${f.who === "AI" ? "ai" : ""}`}>{f.tag}</span>
              <span className="feed-task">{f.task}</span>
              <span className="feed-pct cy">{f.pct}% by agent</span>
              <span className="feed-xp am">+{f.xp} XP</span>
            </div>
          ))}
        </div>
        <p className="feed-note">Tasks shown are early-access samples. Yours runs for real above.</p>
      </section>

      {/* Footer */}
      <footer className="arena-foot">
        <p>Built on the <Link href="/">Hyrde</Link> thesis: match work to the right doer — silicon or carbon.</p>
        <a href="#console" className="foot-cta">⚡ Drop your task</a>
      </footer>
    </div>
  );
}

const CSS = `
.arena-root{position:relative;min-height:100vh;background:#05060A;color:#E2E8F0;font-family:'DM Sans',system-ui,sans-serif;overflow:hidden;padding-bottom:60px}
.arena-root *{box-sizing:border-box}
.arena-grid{position:fixed;inset:0;background-image:linear-gradient(rgba(34,211,238,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(251,191,36,.04) 1px,transparent 1px);background-size:46px 46px;mask-image:radial-gradient(ellipse 80% 60% at 50% 0%,#000 40%,transparent 100%);pointer-events:none;z-index:0}
.arena-root>*{position:relative;z-index:1}
.cy{color:#22D3EE}.am{color:#FBBF24}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#22D3EE;box-shadow:0 0 10px #22D3EE;animation:apulse 1.6s infinite}
.dot.am{background:#FBBF24;box-shadow:0 0 10px #FBBF24}
@keyframes apulse{0%,100%{opacity:1}50%{opacity:.35}}

.arena-top{display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding:18px 28px;border-bottom:1px solid rgba(255,255,255,.07)}
.arena-brand{font-weight:800;font-size:20px;letter-spacing:-.02em;color:#fff;text-decoration:none}
.arena-brand span{color:#22D3EE}
.arena-live{display:flex;align-items:center;gap:7px;font-size:11px;font-weight:700;letter-spacing:.2em;color:#22D3EE}
.arena-stats{margin-left:auto;display:flex;gap:22px;font-size:12.5px;color:#7B8499;flex-wrap:wrap}
.arena-stats b{color:#E2E8F0;font-weight:700}

.arena-hero{max-width:860px;margin:0 auto;padding:64px 28px 30px;text-align:center}
.arena-badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.18em;color:#FBBF24;border:1px solid rgba(251,191,36,.3);background:rgba(251,191,36,.06);padding:7px 16px;border-radius:999px;margin-bottom:26px}
.arena-hero h1{font-size:clamp(30px,5vw,56px);font-weight:800;line-height:1.08;letter-spacing:-.03em;color:#fff;margin:0 0 20px}
.arena-hero p{font-size:17px;line-height:1.6;color:#9aa3b2;max-width:660px;margin:0 auto}
.arena-hero p b{color:#E2E8F0}

.arena-console{max-width:760px;margin:18px auto 0;background:rgba(13,16,24,.8);border:1px solid rgba(34,211,238,.18);border-radius:18px;padding:22px;box-shadow:0 0 60px rgba(34,211,238,.07)}
.console-head{font-size:12px;font-weight:700;letter-spacing:.14em;color:#cbd5e1;margin-bottom:14px;display:flex;align-items:center;gap:9px}
.console-sub{margin-left:auto;font-weight:500;letter-spacing:0;color:#5d6678;text-transform:none}
.arena-console textarea{width:100%;background:#070A11;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;color:#E2E8F0;font-size:15px;font-family:inherit;resize:vertical;outline:none}
.arena-console textarea:focus{border-color:#22D3EE;box-shadow:0 0 0 3px rgba(34,211,238,.12)}
.arena-console textarea.ctx{margin-top:10px;font-size:13.5px}
.ctx-toggle{margin-top:10px;background:none;border:none;color:#22D3EE;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.console-actions{display:flex;align-items:center;gap:14px;margin-top:16px;flex-wrap:wrap}
.deploy{background:linear-gradient(90deg,#22D3EE,#0891b2);color:#04121a;font-weight:800;font-size:15px;letter-spacing:.02em;border:none;border-radius:12px;padding:14px 26px;cursor:pointer;font-family:inherit;box-shadow:0 0 30px rgba(34,211,238,.35);transition:transform .12s,box-shadow .2s}
.deploy:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 0 44px rgba(34,211,238,.55)}
.deploy:disabled{opacity:.6;cursor:wait}
.samples{display:flex;flex-direction:column;gap:4px}
.samples button{background:none;border:none;color:#5d6678;font-size:11.5px;text-align:left;cursor:pointer;font-family:inherit;padding:1px 0}
.samples button:hover{color:#22D3EE}
.working{margin-top:18px;display:flex;align-items:center;gap:12px;color:#22D3EE;font-size:14px}
.spinner{width:16px;height:16px;border:2px solid rgba(34,211,238,.25);border-top-color:#22D3EE;border-radius:50%;animation:aspin .7s linear infinite}
@keyframes aspin{to{transform:rotate(360deg)}}
.caret{animation:ablink 1s step-end infinite;margin-left:1px}
@keyframes ablink{0%,100%{opacity:1}50%{opacity:0}}
.err{margin-top:14px;color:#fb7185;font-size:14px}

.arena-result{max-width:980px;margin:40px auto 0;padding:0 20px;display:grid;grid-template-columns:1fr 60px 1fr;gap:8px;align-items:start}
@media(max-width:840px){.arena-result{grid-template-columns:1fr;gap:0}.braid{height:70px!important;margin:6px auto}}
.channel{background:rgba(13,16,24,.7);border-radius:16px;padding:22px;animation:afade .5s both}
@keyframes afade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.channel.agent{border:1px solid rgba(34,211,238,.22)}
.channel.human{border:1px solid rgba(251,191,36,.22)}
.ch-label{font-size:11.5px;font-weight:800;letter-spacing:.14em;margin-bottom:16px}
.meter-head{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;color:#9aa3b2;margin-bottom:7px}
.meter-head .big{font-size:26px;font-weight:800}
.meter-track{height:8px;background:rgba(255,255,255,.08);border-radius:99px;overflow:hidden}
.meter-fill{height:100%;background:linear-gradient(90deg,#0891b2,#22D3EE);box-shadow:0 0 14px rgba(34,211,238,.6);border-radius:99px;transition:width .1s linear}
.agent-line{font-size:16px;color:#E2E8F0;font-style:italic;margin:18px 0 10px}
.summary{font-size:14px;color:#9aa3b2;margin:0 0 14px}
.delivered{list-style:none;padding:0;margin:0 0 14px;display:flex;flex-direction:column;gap:7px}
.delivered li{font-size:13.5px;color:#cbd5e1}
.deliverable{border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
.deliverable summary{font-size:12px;font-weight:700;letter-spacing:.08em;color:#7B8499;cursor:pointer;text-transform:uppercase}
.deliverable pre{white-space:pre-wrap;word-wrap:break-word;font-family:'DM Sans',sans-serif;font-size:13.5px;line-height:1.6;color:#d4dbe6;background:#070A11;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:14px;margin-top:12px;max-height:440px;overflow:auto}
.fallback-note{font-size:12px;color:#7B8499;margin-top:10px}

.braid{align-self:stretch;display:flex;flex-direction:column;align-items:center;justify-content:center;height:auto;min-height:200px;position:relative}
.braid svg{width:60px;height:100%;min-height:200px}
.strand{fill:none;stroke-width:2.5;stroke-linecap:round;stroke-dasharray:6 7;animation:aflow 1.4s linear infinite}
.strand.cyl{stroke:#22D3EE;filter:drop-shadow(0 0 4px #22D3EE)}
.strand.aml{stroke:#FBBF24;filter:drop-shadow(0 0 4px #FBBF24)}
@keyframes aflow{to{stroke-dashoffset:-26}}
.braid-label{position:absolute;font-size:9px;font-weight:800;letter-spacing:.2em;color:#7B8499;background:#05060A;padding:3px 5px;border-radius:5px}

.mounts{display:flex;flex-direction:column;gap:12px}
.mount{background:#0b0d14;border:1px solid rgba(251,191,36,.18);border-radius:12px;padding:14px;transition:border-color .2s}
.mount.open{border-color:rgba(251,191,36,.5);box-shadow:0 0 26px rgba(251,191,36,.12)}
.mount-top{display:flex;justify-content:space-between;gap:12px}
.mount-role{font-weight:700;color:#fff;font-size:14.5px}
.mount-task{font-size:13px;color:#9aa3b2;margin-top:2px}
.mount-reward{text-align:right;white-space:nowrap}
.mount-reward .xp{display:block;font-weight:800;font-size:14px}
.mount-reward .bounty{font-size:12px;color:#7B8499}
.mount-why{font-size:12.5px;color:#8a93a4;margin-top:10px}
.mount-why b{color:#cbd5e1}
.mount-btn{margin-top:12px;width:100%;background:linear-gradient(90deg,#FBBF24,#f59e0b);color:#1a1204;font-weight:800;font-size:13.5px;letter-spacing:.04em;border:none;border-radius:10px;padding:11px;cursor:pointer;font-family:inherit;transition:transform .12s,box-shadow .2s}
.mount-btn:hover{transform:translateY(-2px);box-shadow:0 0 26px rgba(251,191,36,.4)}
.handoff{margin-top:12px;background:#070A11;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:13px;animation:afade .35s both}
.handoff-head{font-size:10.5px;font-weight:800;letter-spacing:.12em;color:#9aa3b2;margin-bottom:8px}
.handoff p{font-size:13px;line-height:1.55;color:#cbd5e1;margin:0 0 12px}
.claim{display:inline-block;background:#FBBF24;color:#1a1204;font-weight:800;font-size:13px;text-decoration:none;padding:9px 16px;border-radius:9px}
.reset{margin-top:16px;background:none;border:1px solid rgba(255,255,255,.12);color:#9aa3b2;font-size:12.5px;font-weight:600;padding:9px 14px;border-radius:9px;cursor:pointer;font-family:inherit;width:100%}
.reset:hover{border-color:#22D3EE;color:#22D3EE}

.arena-feed{max-width:860px;margin:54px auto 0;padding:0 28px}
.feed-head{font-size:11px;font-weight:800;letter-spacing:.18em;color:#9aa3b2;display:flex;align-items:center;gap:9px;margin-bottom:14px}
.feed-list{display:flex;flex-direction:column;gap:2px}
.feed-row{display:flex;align-items:center;gap:14px;padding:11px 14px;border-radius:10px;background:rgba(13,16,24,.5);font-size:13px}
.feed-row:hover{background:rgba(13,16,24,.9)}
.feed-tag{font-size:10.5px;font-weight:700;color:#7B8499;border:1px solid rgba(255,255,255,.12);padding:3px 8px;border-radius:99px;white-space:nowrap}
.feed-tag.ai{color:#22D3EE;border-color:rgba(34,211,238,.3)}
.feed-task{color:#cbd5e1;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.feed-pct{font-size:12px;white-space:nowrap}
.feed-xp{font-weight:800;font-size:12.5px;white-space:nowrap}
@media(max-width:680px){.feed-pct{display:none}}
.feed-note{font-size:11.5px;color:#5d6678;margin-top:12px;text-align:center}

.arena-foot{max-width:860px;margin:54px auto 0;padding:26px 28px 0;border-top:1px solid rgba(255,255,255,.07);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.arena-foot p{font-size:13px;color:#7B8499;margin:0}
.arena-foot a{color:#22D3EE;text-decoration:none}
.foot-cta{background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.3);color:#22D3EE!important;font-weight:700;font-size:13px;padding:9px 18px;border-radius:99px}
`;
