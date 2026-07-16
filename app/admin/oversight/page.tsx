import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import OversightClient, { type OverviewTask, type OverviewStats } from "./OversightClient";

export const metadata: Metadata = {
  title: "Oversight",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Founder/dev ops oversight — read-only. Every match, who it went to, and their
// vetting for that task's category, so a $500 task landing with an unqualified
// freelancer gets caught by hand at this early stage.
//
// Defense in depth: this page redirects non-admins, AND the admin_overview()
// RPC it calls independently re-checks is_admin server-side (migration 0012).
// Neither alone is trusted.
export default async function OversightPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/oversight");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  const { data, error } = await supabase.rpc("admin_overview");
  if (error) {
    // The RPC self-gates; a non-admin can't reach here anyway, but fail closed.
    redirect("/dashboard");
  }

  const payload = data as { tasks: OverviewTask[]; stats: OverviewStats };

  return <OversightClient tasks={payload.tasks ?? []} stats={payload.stats} />;
}
