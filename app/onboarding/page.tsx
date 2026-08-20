"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useT } from "@/components/I18nProvider";

function Onboarding() {
  const t = useT();
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

    // Write via a SECURITY DEFINER RPC: a direct profiles upsert trips the
    // is_admin/payout column lockdown ("permission denied for table profiles").
    const { error } = await supabase.rpc("upsert_my_profile", {
      p_mode: mode,
      p_display_name:
        (user.user_metadata?.display_name as string) || user.email?.split("@")[0] || "New user",
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
        <h1 className="text-5xl font-light tracking-[-0.03em] text-on-surface mb-4">{t("onboarding.title")}</h1>
        <p className="text-base font-body text-on-surface-variant mb-10">
          {t("onboarding.subtitle")}
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
              {busy === "client" ? t("onboarding.settingUp") : t("onboarding.clientTitle")}
            </h2>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
              {t("onboarding.clientBody")}
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
              {busy === "pilot" ? t("onboarding.settingUp") : t("onboarding.pilotTitle")}
            </h2>
            <p className="text-sm font-body text-on-surface-variant leading-relaxed">
              {t("onboarding.pilotBody")}
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
