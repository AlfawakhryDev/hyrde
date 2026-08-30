import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import QuoteClient from "./QuoteClient";

export const metadata: Metadata = {
  title: "Quote & Gate",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// Internal pricing/gate tool — the cost tracker's Quote Calculator in the app.
// Admin-only, same gate as the rest of /admin.
export default async function Page() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/quote");

  const { data: isAdmin } = await supabase.rpc("am_i_admin");
  if (!isAdmin) redirect("/dashboard");

  return <QuoteClient />;
}
