import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: priv }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("profile_private").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  if (!profile?.mode) redirect("/onboarding?next=/profile");

  return (
    <ProfileClient
      userId={user.id}
      email={user.email ?? ""}
      initialProfile={profile}
      initialPrivate={priv ?? null}
    />
  );
}
