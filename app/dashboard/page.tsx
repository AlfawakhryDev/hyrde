"use client";
import { useState } from "react";
import Link from "next/link";
import AgentPanel from "@/components/AgentPanel";

type Role = null | "employer" | "freelancer";

// ─── Mock data ────────────────────────────────────────────────────────────────

const EMPLOYER = {
  name: "Acme Corp",
  plan: "Business",
  stats: [
    { label: "Active Jobs",            value: "3",      icon: "work"         },
    { label: "AI Matches This Week",   value: "12",     icon: "person_search" },
    { label: "Hires This Month",       value: "2",      icon: "handshake"    },
    { label: "Total Invested",         value: "$4,200", icon: "payments"     },
  ],
  jobs: [
    { id: 1, title: "React Dashboard Developer",         budget: "$80–$120/hr", status: "open",   matches: 5, posted: "2d ago" },
    { id: 2, title: "Node.js API Architect",              budget: "$6k–$10k",   status: "open",   matches: 3, posted: "4d ago" },
    { id: 3, title: "Product Designer — SaaS Onboarding", budget: "$90/hr",     status: "active", matches: 7, posted: "1w ago" },
  ],
  shortlist: [
    { name: "Alex Kim",    skill: "React Developer",  score: 98, rate: 110, location: "Seoul, KR",  top: true  },
    { name: "Candidate B", skill: "Node.js Expert",   score: 94, rate: 95,  location: "Singapore",  top: false },
    { name: "Candidate C", skill: "Full-Stack Dev",   score: 91, rate: 85,  location: "Remote",     top: false },
  ],
  calls: [
    { date: "Mon Jun 16, 9:00 AM",  who: "Alex Kim",    topic: "React Dashboard role" },
    { date: "Tue Jun 17, 2:00 PM",  who: "Candidate C", topic: "Initial screening"   },
  ],
  activity: [
    { icon: "auto_awesome", text: "AI found 5 matches for React Dashboard role",   time: "2h ago"  },
    { icon: "edit_note",    text: "Outreach sent to Alex Kim automatically",        time: "2h ago"  },
    { icon: "calendar_month", text: "Call booked: Alex Kim · Mon Jun 16 9:00 AM",  time: "1h ago"  },
    { icon: "person_search", text: "3 new matches for Node.js API Architect",       time: "4h ago"  },
  ],
};

