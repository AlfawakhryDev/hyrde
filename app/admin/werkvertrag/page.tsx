import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import WerkvertragClient from "./WerkvertragClient";

export const metadata: Metadata = {
  title: "Werkvertrag-Generator",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Internal ops tool (CLAUDE.md §8 item 3). Admin-only — same gate as the rest of
// /admin. robots.txt already disallows /admin.
export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/werkvertrag");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  return <WerkvertragClient />;
}
