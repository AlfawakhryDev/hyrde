import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isEmailVerified } from "@/lib/verified";
import VerifyEmailCard from "@/components/VerifyEmailCard";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

// The wall between signing up and using the app. The proxy sends anyone with
// an unconfirmed address here; this page is the only way back out.
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = next?.startsWith("/") && !next.startsWith("/verify") ? next : "/dashboard";

  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(dest)}`);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("email_verified_at")
    .eq("id", user.id)
    .maybeSingle();

  // Already done, or signed in through a provider that vouched for the address.
  // On a failed lookup the card is still the safe thing to show: confirming
  // again is harmless, being stranded on a page you cannot leave is not.
  if (!error && isEmailVerified(user.app_metadata?.provider, profile?.email_verified_at)) redirect(dest);

  return (
    <div className="mx-auto max-w-[440px] px-5 py-20">
      <VerifyEmailCard email={user.email ?? ""} next={dest} />
    </div>
  );
}
