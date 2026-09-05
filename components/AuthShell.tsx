"use client";
import { Suspense } from "react";
import { useT } from "@/components/I18nProvider";
import { HyrdeMark } from "@/components/Logo";
import HeroBackdrop from "@/components/home/HeroBackdrop";

// ── Split-screen auth shell (o11 grammar) ─────────────────────────────────────
// Dark cinematic brand panel on the left (with the interactive grid), a clean
// light form panel on the right. Matches the homepage hero language.
export default function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: React.ReactNode;
}) {
  // Copy is derived from the mode rather than passed in, so these two pages
  // cannot drift out of the dictionary the way hardcoded props did.
  const t = useT();
  const k = (s: string) => t(`auth.${mode}${s}`);
  const bullets = [k("B1"), k("B2"), k("B3")];

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-136px)]">
      {/* Left — dark brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0A0A0B] p-12 m-4">
        <HeroBackdrop />
        <div className="relative flex items-center gap-2 text-white">
          <HyrdeMark size={22} />
          <span className="text-[18px] font-semibold tracking-[-0.02em] leading-none">hyrde</span>
        </div>

        <div className="relative">
          <h2 className="font-light text-white text-[clamp(30px,3.2vw,44px)] leading-[1.05] tracking-[-0.03em] max-w-[15ch]">
            {t("auth.panelPre")}{" "}
            <span className="inline-block bg-[#ffffff] text-[#0A0A0B] rounded-xl px-2.5 leading-[1.15] -rotate-1">{t("auth.panelHere")}</span>
          </h2>
          <ul className="mt-8 space-y-3 max-w-[380px]">
            {bullets.map(b => (
              <li key={b} className="flex items-start gap-3 text-[14px] text-white/60 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A99EE8] shrink-0 mt-2" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-white/35">
          {t("auth.panelFoot")}
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex items-center justify-center px-6 py-16 md:py-20">
        <div className="w-full max-w-[400px]">
          <p className="text-[13px] font-medium text-electric-violet mb-3">{k("Eyebrow")}</p>
          <h1 className="text-[34px] md:text-[40px] font-light tracking-[-0.035em] text-on-surface leading-[1.05] mb-2.5">
            {k("Title")}
          </h1>
          <p className="text-[14px] text-on-surface-variant leading-relaxed mb-8">{k("Sub")}</p>
          <Suspense>{children}</Suspense>
        </div>
      </div>
    </div>
  );
}
