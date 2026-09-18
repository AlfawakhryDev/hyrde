import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import CandidatesClient, { type CandidateRow } from "./CandidatesClient";

export const metadata: Metadata = { title: "Candidates", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Every freelancer, what is known about them, and the AI report.
//
// Defense in depth, the same shape as /admin/oversight: this page redirects
// non-admins, and candidate_index() re-checks is_admin inside the database.
// Neither is trusted alone.
export default async function CandidatesPage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/candidates");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  const { data: rows } = await supabase.rpc("candidate_index");

  return <CandidatesClient rows={(rows ?? []) as CandidateRow[]} />;
}
