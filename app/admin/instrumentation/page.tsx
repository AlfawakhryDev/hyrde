import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import InstrumentationClient, { type Metrics, type TaskRequest, type DemoRequest } from "./InstrumentationClient";

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

  // Demand signals — what clients tried to post (captured at /api/classify and
  // /api/brief), so churned intent is visible here. Admin-gated via RLS.
  const { data: reqs } = await supabase
    .from("task_requests")
    .select("id, created_at, user_id, raw_text, kind, archetype, status")
    .order("created_at", { ascending: false })
    .limit(50);
  const requests = (reqs ?? []) as TaskRequest[];

  const ids = [...new Set(requests.map(r => r.user_id).filter(Boolean))] as string[];
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, display_name, company").in("id", ids)
    : { data: [] as { id: string; display_name: string | null; company: string | null }[] };
  const names = Object.fromEntries((profiles ?? []).map(p => [p.id, p.company || p.display_name || "—"]));

  // Demo requests — high-intent leads from the "Book a demo" button.
  const { data: demoRows } = await supabase
    .from("demo_requests")
    .select("id, created_at, name, email, company, note, source, status")
    .order("created_at", { ascending: false })
    .limit(50);
  const demos = (demoRows ?? []) as DemoRequest[];

  return <InstrumentationClient metrics={data as Metrics} requests={requests} names={names} demos={demos} />;
}
