"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

// 0–4 score: length, upper+lower, digit, symbol. Length gates everything.
function passwordStrength(pw: string): { score: number; label: string; tone: string } {
  if (!pw) return { score: 0, label: "", tone: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(4, score);
  if (pw.length < 6) score = Math.min(1, score);
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];
  const tones = [
    "text-error", "text-error",
    "text-amber-600 dark:text-amber-400",
    "text-emerald-600 dark:text-emerald-400",
    "text-emerald-600 dark:text-emerald-400",
  ];
  return { score, label: labels[score], tone: tones[score] };
}

const BAR_COLORS = ["bg-error", "bg-error", "bg-amber-500", "bg-emerald-500", "bg-emerald-500"];

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.3 0-11.5-5.2-11.5-11.5S17.7 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.5 6.2 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.6 18.9 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.9l5.7-5.7C33.5 6.2 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43.5c5.2 0 9.6-1.7 12.8-4.6l-5.9-5c-1.9 1.4-4.3 2.1-6.9 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.1 16.2 43.5 24 43.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.5l5.9 5c-.4.4 6.5-4.8 6.5-14.5 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.7 12.9c0-2.4 2-3.6 2-3.7-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.6.9-.7 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2-.1 1.7-.8 3.1-.8s1.9.8 3.1.8c1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.6-3.9zM14.4 5.6c.6-.8 1.1-1.9 1-3.1-.9 0-2.1.6-2.8 1.5-.6.7-1.2 1.9-1 3 1.1 0 2.1-.6 2.8-1.4z"/>
    </svg>
  );
}

// "Continue with Apple" is coded and ready — flip to true once the Apple
// Developer Services ID + secret are configured in Supabase (needs the $99
// Apple Developer Program; see Supabase dashboard → Auth → Providers → Apple).
const APPLE_ENABLED = false;

// Soft work-email nudge for clients: warn on free/personal domains, allow anyway.
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "outlook.com",
  "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com", "mac.com",
  "aol.com", "proton.me", "protonmail.com", "mail.com", "gmx.com", "gmx.net",
  "zoho.com", "yandex.com", "yandex.ru", "inbox.com", "fastmail.com",
]);
const isFreeEmail = (email: string) =>
  FREE_EMAIL_DOMAINS.has(email.split("@")[1]?.toLowerCase().trim() ?? "");

