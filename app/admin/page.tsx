import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";
import type { Subscription } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  // Admin RLS policy allows reading all subscriptions; join names for matching
  // against Airtm payment notes.
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const ids = [...new Set((subs ?? []).map(s => s.user_id))];
  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, display_name, company").in("id", ids)
    : { data: [] as { id: string; display_name: string | null; company: string | null }[] };

  const names = Object.fromEntries((profiles ?? []).map(p => [p.id, p.company || p.display_name || "—"]));

  return <AdminClient initialSubs={(subs ?? []) as Subscription[]} names={names} />;
}
