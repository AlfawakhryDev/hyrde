import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, mode, display_name, bio, avatar_url, payout_method, payout_handle")
    .eq("id", user.id)
    .maybeSingle();

  // No mode picked yet (fresh signup, or account created on mobile) → onboard.
  if (!profile?.mode) redirect("/onboarding");

  const { data: vettings } = await supabase
    .from("vettings")
    .select("category, band, score")
    .eq("user_id", user.id)
    .eq("status", "passed");

  return (
    <DashboardClient
      userId={user.id}
      email={user.email ?? ""}
      initialProfile={profile}
      vettedBadges={vettings ?? []}
    />
  );
}