const FREELANCER = {
  name: "Sara Rahman",
  skill: "React Developer",
  score: 94,
  band: "Strong",
  rate: "$110/hr",
  location: "Cairo, Egypt",
  stats: [
    { label: "Profile Views (7d)", value: "24",     icon: "visibility"   },
    { label: "Pitches Sent",       value: "8",      icon: "send"         },
    { label: "Active Projects",    value: "2",      icon: "task_alt"     },
    { label: "Earned (30d)",       value: "$3,600", icon: "savings"      },
  ],
  matches: [
    { company: "Fintech Startup",  title: "React Dashboard Developer", budget: "$110–$130/hr",  fit: 96, posted: "1h ago",  hot: true  },
    { company: "HealthTech Co.",   title: "Frontend Developer",         budget: "$80k–$100k/yr", fit: 91, posted: "3h ago",  hot: false },
    { company: "E-commerce SaaS", title: "UI/UX & React Dev",          budget: "$85/hr",        fit: 88, posted: "5h ago",  hot: false },
  ],
  sparks: [
    { title: "Fix React re-render bug",   budget: "$100–$250", timeline: "24h"    },
    { title: "Design landing page hero",   budget: "$200–$400", timeline: "2 days" },
    { title: "Write 5 onboarding emails", budget: "$150–$300", timeline: "3 days" },
  ],
  agentStats: [
    { icon: "search",        label: "Jobs scanned today",  value: "47" },
    { icon: "edit_note",     label: "Pitches sent (7d)",   value: "8"  },
    { icon: "person_check",  label: "Shortlisted",         value: "3"  },
  ],
  pitch: `Your fintech dashboard project caught my attention immediately — building real-time data visualisation at scale is exactly the kind of work I've been doing for the past 3 years.

I'm a senior React developer with deep experience in charting libraries and performance-critical UI. I've shipped dashboards handling 10k+ concurrent data points for two previous fintech clients.

Happy to jump on a 20-minute call this week — no pressure, just a quick conversation to see if we're a good fit.`,
  calls: [
    { date: "Mon Jun 16, 9:00 AM", company: "Fintech Startup", topic: "React Dashboard role" },
  ],
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function DashTopBar({ role, onSwitch }: { role: "employer" | "freelancer"; onSwitch: () => void }) {
  return (
    <div className="bg-white border-b border-border-crisp sticky top-16 z-40">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="relative inline-flex items-center justify-center w-7 h-7 rounded-[8px] ai-match-gradient">
            <svg width="15" height="15" viewBox="0 0 512 512" aria-hidden="true">
              <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
              </g>
              <circle cx="256" cy="256" r="32" fill="#fff" />
            </svg>
          </span>
          <span className="text-sm font-bold font-headline text-on-surface">Hyrde</span>
        </Link>

        <div className="flex items-center gap-1.5 bg-electric-violet/8 border border-electric-violet/20 px-2.5 py-1 rounded-full ml-1">
          <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>
            {role === "employer" ? "business" : "engineering"}
          </span>
          <span className="text-[11px] font-semibold font-body text-electric-violet capitalize">{role}</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 bg-surface-gray rounded-full p-0.5">
          <button
            onClick={() => role === "freelancer" && onSwitch()}
            className={`text-[11px] font-semibold font-body px-3 py-1.5 rounded-full transition-all ${role === "employer" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Employer
          </button>
          <button
            onClick={() => role === "employer" && onSwitch()}
            className={`text-[11px] font-semibold font-body px-3 py-1.5 rounded-full transition-all ${role === "freelancer" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Freelancer
          </button>
        </div>

        <Link href="/" className="hidden md:block text-xs font-semibold font-body text-on-surface-variant hover:text-electric-violet transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

// ─── Employer Dashboard ───────────────────────────────────────────────────────

function EmployerDashboard({ onSwitch, onOpenAgent }: { onSwitch: () => void; onOpenAgent: (brief?: string) => void }) {
  const [agentBrief, setAgentBrief] = useState("");
  const d = EMPLOYER;

  return (
    <div className="min-h-screen bg-surface-gray">
      <DashTopBar role="employer" onSwitch={onSwitch} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">

        {/* Welcome */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface mb-0.5">
              Welcome back, {d.name}
            </h1>
            <p className="text-sm font-body text-on-surface-variant">
              Your AI agent is actively scanning for talent across all open roles.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-electric-violet/8 border border-electric-violet/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
            <span className="text-xs font-semibold font-body text-electric-violet">{d.plan} plan</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {d.stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-border-crisp p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-electric-violet/8 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold font-headline text-on-surface leading-none">{s.value}</p>
                <p className="text-[11px] font-body text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">

            {/* Active jobs */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>work</span>
                  <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Active Jobs</h2>
                </div>
                <Link href="/post-job" className="text-xs font-semibold font-body text-electric-violet hover:opacity-70 transition-opacity">+ Post new</Link>
              </div>
              <div className="space-y-2">
                {d.jobs.map(job => (
                  <div key={job.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-gray hover:bg-electric-violet/5 transition-colors cursor-pointer">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${job.status === "active" ? "bg-green-500" : "bg-electric-violet"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold font-body text-on-surface line-clamp-1">{job.title}</p>
                      <p className="text-xs font-body text-on-surface-variant">{job.budget} · {job.posted}</p>
                    </div>
                    <span className="text-[11px] font-semibold font-body bg-electric-violet/10 text-electric-violet px-2 py-0.5 rounded-full shrink-0">
                      {job.matches} AI matches
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's shortlist */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>person_search</span>
                  <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Today&apos;s AI Shortlist</h2>
                </div>
                <span className="text-[10px] font-body text-on-surface-variant">React Dashboard role</span>
              </div>
              <div className="space-y-2">
                {d.shortlist.map((m, i) => (
                  <div key={m.name} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    m.top ? "border-electric-violet/20 bg-electric-violet/5" : "border-transparent bg-surface-gray"
                  }`}>
                    <div className="w-9 h-9 rounded-full bg-electric-violet/10 flex items-center justify-center shrink-0 font-bold font-headline text-electric-violet text-sm">
                      {m.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-semibold font-body text-on-surface">{m.name}</p>
                        {m.top && <span className="text-[9px] font-semibold bg-electric-violet text-white px-1.5 py-0.5 rounded-full">Top match</span>}
                      </div>
                      <p className="text-xs font-body text-on-surface-variant">{m.skill} · ${m.rate}/hr · {m.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold font-headline text-on-surface leading-none">{m.score}</p>
                      <p className="text-[10px] font-body text-on-surface-variant">score</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => onOpenAgent()} className="mt-4 flex items-center justify-center gap-2 w-full border border-electric-violet/30 text-electric-violet font-semibold font-body text-xs py-2.5 rounded-full hover:bg-electric-violet/5 transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Run AI match for another role
              </button>
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>history</span>
                <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Agent Activity</h2>
              </div>
              <div className="space-y-3">
                {d.activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-electric-violet/8 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-body text-on-surface leading-relaxed">{a.text}</p>
                      <p className="text-[10px] font-body text-on-surface-variant mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* AI Agent widget */}
            <div className="bg-tech-blue-deep rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-electric-violet animate-floaty" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h2 className="text-xs font-semibold font-body text-white/60 uppercase tracking-widest">AI Agent</h2>
              </div>
              <p className="text-sm font-bold font-headline text-white mb-1">Hire anything, in 60 seconds</p>
              <p className="text-xs font-body text-white/45 mb-3">Describe a role — the agent scopes, matches, drafts outreach, and books an interview.</p>
              <textarea
                rows={3}
                value={agentBrief}
                onChange={e => setAgentBrief(e.target.value)}
                placeholder="e.g. Senior Python data engineer to rebuild our Airflow pipeline…"
                className="w-full bg-white/8 border border-white/12 text-white placeholder-white/25 rounded-xl px-3 py-2.5 text-xs font-body focus:outline-none focus:border-electric-violet/50 resize-none mb-3"
              />
              <button
                onClick={() => onOpenAgent(agentBrief)}
                className="flex items-center justify-center gap-2 w-full bg-electric-violet text-white font-semibold font-body text-xs py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                Run Agent →
              </button>
            </div>

            {/* Upcoming calls */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Upcoming Calls</h2>
              </div>
              <div className="space-y-2">
                {d.calls.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-gray">
                    <p className="text-xs font-semibold font-body text-on-surface mb-0.5">{c.date}</p>
                    <p className="text-xs font-body text-on-surface-variant">{c.who} · {c.topic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <h2 className="text-xs font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-3">Quick Actions</h2>
              <div className="space-y-1">
                {[
                  { icon: "post_add",   label: "Post a new job",    href: "/post-job"    },
                  { icon: "bolt",       label: "Browse Sparks",      href: "/sparks"      },
                  { icon: "groups",     label: "Browse talent",      href: "/hire"        },
                  { icon: "domain",     label: "Enterprise plans",   href: "/enterprise"  },
                ].map(a => (
                  <Link key={a.label} href={a.href} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-gray transition-colors">
                    <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "14px" }}>{a.icon}</span>
                    <span className="text-xs font-body text-on-surface flex-1">{a.label}</span>
                    <span className="material-symbols-outlined text-on-surface-variant/40" style={{ fontSize: "13px" }}>chevron_right</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <PaymentPortal role="employer" />
      </div>
    </div>
  );
}

// ─── Freelancer Dashboard ─────────────────────────────────────────────────────

function FreelancerDashboard({ onSwitch, onOpenAgent }: { onSwitch: () => void; onOpenAgent: (brief?: string) => void }) {
  const [pitchExpanded, setPitchExpanded] = useState(false);
  const d = FREELANCER;

  return (
    <div className="min-h-screen bg-surface-gray">
      <DashTopBar role="freelancer" onSwitch={onSwitch} />

      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-8">

        {/* Welcome + verified */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-7">
          <div>
            <h1 className="text-2xl font-bold font-headline text-on-surface mb-0.5">
              Welcome back, {d.name}
            </h1>
            <p className="text-sm font-body text-on-surface-variant">
              Your AI agent found <strong className="text-electric-violet">3 new matches</strong> while you were away.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-electric-violet/8 border border-electric-violet/20 px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>verified</span>
            <span className="text-xs font-semibold font-body text-electric-violet">
              {d.skill} · {d.score}/100 · {d.band}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {d.stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-border-crisp p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-electric-violet/8 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "18px", fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold font-headline text-on-surface leading-none">{s.value}</p>
                <p className="text-[11px] font-body text-on-surface-variant mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-5">

            {/* New matches */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>person_search</span>
                  <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">New Matches For You</h2>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
                  <span className="text-[10px] font-semibold font-body text-electric-violet">AI-matched</span>
                </div>
              </div>
              <div className="space-y-2">
                {d.matches.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl border transition-colors ${
                    m.hot ? "border-electric-violet/20 bg-electric-violet/5" : "border-border-crisp"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-bold font-headline text-on-surface">{m.title}</p>
                          {m.hot && <span className="text-[9px] font-semibold bg-electric-violet text-white px-1.5 py-0.5 rounded-full">Hot</span>}
                        </div>
                        <p className="text-xs font-body text-on-surface-variant">{m.company} · {m.budget}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold font-headline text-electric-violet leading-none">{m.fit}%</p>
                        <p className="text-[10px] font-body text-on-surface-variant">fit</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-body text-on-surface-variant">{m.posted}</span>
                      <button onClick={() => onOpenAgent(m.title)} className="text-[11px] font-semibold font-body text-electric-violet hover:opacity-70 transition-opacity">
                        View AI pitch →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest AI pitch */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>edit_note</span>
                <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Your Latest AI Pitch</h2>
                <span className="text-[10px] font-body text-on-surface-variant ml-auto">2h ago · Fintech Startup</span>
              </div>
              <p className={`text-sm font-body text-on-surface leading-relaxed whitespace-pre-wrap ${!pitchExpanded ? "line-clamp-4" : ""}`}>
                {d.pitch}
              </p>
              <button
                onClick={() => setPitchExpanded(e => !e)}
                className="mt-2 text-xs font-semibold font-body text-electric-violet hover:opacity-70 transition-opacity"
              >
                {pitchExpanded ? "Show less ↑" : "Read full pitch →"}
              </button>
              <div className="mt-3 pt-3 border-t border-border-crisp flex items-center gap-2">
                <button onClick={() => onOpenAgent()} className="text-xs font-semibold font-body text-white bg-electric-violet px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                  Generate new pitch
                </button>
                <span className="text-[11px] font-body text-on-surface-variant">or run the full AI Agent →</span>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* AI Agent status */}
            <div className="bg-tech-blue-deep rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
                <span className="text-xs font-semibold font-body text-white/55 uppercase tracking-widest">Your AI Agent</span>
              </div>
              <p className="text-sm font-bold font-headline text-white mb-1">Active — scanning for you</p>
              <p className="text-xs font-body text-white/40 mb-4 leading-relaxed">
                Scans every new job post, pitches you automatically to the right fits, and books calls on your behalf.
              </p>
              <div className="space-y-2 mb-4">
                {d.agentStats.map(s => (
                  <div key={s.label} className="flex items-center gap-2 bg-white/6 rounded-lg px-3 py-2">
                    <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "13px" }}>{s.icon}</span>
                    <span className="text-xs font-body text-white/55 flex-1">{s.label}</span>
                    <span className="text-xs font-bold font-headline text-white">{s.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onOpenAgent()} className="flex items-center justify-center gap-2 w-full bg-electric-violet text-white font-semibold font-body text-xs py-2.5 rounded-full hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined" style={{ fontSize: "13px", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                See agent in action →
              </button>
            </div>

            {/* Sparks for you */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Sparks For You</h2>
                </div>
                <Link href="/sparks" className="text-xs font-semibold font-body text-electric-violet hover:opacity-70 transition-opacity">See all →</Link>
              </div>
              <div className="space-y-2">
                {d.sparks.map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-gray">
                    <p className="text-xs font-semibold font-body text-on-surface mb-1.5">{s.title}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold font-body bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{s.budget}</span>
                      <span className="text-[10px] font-semibold font-body bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s.timeline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming calls */}
            <div className="bg-white rounded-2xl border border-border-crisp p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
                <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">Upcoming Calls</h2>
              </div>
              {d.calls.map((c, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface-gray">
                  <p className="text-xs font-semibold font-body text-on-surface mb-0.5">{c.date}</p>
                  <p className="text-xs font-body text-on-surface-variant">{c.company} · {c.topic}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <PaymentPortal role="freelancer" />
      </div>
    </div>
  );
}

// ─── Payment Portal ───────────────────────────────────────────────────────────

function PaymentPortal({ role }: { role: "employer" | "freelancer" }) {
  const [addOpen, setAddOpen] = useState(false);

  const employerTx = [
    { desc: "Alex Kim — React Dashboard hire",  amount: "$880",    status: "paid",    date: "Jun 14" },
    { desc: "3 candidates matched · Node.js",   amount: "$650",    status: "paid",    date: "Jun 10" },
    { desc: "Product Designer hire",            amount: "$720",    status: "pending", date: "Due Jun 20" },
    { desc: "Platform fee · May 2026",          amount: "$199",    status: "paid",    date: "May 31" },
  ];

  const freelancerTx = [
    { desc: "Fintech Dashboard project",   amount: "+$2,400", status: "paid",    date: "Jun 12", via: "Stripe" },
    { desc: "SaaS onboarding design",      amount: "+$1,200", status: "paid",    date: "Jun 5",  via: "USDC"   },
    { desc: "E-commerce redesign",         amount: "+$890",   status: "pending", date: "In review"             },
    { desc: "API documentation · Spark",  amount: "+$250",   status: "paid",    date: "Jun 1",  via: "USDC"   },
  ];

  const txs = role === "employer" ? employerTx : freelancerTx;

  return (
    <div className="mt-6 bg-white rounded-2xl border border-border-crisp p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-electric-violet"
            style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}
          >
            {role === "employer" ? "credit_card" : "savings"}
          </span>
          <h2 className="text-xs font-semibold font-body text-electric-violet uppercase tracking-widest">
            {role === "employer" ? "Billing & Payments" : "Payouts & Earnings"}
          </h2>
        </div>
        <button
          onClick={() => setAddOpen(o => !o)}
          className="flex items-center gap-1 text-xs font-semibold font-body text-electric-violet hover:opacity-70 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{addOpen ? "remove" : "add"}</span>
          Add method
        </button>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">

        {/* Payment method cards */}
        <div className="space-y-3">
          <p className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-2">
            {role === "employer" ? "Payment methods" : "Payout methods"}
          </p>

          {/* Stripe card */}
          <div className="relative rounded-2xl overflow-hidden p-4 text-white" style={{ background: "linear-gradient(135deg, #635BFF 0%, #9B8FFF 100%)" }}>
            <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/10" />
            <div className="flex items-center justify-between mb-5 relative z-10">
              <span className="text-[10px] font-bold font-body tracking-widest text-white/70 uppercase">Stripe</span>
              <span className="text-[9px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">Default</span>
            </div>
            <p className="text-sm font-mono tracking-[0.2em] mb-3 relative z-10">•••• •••• •••• 4242</p>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[11px] font-body text-white/65">Expires 08/27</span>
              <span className="text-base font-bold font-headline italic">VISA</span>
            </div>
          </div>

          {/* Crypto card */}
          <div className="relative rounded-2xl overflow-hidden p-4 text-white" style={{ background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)" }}>
            <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -right-2 top-8 w-16 h-16 rounded-full bg-white/5" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-[#627EEA] flex items-center justify-center text-[9px] font-bold text-white">Ξ</div>
                  <div className="w-5 h-5 rounded-full bg-[#2775CA] flex items-center justify-center text-[9px] font-bold text-white">$</div>
                </div>
                <span className="text-[10px] font-bold font-body tracking-widest text-white/60 uppercase">Crypto</span>
              </div>
              <div className="flex gap-1">
                <span className="text-[9px] font-bold bg-[#627EEA]/30 text-[#8EA4F8] px-1.5 py-0.5 rounded-full">ETH</span>
                <span className="text-[9px] font-bold bg-[#2775CA]/30 text-[#6EB0F5] px-1.5 py-0.5 rounded-full">USDC</span>
                <span className="text-[9px] font-bold bg-[#F7931A]/20 text-[#F7931A] px-1.5 py-0.5 rounded-full">BTC</span>
              </div>
            </div>
            <p className="text-[11px] font-mono text-white/80 mb-2 relative z-10">0x1a2b3c4d5e6f...f9e3</p>
            <p className="text-[10px] font-body text-white/40 relative z-10">Ethereum · Polygon · Base</p>
          </div>

          {/* Add method picker */}
          {addOpen && (
            <div className="rounded-xl border border-dashed border-electric-violet/40 bg-electric-violet/5 p-4 animate-fadeup">
              <p className="text-xs font-semibold font-body text-on-surface mb-3">Choose a method</p>
              <div className="space-y-2">
                {[
                  { icon: "credit_card", label: "Stripe",        sub: "Credit / debit card", color: "#635BFF" },
                  { icon: "currency_bitcoin", label: "Crypto wallet", sub: "USDC, ETH, BTC",     color: "#F7931A" },
                ].map(m => (
                  <button
                    key={m.label}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white border border-border-crisp hover:border-electric-violet/40 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${m.color}18` }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px", color: m.color, fontVariationSettings: "'FILL' 1" }}>{m.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold font-body text-on-surface">{m.label}</p>
                      <p className="text-[10px] font-body text-on-surface-variant">{m.sub}</p>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/30 ml-auto" style={{ fontSize: "14px" }}>chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transaction list */}
        <div>
          <p className="text-[10px] font-semibold font-body text-on-surface-variant uppercase tracking-widest mb-3">
            {role === "employer" ? "Recent invoices" : "Recent payouts"}
          </p>
          <div className="space-y-2">
            {txs.map((tx, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface-gray hover:bg-electric-violet/5 transition-colors group">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  tx.status === "paid" ? "bg-green-50" : "bg-amber-50"
                }`}>
                  <span
                    className={`material-symbols-outlined ${tx.status === "paid" ? "text-green-600" : "text-amber-500"}`}
                    style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {tx.status === "paid" ? "check_circle" : "schedule"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold font-body text-on-surface line-clamp-1">{tx.desc}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] font-body text-on-surface-variant">{tx.date}</p>
                    {("via" in tx) && (() => {
                      const via = (tx as { via?: string }).via;
                      if (!via) return null;
                      return (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          via === "USDC" ? "bg-[#2775CA]/10 text-[#2775CA]" : "bg-[#635BFF]/10 text-[#635BFF]"
                        }`}>
                          {via}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-sm font-bold font-headline leading-none ${
                    role === "freelancer" && tx.status === "paid" ? "text-green-600" : "text-on-surface"
                  }`}>
                    {tx.amount}
                  </p>
                  <span className={`text-[9px] font-semibold mt-0.5 inline-block px-1.5 py-0.5 rounded-full ${
                    tx.status === "paid" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-600"
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Demo login picker ────────────────────────────────────────────────────────

function DemoLogin({ onSelect }: { onSelect: (r: "employer" | "freelancer") => void }) {
  return (
    <div className="min-h-screen bg-surface-gray flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-[12px] ai-match-gradient shadow-[0_4px_14px_rgba(91,79,207,0.35)]">
              <svg width="22" height="22" viewBox="0 0 512 512" aria-hidden="true">
                <g stroke="#fff" strokeWidth="44" strokeLinecap="round" fill="none">
                  <path d="M180 150 L180 362" /><path d="M332 150 L332 362" />
                </g>
                <circle cx="256" cy="256" r="32" fill="#fff" />
              </svg>
            </span>
            <span className="text-2xl font-bold font-headline tracking-tight text-on-surface leading-none">
              Hyrde
            </span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-electric-violet/10 border border-electric-violet/20 px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-violet animate-pulse" />
            <span className="text-[11px] font-semibold font-body text-electric-violet uppercase tracking-widest">Demo — no sign-in needed</span>
          </div>
          <h1 className="text-3xl font-bold font-headline text-on-surface mb-2">Choose your view</h1>
          <p className="font-body text-on-surface-variant text-sm">
            Explore the Hyrde dashboard as an employer or a freelancer.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              role: "employer" as const,
              icon: "business",
              title: "Employer",
              desc: "Post jobs, review AI shortlists, book interviews, track spend.",
            },
            {
              role: "freelancer" as const,
              icon: "engineering",
              title: "Freelancer",
              desc: "See your AI matches, pitches, Sparks, and earnings.",
            },
          ].map(opt => (
            <button
              key={opt.role}
              onClick={() => onSelect(opt.role)}
              className="group bg-white border border-border-crisp rounded-2xl p-6 text-left hover:border-electric-violet/50 hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-electric-violet/8 flex items-center justify-center mb-4 group-hover:bg-electric-violet/15 transition-colors">
                <span className="material-symbols-outlined text-electric-violet" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>{opt.icon}</span>
              </div>
              <h2 className="text-base font-bold font-headline text-on-surface mb-1.5">{opt.title}</h2>
              <p className="text-xs font-body text-on-surface-variant leading-relaxed">{opt.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-electric-violet">
                <span className="text-xs font-semibold font-body">Enter dashboard</span>
                <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>arrow_forward</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs font-body text-on-surface-variant mt-6">
          <Link href="/freelancer/join" className="text-electric-violet font-semibold hover:opacity-70 transition-opacity">
            Join for real →
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [role, setRole]             = useState<Role>(null);
  const [agentOpen, setAgentOpen]   = useState(false);
  const [agentBrief, setAgentBrief] = useState("");

  const openAgent = (brief?: string) => {
    setAgentBrief(brief ?? "");
    setAgentOpen(true);
  };

  return (
    <>
      {!role && <DemoLogin onSelect={setRole} />}
      {role === "employer" && (
        <EmployerDashboard onSwitch={() => setRole("freelancer")} onOpenAgent={openAgent} />
      )}
      {role === "freelancer" && (
        <FreelancerDashboard onSwitch={() => setRole("employer")} onOpenAgent={openAgent} />
      )}
      <AgentPanel open={agentOpen} onClose={() => setAgentOpen(false)} initialBrief={agentBrief} />
    </>
  );
}
