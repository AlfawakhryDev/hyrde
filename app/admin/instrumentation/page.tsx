import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import InstrumentationClient, { type Metrics } from "./InstrumentationClient";

export const metadata: Metadata = {
  title: "Instrumentation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Scope-accuracy dashboard: the estimate-vs-actual numbers the instrumentation
// layer (migrations 0015-0016) captures. scope_accuracy is the headline metric
// for investors. Defense in depth: this page redirects non-admins AND the
// instrumentation_metrics() RPC re-checks is_admin server-side.
export default async function InstrumentationPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/instrumentation");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  const { data, error } = await supabase.rpc("instrumentation_metrics");
  if (error) redirect("/dashboard");

  return <InstrumentationClient metrics={data as Metrics} />;
}
