import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import VettingClient from "./VettingClient";

export const metadata: Metadata = {
  title: "Get vetted — the AI skill interview",
  description:
    "Hyrde vets every freelancer with an adaptive AI interview: scenario judgment, live work samples, and probing follow-ups, graded strictly. Pass it and clients see your verified badge.",
  alternates: { canonical: "/vetting" },
};

export const dynamic = "force-dynamic";

export default async function VettingPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Logged-out: explain the system, then funnel to signup.
  if (!user) {
    return (
      <div className="mx-auto max-w-[720px] px-5 md:px-6 py-16">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border-crisp text-xs font-medium text-on-surface-variant mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-electric-violet" />
          How &ldquo;pre-vetted&rdquo; actually works
        </div>
        <h1 className="text-[40px] md:text-[52px] font-light text-on-surface leading-[1.04] tracking-[-0.035em] mb-5">
          A 10-minute AI interview.<br />Graded like a senior practitioner.
        </h1>
        <p className="text-[16px] text-on-surface-variant leading-relaxed mb-8 max-w-[560px]">
          No badges you can buy, no reviews you can farm. Every Pilot on Hyrde passes an
          adaptive interview: scenario judgment, a probing follow-up on your own answers,
          a live work sample, and a real-project deep-dive — scored 0–100 by AI against
          a strict rubric. Generic, templated answers are detected and capped.
        </p>
        <ol className="space-y-3 mb-10">
          {[
            ["Scenario", "A judgment call from real work in your category."],
            ["The probe", "The interviewer digs into the vaguest part of your answer."],
            ["Work sample", "You produce a small piece of actual work, live."],
            ["Track record", "A shipped project, with specifics that check out."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 items-start">
              <span className="w-6 h-6 shrink-0 rounded-full bg-electric-violet/10 text-electric-violet text-xs font-semibold flex items-center justify-center mt-0.5">{i + 1}</span>
              <p className="text-sm text-on-surface-variant"><strong className="text-on-surface font-medium">{t}.</strong> {d}</p>
            </li>
          ))}
        </ol>
        <div className="flex gap-3">
          <Link href="/signup?next=%2Fvetting" className="h-10 inline-flex items-center px-6 rounded-full bg-on-surface text-inverse-on-surface text-sm font-medium hover:opacity-90 transition-opacity">
            Take the interview
          </Link>
          <Link href="/login?next=%2Fvetting" className="h-10 inline-flex items-center px-6 rounded-full border border-border-crisp text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            Log in
          </Link>
        </div>
      </div>
    );
  }

  // Vetting is only for freelancer accounts. Clients hire; they don't get vetted.
  const { data: profile } = await supabase
    .from("profiles")
    .select("mode")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/onboarding");
  if (profile.mode === "client") redirect("/dashboard");

  const { data: vettings } = await supabase
    .from("vettings")
    .select("id, category, status, score, band, completed_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <VettingClient existing={vettings ?? []} />;
}
