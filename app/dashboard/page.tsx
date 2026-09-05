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
    .select("id, mode, display_name, bio, avatar_url, email_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  // No mode picked yet (fresh signup, or account created on mobile) → onboard.
  if (!profile?.mode) redirect("/onboarding");

  // Payout details are no longer world-readable — fetch the owner's own via RPC.
  const { data: payout } = await supabase.rpc("get_my_payout");

  const { data: vettings } = await supabase
    .from("vettings")
    .select("category, band, score")
    .eq("user_id", user.id)
    .eq("status", "passed");

  return (
    <DashboardClient
      userId={user.id}
      email={user.email ?? ""}
      emailVerified={!!profile?.email_verified_at}
      initialProfile={{
        ...profile,
        payout_method: payout?.payout_method ?? null,
        payout_handle: payout?.payout_handle ?? null,
      }}
      vettedBadges={vettings ?? []}
    />
  );
}