type Role = "client" | "pilot";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const nextQS = next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oauthBusy, setOauthBusy] = useState<"google" | "github" | "apple" | null>(null);
  const [error, setError] = useState("");
  const [checkEmail, setCheckEmail] = useState(false);
  // Signup picks a side first — client or freelancer — before anything else.
  const [role, setRole] = useState<Role | null>(mode === "signup" ? null : "client");
  // Soft work-email gate: clients on a personal domain confirm once to proceed.
  const [personalOk, setPersonalOk] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const needsWorkEmailNudge =
    mode === "signup" && role === "client" && emailValid && isFreeEmail(email) && !personalOk;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    // Soft force: first submit with a personal email (as a client) pauses here —
    // a second, explicit click proceeds anyway.
    if (needsWorkEmailNudge) return;
    setBusy(true);
    const supabase = supabaseBrowser();

    try {
      if (mode === "signup") {
        if (strength.score < 2) {
          setError("Pick a stronger password — at least 8 characters, ideally with a number or symbol.");
          setBusy(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${location.origin}/auth/callback?role=${role ?? ""}&next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation is on — tell them to check their inbox.
          setCheckEmail(true);
          return;
        }
        // The account type was chosen up front — persist it and skip onboarding.
        await supabase.from("profiles").upsert({
          id: data.session.user.id,
          mode: role,
          display_name: name || email.split("@")[0],
        });
        // Freelancers go straight to their activation moment: the interview.
        router.push(role === "pilot" && next === "/dashboard" ? "/vetting" : next);
        router.refresh();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong — try again.";
      // A Google/GitHub/Apple-only account has no password, so signInWithPassword
      // returns "Invalid login credentials" — the exact same generic message as a
      // wrong password (Supabase deliberately won't reveal which, to prevent email
      // enumeration). Nudge toward social login on any failed email login so OAuth
      // users don't get stuck thinking they're locked out.
      if (mode === "login" && /invalid login credentials/i.test(msg)) {
        setError("That email and password didn't match. If you signed up with Google, GitHub, or Apple, use one of the buttons above instead — those accounts don't have a password.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  // Social login via Supabase's native OAuth — same session/profile/RLS as email
  // signup, no separate auth provider. On signup the chosen role rides along in
  // the callback URL; the callback persists it for first-time accounts.
  async function oauth(provider: "google" | "github" | "apple") {
    setError("");
    setBusy(true);
    setOauthBusy(provider);
    const roleQS = mode === "signup" && role ? `role=${role}&` : "";
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${location.origin}/auth/callback?${roleQS}next=${encodeURIComponent(next)}` },
    });
    // On success the browser navigates to the provider — no need to unset busy.
    if (error) {
      setError(error.message);
      setBusy(false);
      setOauthBusy(null);
    }
  }

  if (checkEmail) {
    return (
      <div className="text-center">
        <span className="material-symbols-outlined text-electric-violet mb-4" style={{ fontSize: "44px" }}>
          mark_email_unread
        </span>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-on-surface mb-2">Check your email</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          We sent a confirmation link to <strong className="text-on-surface">{email}</strong>.
          Click it and you&apos;ll land right in your dashboard.
        </p>
      </div>
    );
  }

  // ── Signup, step 1: pick a side. Account types are fixed — client OR freelancer.
  if (mode === "signup" && role === null) {
    return (
      <div className="flex flex-col gap-3">
        {(
          [
            {
              r: "client" as Role,
              icon: "business_center",
              title: "I'm hiring",
              body: "Post a task and the AI assigns the best vetted specialist — no proposals, no browsing.",
            },
            {
              r: "pilot" as Role,
              icon: "rocket_launch",
              title: "I want to work",
              body: "Pass one AI skill interview, then matched work comes to you — with a deadline and pay.",
            },
          ]
        ).map(o => (
          <button
            key={o.r}
            type="button"
            onClick={() => setRole(o.r)}
            className="group text-left border border-border-crisp rounded-2xl p-5 hover:border-electric-violet/60 hover:bg-surface-container-low transition-all"
          >
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-electric-violet mt-0.5" style={{ fontSize: "26px", fontVariationSettings: "'FILL' 1" }}>
                {o.icon}
              </span>
              <div className="flex-1 min-w-0">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[16px] font-semibold tracking-[-0.01em] text-on-surface">{o.title}</span>
                  <span className="text-on-surface-variant/50 group-hover:text-on-surface group-hover:translate-x-0.5 transition-all" aria-hidden="true">→</span>
                </span>
                <span className="block text-[13px] text-on-surface-variant leading-relaxed mt-1">{o.body}</span>
              </div>
            </div>
          </button>
        ))}
        <p className="text-sm text-on-surface-variant text-center mt-3">
          Already have an account?{" "}
          <Link href={`/login${nextQS}`} className="text-electric-violet font-medium hover:opacity-80">Log in</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Chosen side — one account type per account, changeable until submit */}
      {mode === "signup" && role !== null && (
        <div className="flex items-center justify-between -mt-1 mb-1">
          <span className="inline-flex items-center gap-2 h-7 px-3 rounded-full bg-on-surface text-inverse-on-surface text-[12px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A99EE8]" aria-hidden="true" />
            {role === "client" ? "Signing up to hire" : "Signing up to work"}
          </span>
          <button
            type="button"
            onClick={() => { setRole(null); setPersonalOk(false); }}
            className="text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span aria-hidden="true">↳</span> Change
          </button>
        </div>
      )}

      {/* Social auth — Supabase OAuth, same account system as email */}
      <div className="flex flex-col gap-2.5">
        {(
          [
            { p: "google" as const, icon: <GoogleIcon />, label: "Continue with Google", show: true },
            { p: "github" as const, icon: <GithubIcon />, label: "Continue with GitHub", show: true },
            { p: "apple" as const, icon: <AppleIcon />, label: "Continue with Apple", show: APPLE_ENABLED },
          ]
        ).filter(b => b.show).map(b => (
          <button
            key={b.p}
            type="button"
            onClick={() => oauth(b.p)}
            disabled={busy}
            className="flex items-center justify-center gap-2.5 border border-border-crisp rounded-full px-6 py-3 text-sm font-medium text-on-surface bg-surface-bright hover:bg-surface-container transition-colors disabled:opacity-60"
          >
            {oauthBusy === b.p ? (
              <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-on-surface/20 border-t-on-surface animate-spin" aria-hidden="true" />
            ) : (
              b.icon
            )}
            {oauthBusy === b.p ? "Redirecting…" : b.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 my-1" aria-hidden="true">
        <span className="h-px flex-1 bg-border-crisp" />
        <span className="text-[12px] text-on-surface-variant">or continue with email</span>
        <span className="h-px flex-1 bg-border-crisp" />
      </div>

      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium text-on-surface">Name</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className="border border-border-crisp rounded-lg px-4 py-3 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-on-surface">Email</span>
        <div className="relative">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className="w-full border border-border-crisp rounded-lg px-4 py-3 pr-10 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10"
          />
          {email.length > 2 && (
            <span
              className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 ${
                emailValid ? "text-emerald-500" : "text-on-surface-variant/50"
              }`}
              style={{ fontSize: "17px" }}
              aria-hidden="true"
            >
              {emailValid ? "check_circle" : "pending"}
            </span>
          )}
        </div>

        {/* Soft work-email nudge — clients can proceed, but must say so */}
        {mode === "signup" && role === "client" && emailValid && isFreeEmail(email) && (
          <div className="mt-1.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
            <p className="text-[13px] text-on-surface leading-relaxed">
              That looks like a personal email.{" "}
              <span className="text-on-surface-variant">
                Specialists trust work emails faster — briefs and payments feel legit from day one.
              </span>
            </p>
            {!personalOk ? (
              <button
                type="button"
                onClick={() => setPersonalOk(true)}
                className="mt-2 text-[12.5px] font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span aria-hidden="true">↳</span> Continue with this email anyway
              </button>
            ) : (
              <p className="mt-1.5 text-[12px] text-on-surface-variant">Okay — continuing with a personal email.</p>
            )}
          </div>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-on-surface">Password</span>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full border border-border-crisp rounded-lg px-4 py-3 pr-11 text-sm text-on-surface bg-surface-bright focus:outline-none focus:border-electric-violet focus:ring-2 focus:ring-electric-violet/10"
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {showPw ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>

        {/* Strength meter — signup only */}
        {mode === "signup" && password.length > 0 && (
          <div className="mt-1">
            <div className="flex gap-1.5 mb-1.5">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= strength.score ? BAR_COLORS[strength.score] : "bg-surface-container-high"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${strength.tone}`}>{strength.label}</span>
              <span className="text-[11px] text-on-surface-variant">
                {password.length < 8
                  ? "8+ characters"
                  : !/\d/.test(password)
                  ? "Add a number"
                  : !/[^A-Za-z0-9]/.test(password) && strength.score < 4
                  ? "Add a symbol for strong"
                  : " "}
              </span>
            </div>
          </div>
        )}
      </label>

      {error && (
        <p className="text-sm text-error bg-error-container/40 border border-error/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || needsWorkEmailNudge}
        className="mt-1 flex items-center justify-center gap-2 bg-electric-violet text-white font-medium text-sm px-6 py-3.5 rounded-full hover:opacity-90 transition disabled:opacity-60"
      >
        {busy && (
          <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true" />
        )}
        {busy ? "One moment…" : mode === "signup" ? "Create account" : "Log in"}
      </button>

      <p className="text-sm text-on-surface-variant text-center mt-2">
        {mode === "signup" ? (
          <>Already have an account?{" "}
            <Link href={`/login${nextQS}`} className="text-electric-violet font-medium hover:opacity-80">Log in</Link>
          </>
        ) : (
          <>New to Hyrde?{" "}
            <Link href={`/signup${nextQS}`} className="text-electric-violet font-medium hover:opacity-80">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
