import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import LeadsClient, { type Lead } from "./LeadsClient";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Phase 0 item 4 (ops dashboard). Admin-only. Reads every lead via the admin
// SELECT policy (am_i_admin), the same gate the rest of /admin uses.
export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/leads");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  const { data: leads } = await supabase
    .from("leads")
    .select("id, created_at, company, contact_name, email, phone, role, outcome, budget_range, timeline, status")
    .order("created_at", { ascending: false })
    .limit(500);

  return <LeadsClient initial={(leads ?? []) as Lead[]} />;
}
