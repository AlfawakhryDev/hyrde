import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import BillingClient from "./BillingClient";
import type { Subscription } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Plans & billing",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/billing");

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("mode, display_name").eq("id", user.id).maybeSingle(),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  if (!profile?.mode) redirect("/onboarding?next=/billing");
  // Freelancers are free — billing is a client concern.
  if (profile.mode === "pilot") redirect("/dashboard");

  return <BillingClient userId={user.id} initialSubs={(subs ?? []) as Subscription[]} />;
}
