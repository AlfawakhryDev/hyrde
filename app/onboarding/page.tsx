"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function Onboarding() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [busy, setBusy] = useState<"client" | "pilot" | null>(null);
  const [error, setError] = useState("");

  async function choose(mode: "client" | "pilot") {
    setBusy(mode);
    setError("");
    const supabase = supabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      mode,
      display_name:
        (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "New user",
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setError(error.message);
      setBusy(null);
      return;
    }
    // Fast path: pilots go straight to the vetting interview (their activation
    // moment); clients land on the dashboard with the composer ready.
    router.push(mode === "pilot" && next === "/dashboard" ? "/vetting" : next);
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-5xl font-light tracking-[-0.03em] text-on-surface mb-4">How will you use Hyrde?</h1>
        <p className="text-base font-body text-on-surface-variant mb-10">
          This sets up your account. Hiring and freelancing are separate — pick the one that fits you.
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          <button
            onClick={() => choose("client")}
            disabled={busy !== null}
            className="group text-left bg-surface-container-lowest border-2 border-border-crisp rounded-3xl p-8 hover:border-electric-violet hover:shadow-[0_8px_40px_rgba(91,79,207,0.15)] transition-all disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-electric-violet mb-4" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>
              business_center
            </span>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">
              {busy === "client" ? "Setting up…" : "I need work done"}
            </h2>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
              Post a task and the AI matches it to the best interview-vetted specialist — no bidding, no proposal spam. AI reviews the work before you pay. Free during early access.
            </p>
          </button>

          <button
            onClick={() => choose("pilot")}
            disabled={busy !== null}
            className="group text-left bg-surface-container-lowest border-2 border-border-crisp rounded-3xl p-8 hover:border-electric-violet hover:shadow-[0_8px_40px_rgba(91,79,207,0.15)] transition-all disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-electric-violet mb-4" style={{ fontSize: "36px", fontVariationSettings: "'FILL' 1" }}>
              rocket_launch
            </span>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-on-surface mb-2">
              {busy === "pilot" ? "Setting up…" : "I want to earn"}
            </h2>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
              Pass one AI skill interview, then work gets matched to you automatically — with a deadline and pay. Finish it, get paid. No bidding, no proposals.
            </p>
          </button>
        </div>

        {error && <p className="text-sm font-body text-error mt-6">{error}</p>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <Onboarding />
    </Suspense>
  );
}
